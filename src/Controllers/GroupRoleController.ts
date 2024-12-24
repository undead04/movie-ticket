import { NextFunction,Request,Response } from "express";
import AppRole from "../Model/GroupRoleModel";
import { GroupRole } from "../Data/GroupRole";
import DataService from '../Service/DataService';
import dataSource from "../DataSource";
import { AutoBind } from "../utils/AutoBind";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";

export default class GroupRoleController{
    protected dataService:DataService<GroupRole>
    constructor(){
        this.dataService = new DataService(GroupRole,'groupRole')
    }
    @AutoBind
    async createArray(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const countRole=await(await this.dataService.createQueryBuilder()).getCount()
            if(countRole>0) return
            await dataSource.manager.transaction(async(transactionEntityManager)=>{
                await this.dataService.createArray(
                    [
                        {
                            name:AppRole.Admin,
                            description:"Là Admin"
                        },
                        {
                            name:AppRole.User,
                            description:"Là người dùng"
                        }
                    ],transactionEntityManager
                    
                )
            })
            res.status(200).json(RepositoryDTO.Success("Tạo vai trò thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
}