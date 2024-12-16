import { NextFunction,Request,Response } from "express";
import { IUserModel, UserModel } from "../Model/UserModel";
import dataService from "../Service/DataService";
import { User } from "../Data/User";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dataController from "./DataController";
import { GroupRole } from "../Data/GroupRole";
import AppRole from "../Model/GroupRoleModel";
const saltRounds = 10;
const login=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {email,password}=req.body
        const userData=await dataService.getBy(User,'user',email,'email',[
          {
            original:'user.groupRole',link: "groupRole"
          }
        ])
        if(userData==null){
          res.status(400).json(RepositoryDTO.Error(400,"Mật khẩu hoặc email sai"))
          return;
        }
        const isMatch:boolean= await bcrypt.compare(password,userData.password_hash);
        if(!isMatch){
          res.status(400).json(RepositoryDTO.Error(400,"Mật khẩu hoặc email sai"))
          return;
        }
        const result = jwt.sign({ id: userData.id, role:userData.groupRole.name }, 'authToken', { expiresIn: '1h' });
        res.cookie("authToken", result, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict', // Giảm thiểu CSRF
            maxAge: 3*60 * 60 * 1000 // 1 giờ
        }); 
        res.status(200).json(RepositoryDTO.Success("Đăng nhập thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }
}
const logout=(req:Request,res:Response,next:NextFunction)=>{
    try {
        // Xóa cookie authToken
        res.clearCookie('authToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        // Trả về phản hồi thành công
        res.status(200).json(RepositoryDTO.Success("Đăng xuất thành công"));
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đăng xuất' });
      }
}
const register=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const model:IUserModel=req.body
        const validateError = new UserModel(model);
        if(await dataController.validateError(res,validateError)) return
        const salt = await bcrypt.genSalt(saltRounds);
        
        // Băm mật khẩu với salt
        const hash = await bcrypt.hash(model.password, salt);
        const role=await (await dataService.getBuilderQuery(GroupRole)).andWhere('groupRole.name=:name',{name:AppRole.User}).getOne()
        await dataService.create(User,{
          ...model,
          password_hash:hash,
          groupRole:{id:role.id}
        })
        res.status(200).json(RepositoryDTO.Success("Tạo tài khoản người chơi thành công"))
    }catch(error:any){
        console.log(error);
        res.status(500).json(error)
    }
}
const authController={login,logout,register}
export default authController