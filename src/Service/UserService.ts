import { DeepPartial, EntityManager } from "typeorm";
import DataService from "./DataService";
import { error } from "console";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import { User } from "../Data/User";
import bcrypt  from 'bcryptjs';
import { GroupRole } from "../Data/GroupRole";
import AppRole from "../Model/GroupRoleModel";
import jwt  from 'jsonwebtoken';

export default class UserService extends DataService<User>{
    protected groupRoleRepository:DataService<GroupRole>
    constructor(){
        super(User,'user')
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
    async create(data: DeepPartial<User>, transactionalEntityManager?: EntityManager): Promise<User> {
        const role=await (await this.groupRoleRepository.createQueryBuilder())
        .andWhere('groupRole.name=:name',{name:AppRole.User}).getOne()
        const hashPassword = await this.hashPassword(data.password_hash)
        return await super.create({
            ...data,
            password_hash:hashPassword,
            groupRole:{id:role.id}
        },transactionalEntityManager)
    }
    async generateToken(userData:User,password:string){
        if(userData==null) return null
        const isMatch:boolean= await this.comparePassword(password,userData.password_hash)
        if(!isMatch) return null
        return jwt.sign({ id: userData.id, role:userData.groupRole.name }, 'authToken', { expiresIn: '1h' });
    }
}