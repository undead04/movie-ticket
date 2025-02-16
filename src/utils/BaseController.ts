import { RepositoryDTO } from "./ReponseDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { Body, Controller, Path, Queries, Request } from "tsoa";

export default class BaseController<TService> extends Controller {
  protected service: TService;
  constructor(service: TService) {
    super();
    this.service = service;
  }
  async getFilter(@Queries() filter: any) {
    try {
      const data = await (this.service as any).getFilter(filter);
      return this.sendResponse(data);
    } catch (error) {
      console.log(error);
    }
  }
  // CREATE - Tạo mới một bản ghi
  async create(@Body() data: any, @Request() req?: any) {
    try {
      await (this.service as any).create(data);
      this.setStatus(201);
      return this.sendSuccess("Tạo thành công", 201);
    } catch (error) {
      throw error;
    }
  }

  // READ - Lấy một bản ghi theo ID
  async getOne(@Path() id: number) {
    try {
      const data = await (this.service as any).getById(id);
      return this.sendResponse(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // UPDATE - Cập nhật bản ghi
  async update(@Path() id: number, @Body() data: any, @Request() req?: any) {
    try {
      await (this.service as any).update(id, data);
      return this.sendSuccess("Cập nhật thành công", 200);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // DELETE - Xóa bản ghi
  async deleteArray(@Body() data: DeleteModel) {
    try {
      await (this.service as any).removeArray(data.ids);
      return this.sendSuccess("Xóa một danh sách thành công", 204);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(@Path() id: number) {
    try {
      await (this.service as any).remove(id);
      return this.sendSuccess("Xóa thành công", 204);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Phương thức trả về phản hồi thành công
  sendResponse(data: any) {
    return RepositoryDTO.WithData(200, "Lấy dữ liệu thành công", data);
  }
  sendSuccess(message: string, status: number = 200) {
    return RepositoryDTO.Success(message, status);
  }
  // Phương thức trả về lỗi
  protected sendError(message: string, status: number = 400) {
    return RepositoryDTO.Error(status, message);
  }
}
