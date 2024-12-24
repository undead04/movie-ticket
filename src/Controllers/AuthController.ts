import { NextFunction,Request,Response } from "express";
import { LoginModel, UserModel } from "../Model/UserModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import UserService from "../Service/UserService";
import { AutoBind } from "../utils/AutoBind";

export default class AuthController{
  userService:UserService
  constructor(){
    this.userService = new UserService()
  }
  @AutoBind
  async login(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
        const model: LoginModel=req.body
        const userData=await this.userService.get(model.email,'email')
        const result=await this.userService.generateToken(userData,model.password)
        if(result==null) {
          res.status(400).json(RepositoryDTO.Error(400,"Mật khẩu hoặc email sai"))
          return
        }
        res.cookie("authToken", result, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict', // Giảm thiểu CSRF
            maxAge: 3*60 * 60 * 1000 // 1 giờ
        }); 
        res.status(200).json(RepositoryDTO.WithData(200,userData))
    }catch(error:any){
        console.log(error)
        next(error)
    }
  }
  @AutoBind
  async logout (req:Request,res:Response,next:NextFunction){
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
    @AutoBind
    async register (req:Request,res:Response,next:NextFunction){
    try{
        const model:UserModel=req.body
        const data = await this.userService.create(model)
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error);
        next(error)
    }
}
}
