import jwt from "jsonwebtoken";
import { statusUser, User } from "../entitys/User";
import BaseRepository from "utils/BaseRepository";
import CustomError from "utils/CustumError";
export interface UserToken {
  id: number;
}
export async function expressAuthentication(
  request: any,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "JWT") {
    const token = request.headers.authorization?.split(" ")[1];
    const repository = new BaseRepository(User, "user");

    if (!token) {
      return Promise.reject(new CustomError("Không có token", 401));
    }
    return new Promise((resolve, reject) => {
      jwt.verify(token, "accessToken", async (err, decoded: UserToken) => {
        if (err) {
          reject(new CustomError("Token hết hạn", 401));
        } else {
          // Kiểm tra trạng thái tài khoản
          const user = await (await repository.getBy(decoded.id))
            .innerJoinAndSelect("user.groupRole", "groupRole")
            .getOne();
          if (user.status != statusUser.complete) {
            reject(
              new CustomError(
                "Tài khoản của bạn chưa kích hoạt hoặc đã bị ban",
                403
              )
            );
          }
          // Kiểm tra vai trò người dùng nếu cần (scopes)
          if (scopes && !scopes.includes(user.groupRole.name)) {
            reject(
              new CustomError("Bạn không đủ quyền hạn để vào API này", 403)
            );
          }
          const userInfo: UserToken = {
            id: decoded.id,
          };
          request.user = userInfo;
          resolve(userInfo);
        }
      });
    });
  }

  return Promise.reject(new Error("Hệ thống xác thực không hỗ trợ"));
}
