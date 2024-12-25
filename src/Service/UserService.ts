
import DataService from "./DataService";
import { User } from "../Data/User";
import bcrypt  from 'bcryptjs';
import { GroupRole } from "../Data/GroupRole";
import AppRole from "../Model/GroupRoleModel";
import jwt  from 'jsonwebtoken';
import { PasswordModel, UserModel } from "../Model/UserModel";
import { DeepPartial } from "typeorm";
import CustomError from "../validations/CustumError";

export default class UserService{
    protected groupRoleRepository:DataService<GroupRole>
    protected userRepository:DataService<User>
    constructor(){
        this.userRepository = new DataService(User,'user')
        this.groupRoleRepository = new DataService(GroupRole,'groupRole')
    }
    async hashPassword(password:string){
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        // Băm mật khẩu với salt
        const hash = await bcrypt.hash(password, salt);
        return hash
    }
    async comparePassword(password:string,passwordHash:string){
        return await bcrypt.compare(password,passwordHash)
    }
    async create(data: UserModel): Promise<User> {
        const role=await this.groupRoleRepository.getBy(AppRole.User,'name')
        const hashPassword = await this.hashPassword(data.password)
        return await this.userRepository.create({
            ...data,
            password_hash:hashPassword,
            groupRole:{id:role.id}
        })
    }
    async get(value:unknown,columFiled:string='id'){
        console.log(value)
        const data = await this.userRepository.getBy(value,columFiled,[
            {original:'user.groupRole',link:"groupRole"}
        ])
        return data
    }
    protected async validateUser(id:number){
        return await this.userRepository.isNotFound(id, `Nguười dùng này không tồn tại id = ${id}`)
    }
    async update(id:number,data:DeepPartial<User>):Promise<void>{
            await this.validateUser(id);
            await this.userRepository.update(id,data)
        }
    async generateToken(userData:User,password:string){
        if(userData==null) return null
        const isMatch:boolean= await this.comparePassword(password,userData.password_hash)
        if(!isMatch) return null
        return jwt.sign({ id: userData.id, role:userData.groupRole.name }, 'authToken', { expiresIn: '1h' });
    }
    async getFillter(email?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
        let queryBuilder =await (await this.userRepository.createQueryBuilder())
        if(email){
            queryBuilder = queryBuilder.andWhere('user.email =:email',{email})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`user.${orderBy}`,sortOrder)
        }

        const data = await this.userRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    async updatePassword(id:number,model:PasswordModel){
        const record = await this.validateUser(id)
        const isMatch:boolean= await bcrypt.compare(model.oldPassword,record.password_hash);
            if(!isMatch){
                throw new CustomError("nhập mật khẩu sai",400,'oldPassword')
            }
            if(model.oldPassword==model.newPassword){
                throw new CustomError("Mật khẩu mới trùng với mật khẩu củ",400,"newPassword")
            }
            if(model.newPassword!=model.confirmPassword){
               throw new CustomError("Mật khẩu xác nhận không trùng với mật khẩu mới",400,'confirmPassword')
            }
            // Tạo đối tượng từ request body
            const newPassowddHash = await this.hashPassword(model.newPassword)
            await this.userRepository.update(id,{
                password_hash : newPassowddHash
            })
    }
}