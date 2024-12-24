import { NextFunction, Request, Response } from 'express';
import DataService from '../Service/DataService';
import { EntityTarget, ObjectLiteral } from 'typeorm';
import { RepositoryDTO } from '../Model/DTO/RepositoryDTO';
import { IDataDeleteModel } from '../Model/dataModel';
import { AutoBind } from '../utils/AutoBind';

// Function kiểm tra dữ liệu có tồn tại không
export default class ValidatorNotFoundMiddlewares<T extends ObjectLiteral>{
    dataService:DataService<T>
    messageNotFound:string
    constructor(entity:EntityTarget<T>,alias:string,messageNotFound:string){
        this.dataService=new DataService<T>(entity,alias);
        this.messageNotFound=messageNotFound
    }
    protected async validateNotFoud(id:number,res:Response){
        const record = await this.dataService.getBy(id)
            if(record==null){
                res.status(404).json(RepositoryDTO.Error(404,this.messageNotFound+` id = ${id}`))
                return true
            }
            return false
    }
    @AutoBind
    async IsNotFound(req:Request,res:Response,next:NextFunction){
        try{
            const id = Number(req.params.id);
            if (!/^\d+$/.test(id.toString())) {
                res.status(400).json(RepositoryDTO.Error(400,"Invalid ID format"));
                return
            }
            if(await this.validateNotFoud(id,res)) return
            next()
        }catch(error){
            console.log(error)
            res.status(500).json(error)
        }
    }
    @AutoBind
    async IsNotFoundArray(
        req:Request,
        res:Response,
        next:NextFunction
    ){
        const model:IDataDeleteModel=req.body
        for(const id of model.ids){
            if(await this.validateNotFoud(id,res)) return
        }
        next()
        
     }
}




