import { Request, Response, NextFunction } from "express";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import CustomError from "../validations/CustumError";

// Custom error handler middleware
function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json(RepositoryDTO.Error(err.statusCode,err.field?{
      [err.field]:err.message
    }:err.message
  ));
    return
  }

  // Nếu lỗi không phải CustomError, gửi lỗi mặc định
  res.status(500).json({
    message: 'Internal Server Error',
    statusCode: 500,
  });
}

export { errorHandler };
