import { NextFunction,Request,Response } from "express";
import AppRole, { IGroupRoleModel } from "../Model/GroupRoleModel";
import dataService from "../Service/DataService";
import { GroupRole } from "../Data/GroupRole";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import dataSource from "../DataSource";

const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {page,pageSize}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        let queryBuilder=await dataService.getBuilderQuery(GroupRole,'groupRole')
        const data=await dataService.getAllPagination(GroupRole,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
      
        const id=Number(req.params.id);
        const data=await dataService.getBy(GroupRole,'groupRole',id);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy vai trò này")) return
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }
}

const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const data=await dataService.getBy(GroupRole,'groupRole',id);
       if(await dataController.IsNotFound(res,data,"Không tìm thấy vai trò này")) return
        await dataService.remove(GroupRole,data)
        res.status(200).json(RepositoryDTO.Success("Xóa nhóm vai trò thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const model:IGroupRoleModel=req.body
        res.status(200).json("Tạo thể loại phim thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const countRole=await(await dataService.getBuilderQuery(GroupRole)).getCount()
        if(countRole>0) return
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            await dataService.createArray(GroupRole,
                [
                    {
                        name:AppRole.Admin,
                        description:"Là Admin"
                    },
                    {
                        name:AppRole.User,
                        description:"Là người dùng"
                    }
                ]
                ,transactionEntityManager
            )
        })
        res.status(200).json("Tạo thể loại phim thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IGroupRoleModel=req.body;
        const data=await dataService.getBy(GroupRole,'groupRole',id)
        if(await dataController.IsNotFound(res,model,"Không tìm thấy nhóm vai trò này")) return;
        await dataService.update(GroupRole,data,model)
        res.status(200).json("Cập nhập nhóm vai trò thành công thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}

const groupRoleController={
    create,get,remove,getAllWithFilterAndPagination,update,createArray
}
export default groupRoleController