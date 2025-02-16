import { Theater } from "../entitys/Theater";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { TheaterFilter } from "../models/modelRequest/FilterModel";
import AppRole from "../models/modelRequest/AppRole";
import { TheaterModel } from "../models/modelRequest/TheaterModel";
import TheaterService from "../services/TheaterService";
import BaseController from "../utils/BaseController";
import {
  Body,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Queries,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
@Route("/Theater")
@Tags("Theater Controller")
export class TheaterController extends BaseController<TheaterService> {
  constructor() {
    const service = new TheaterService();
    super(service);
  }
  /**
   *Lọc rạp chiếu phim
   */
  @Get("/")
  async getFilter(@Queries() filter: TheaterFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm dữ liệu rạp chiếu phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(TheaterModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: TheaterModel) {
    return await super.create(data);
  }
  @Post("/createArray")
  /**
   * Thêm một mảng dữ liệu rạp chiếu phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(TheaterModel)])
  @SuccessResponse(201, "Create")
  async createArray(@Body() data: TheaterModel[]) {
    try {
      await (this.service as any).createArray(data);
      this.setStatus(201);
      return this.sendSuccess("Tạo thành công", 201);
    } catch (error) {
      throw error;
    }
  }
  @Get("{id}")
  /**
   * Lấy một bản ghi rạp chiểu phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập dữ liệu rạp chiếu phim
   * @example id "1"
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Theater, "theater"), validateError(TheaterModel)])
  async update(@Path() id: number, @Body() data: TheaterModel) {
    return await super.update(id, data);
  }

  @Delete("{id}")
  /**
   * Xóa một bản ghi rạp chiếu phim
   * @example id 1
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([notFoundArray(Theater, "theater"), validateError(DeleteModel)])
  /**
   * Xóa một mảng bản ghi rạp chiếu phim
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
