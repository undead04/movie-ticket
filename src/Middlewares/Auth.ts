import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export interface AuthRequest extends Request{
  _id?:number,
  role:string
}
// Middleware kiểm tra xác thực
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction):Promise<void> => {
  const token = req.cookies.authToken; // Lấy token từ cookies
  if (!token){
    res.sendStatus(401); return // Nếu không có token thì từ chối truy cập
  }
  jwt.verify(token,'authToken', (err:any, user:any) => {
    if (err) {
      res.sendStatus(403); // Nếu token không hợp lệ
      return
    }
    req._id=user.id,
    req.role=user.role,
    next(); // Tiếp tục xử lý yêu cầu
  });
};
