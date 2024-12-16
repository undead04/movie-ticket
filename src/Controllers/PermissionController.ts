import { NextFunction,Request,Response } from "express";
import dataService from "../Service/DataService";
import { Permission } from "../Data/Permission";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";

const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    let data=await (await dataService.getBuilderQuery(Permission,'permission')).getMany()
    res.status(200).json(RepositoryDTO.WithData(200,data))

}
const permissionController={get}
export default permissionController