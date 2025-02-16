import jwt from "jsonwebtoken";
import { UserToken } from "./authentication";
import { Request } from "express";
export function verifyToken(req: Request): Promise<UserToken | null> {
  const token = req.headers.authorization?.split(" ")[1];
  const secretKey = "accessToken"; // Đảm bảo tên khóa bí mật đúng
  if (!token) {
    // Không có token, trả về null
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    jwt.verify(token, secretKey, (err, decoded: any) => {
      if (err) {
        // Token không hợp lệ, trả về null
        resolve(null);
      } else {
        // Token hợp lệ, trả về thông tin người dùng
        const userInfo: UserToken = {
          id: decoded.id,
        };
        resolve(userInfo);
      }
    });
  });
}
