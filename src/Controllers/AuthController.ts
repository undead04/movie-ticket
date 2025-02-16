import UserService from "../services/UserService";
import { LoginModel, RegisterModel } from "../models/modelRequest/UserModel";
import { RepositoryDTO } from "../utils/ReponseDTO";
import jwt from "jsonwebtoken";
import {
  Body,
  Controller,
  Example,
  Get,
  Middlewares,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import validateError from "../middlewares/ValidateErrorDTO";
import { UserToken } from "../middlewares/authentication";

@Route()
@Tags("Auth Controller")
export class AuthController extends Controller {
  userService: UserService;
  constructor() {
    super();
    this.userService = new UserService();
  }
  @Post("/login")
  @Middlewares([validateError(LoginModel)])
  async login(@Body() model: LoginModel) {
    try {
      // Kiểm tra thông tin người dùng đăng nhập
      const userData = await this.userService.isLogin(model);
      // Nếu thông tin đăng nhập không đúng
      if (userData == null) {
        this.setStatus(400);
        return RepositoryDTO.Error(400, "Mật khẩu hoặc tên người dùng sai sai");
      }
      const user: UserToken = {
        id: userData.id,
      };
      // Tạo refresh token và access token
      const refreshToken = await this.userService.createRefreshToken(user);
      const accessToken = await this.userService.createAccessToken(user);
      this.setHeader(
        "Set-Cookie",
        `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${
          7 * 24 * 60 * 60
        }`
      );
      // Trả về response với dữ liệu người dùng và access token
      return RepositoryDTO.WithData(200, "Đăng nhập thành công", {
        ...userData,
        token: accessToken,
      });
    } catch (error: any) {
      console.error(error); // Log lỗi chi tiết
    }
  }
  @Get("/logout")
  async logout() {
    try {
      // Xóa cookie authToken
      // Đặt cookie với Max-Age = 0 để xóa nó
      this.setHeader(
        "Set-Cookie",
        `refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      );
      // Trả về phản hồi thành công
      return RepositoryDTO.Success("Đăng xuất thành công", 200);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Post("/register")
  @Middlewares(validateError(RegisterModel))
  async register(@Body() model: RegisterModel) {
    try {
      const data = await this.userService.create(model);
      return RepositoryDTO.WithData(200, "Đăng kí thành công", data);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Get("/refreshToken")
  async refreshToken(@Request() req: any) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        this.setStatus(401);
        return RepositoryDTO.Error(401, "Không có refresh token");
      }
      // Sử dụng Promise thay cho callback
      const user: UserToken = await new Promise((resolve, reject) => {
        jwt.verify(refreshToken, "refreshToken", (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
      const accessToken = await this.userService.createAccessToken(user);
      return RepositoryDTO.WithData(
        200,
        "Cấp lại token thành công",
        accessToken
      );
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        this.setStatus(403);
        return RepositoryDTO.Error(403, "Refresh token không hợp lệ");
      }
      console.error(error);
      throw error; // Ném lỗi để middleware xử lý lỗi toàn cục
    }
  }
}
