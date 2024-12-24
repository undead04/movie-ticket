import { Request, Response, NextFunction } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AutoBind } from "../utils/AutoBind";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";

// Define a type for class constructors

export default class ValidateErrorMiddleware<T extends Object> {
  private cls: ClassConstructor<T>;

  // Constructor accepts a class constructor
  constructor(cls: ClassConstructor<T>) {
    this.cls=cls
  }

  // Validate error method
  @AutoBind
  async ValidateError(req: Request, res: Response, next: NextFunction): Promise<void> {
    const model = req.body
    if(Array.isArray(model)){
      for(const item of model){
        if(await this.HandleValidate(res,item)) return
      }
    }else{
      if(await this.HandleValidate(res,model)) return
    }
    next()
  }
  protected async HandleValidate(res:Response,data:T){
    // Convert the plain object into an instance of the class passed as `cls`
    const model = plainToInstance(this.cls, data);
    // Validate the instance
    const errors = await validate(model);

    if (errors.length > 0) {
      // If there are validation errors, respond with status 400
      res.status(400).json(RepositoryDTO.Error(400,errors.reduce((acc, error) => {
        acc[error.property] = Object.values(error.constraints)[0]; // Get the first validation error
        return acc;
      }, {}),));
      return true; // Stop further processing
    }
    return false;

    // If there are no validation errors, call the next middleware
    
  }
  
}
