import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RepositoryDTO } from '../Model/DTO/RepositoryDTO';

export interface AuthRequest extends Request {
  _id?: number;
  role: string;
}

// Middleware kiểm tra xác thực và vai trò
export const authenticateToken = (roles?: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies.authToken; // Lấy token từ cookies
    if (!token) {
      res.status(401).json(RepositoryDTO.Error(401,"Không có token")); // Nếu không có token thì từ chối truy cập
      return;
    }

    jwt.verify(token, 'authToken', (err: any, user: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          res.status(401).json(RepositoryDTO.Error(401,"Token hết hạn")) // Token hết hạn
          return
        }
        res.status(403).json(RepositoryDTO.Error(403,"Token không hợp lệ")); // Nếu token không hợp lệ
        return;
      }
      req._id = user.id;
      req.role = user.role;
      // Kiểm tra vai trò của người dùng
      if(roles){
        if (!roles.includes(user.role)) {
          res.status(403).json(RepositoryDTO.Error(403,"Bạn không đủ quyền hạn đề vào API này")); // Nếu người dùng không có quyền
          return;
        }
      }
      next(); // Tiếp tục xử lý yêu cầu nếu vai trò hợp lệ
    });
  };
};
