import BaseController from "../utils/BaseController";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import UserService from "../services/UserService";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import { statusUser, User } from "../entitys/User";
import validateError from "../middlewares/ValidateErrorDTO";
import { PasswordModel, UserModel } from "../models/modelRequest/UserModel";
import {
  Body,
  Delete,
  Get,
  Middlewares,
  Path,
  Request,
  Put,
  Queries,
  Route,
  Security,
  Tags,
} from "tsoa";
import { UserFilter } from "../models/modelRequest/FilterModel";
import { UserToken } from "middlewares/authentication";
@Route("/user")
@Tags("User Controller")
export class UserController extends BaseController<UserService> {
  constructor() {
    const service = new UserService();
    super(service);
  }
  @Delete("/")
  @Middlewares([notFoundArray(User, "user"), validateError(DeleteModel)])
  @Security("JWT", ["admin"])
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
  @Get("/getMe")
  @Security("JWT", ["admin", "user"])
  async getMe(@Request() req: any) {
    try {
      const user = req.user;
      const record = await this.service.getById(user.id);
      return this.sendResponse(record);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Put("/password")
  @Middlewares(validateError(PasswordModel))
  @Security("JWT", ["admin", "user"])
  async updatePassword(@Request() req: any, @Body() data: PasswordModel) {
    try {
      const user: UserToken = req.user;
      await this.service.updatePassword(user.id, data);
      return this.sendSuccess("Cập nhập mật khẩu thành công", 200);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Get("{id}")
  @Security("JWT", ["admin"])
  async getOne(@Path("id") id: number) {
    return await super.getOne(id);
  }
  @Get("/")
  @Security("JWT", ["admin"])
  async getFilter(@Queries() filter: UserFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Put("{id}")
  @Middlewares(notFound(User, "user"))
  async banUser(@Path("id") id: number) {
    return await super.update(id, { status: statusUser.ban });
  }
  @Put("/")
  @Middlewares(validateError(UserModel))
  @Security("JWT", ["admin", "user"])
  async updateUser(@Request() req: any, @Body() data: UserModel) {
    const user: UserToken = req.user;
    return await super.update(user.id, data);
  }

  @Delete("{id}")
  @Security("JWT", ["admin"])
  async delete(@Path("id") id: number) {
    return await super.delete(id);
  }
  @Delete("/getMe")
  @Security("JWT", ["admin"])
  async deleteMe(@Request() req: any) {
    const user = req.user;
    return await super.delete(user.id);
  }
}
