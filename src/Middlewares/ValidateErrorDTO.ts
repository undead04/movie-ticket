import { Request, Response, NextFunction } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { RepositoryDTO } from "../utils/ReponseDTO";
import { validate } from "class-validator";

// Xử lý lỗi cho đối tượng DTO
async function handleValidate(res: Response, model: any): Promise<any> {
  const errors = await validate(model);
  if (errors.length > 0) {
    // Tạo thông báo lỗi chi tiết từ các validation errors
    const errorResponse = errors.reduce((acc, error) => {
      if (error.children && error.children.length > 0) {
        // Nếu có lỗi trong các trường con (nested objects), xử lý chúng đệ quy
        acc[error.property] = error.children[0].children.reduce(
          (childAcc, childError) => {
            childAcc[childError.property] = Object.values(
              childError.constraints
            )[0];
            return childAcc;
          },
          {}
        );
      } else {
        // Nếu là lỗi của trường đơn, thêm lỗi vào
        acc[error.property] = Object.values(error.constraints)[0];
      }

      return acc;
    }, {});

    // Trả về lỗi 400 với các lỗi validation
    res.status(400).json(RepositoryDTO.Error(422, errorResponse));
    return true; // Dừng xử lý nếu có lỗi
  }
  return false; // Nếu không có lỗi, tiếp tục xử lý
}

// Middleware kiểm tra lỗi validation
const validateError = (cls: ClassConstructor<any>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Chuyển đổi request body thành instance của lớp DTO
    const model = plainToInstance(cls, req.body, {
      enableImplicitConversion: true,
    });

    // Kiểm tra trường hợp body là mảng (array)
    if (Array.isArray(model)) {
      // Xử lý từng đối tượng trong mảng
      for (const item of model) {
        // Nếu có lỗi validation, dừng ngay
        if (await handleValidate(res, item)) return;
      }
    } else {
      // Kiểm tra đối tượng đơn
      if (await handleValidate(res, model)) return;
    }
    // Nếu không có lỗi, chuyển sang middleware tiếp theo
    next();
  };
};

export default validateError;
