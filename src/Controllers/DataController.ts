import {  Response } from 'express';
import { ObjectLiteral, ReturningStatementNotSupportedError } from 'typeorm';
import { RepositoryDTO } from '../Model/DTO/RepositoryDTO';
import { validate } from 'class-validator';

export const IsNotFound = async <T extends ObjectLiteral>(
    res: Response,
    data:T,
    notFoundMessage: string
):Promise<boolean> => {
    // Nếu không tìm thấy dữ liệu
    if (!data) {
        res.status(404).json(RepositoryDTO.Error(404,notFoundMessage));
        return true
    }
    return false
};
export const IsNotFoundArray=async<T extends ObjectLiteral>(
  res:Response,
  datas:T[],
  notFoundMessage:string
):Promise<boolean>=>{
  for(let i=0;i<datas.length;i++){
    if(await IsNotFound(res,datas[i],notFoundMessage)){
      return true
    }
  }
  return false
}
export const validateError= async<T extends object>(
    res:Response,
    validateError:T , // Constructor của loại dữ liệu
):Promise<boolean>=>{
    const errors=await validate(validateError);
    if (errors.length > 0) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return true
      }
    return false
}
const dataController={IsNotFound,validateError,IsNotFoundArray}
export default dataController
