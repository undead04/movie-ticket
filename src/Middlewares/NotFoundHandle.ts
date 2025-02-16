import { NextFunction, Request, Response } from 'express';
import { RepositoryDTO } from '../utils/ReponseDTO';
import { IsDuplicatesWithSort } from '../utils/GenerationCode';
import { DeleteModel } from '../models/modelRequest/DeleteModel';
import { EntityTarget } from 'typeorm';
import BaseRepository from '../utils/BaseRepository';

async function isNotFound(id: number,entity:EntityTarget<any>,alias:string):Promise<boolean> {
    // Gọi service để tìm bản ghi theo ID
    const repo = new BaseRepository(entity,alias)
    const record = await (await repo.getBy(id)).getOne();
    // Kiểm tra nếu bản ghi không tồn tại
    if (record == null) {
      return true
    }
    // Nếu tồn tại, trả về false để tiếp tục xử lý
    return false;
  }
  
export const notFound = (entity:EntityTarget<any>,alias:string) => {
    return async (req:Request,res:Response,next:NextFunction)=>{
        try{
            const id = Number(req.params.id)
            if (!/^\d+$/.test(id.toString())) {
                return res.status(400).json(RepositoryDTO.Error(400,"Invalid ID format"));
                
            }
            if(await isNotFound(id,entity,alias)){
                return res.status(404).json(RepositoryDTO.Error(404,`Không tồn tại bản ghi này id = ${id}`))
                
            }
            next()
        }catch(error:any){
            console.log(error)
            return res.status(500).json(RepositoryDTO.Error(500,error))
        }
    }
}
export const notFoundArray = (entity:EntityTarget<any>,alias:string) => {
    return async (req:Request,res:Response,next:NextFunction)=>{
        try{
            const models:DeleteModel=req.body
            if(IsDuplicatesWithSort(models.ids)){
                return res.status(400).json(RepositoryDTO.Error(400,`Trong model có tên bị trùng`))
                
            }
            for (const id of models.ids) {
                if (await isNotFound(id, entity, alias)) {
                  return res.status(404).json(RepositoryDTO.Error(404, `Không tồn tại bản ghi này id = ${id}`));
                }
            }
            
            next()
        }catch(error:any){
            console.log(error)
            return res.status(500).json(RepositoryDTO.Error(500,error))
        }
    }
}




