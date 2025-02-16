import { Genre } from "../entitys/Genre";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { GenreFilter } from "../models/modelRequest/FilterModel";
import { GenreModel } from "../models/modelRequest/GenreModel";
import GenreService from "../services/GenreService";
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
@Route("/Genre")
@Tags("Genre Controller")
export class GenreController extends BaseController<GenreService> {
  constructor() {
    const service = new GenreService();
    super(service);
  }
  /**
   *Lọc thể loại phim theo tên
   */
  @Get("/")
  async getFilter(@Queries() filter: GenreFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm dữ liệu thể loại phim
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(GenreModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: GenreModel) {
    return await super.create(data);
  }
  @Post("/createArray")
  /**
   * Thêm một mảng dữ liệu thể loại phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(GenreModel)])
  @SuccessResponse(201, "Create")
  async createArray(@Body() data: GenreModel[]) {
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
   * Lấy một bản ghi thể loại phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập thể loại phim
   * @example id "1"
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Genre, "genre"), validateError(GenreModel)])
  async update(@Path() id: number, @Body() data: GenreModel) {
    return await super.update(id, data);
  }

  @Delete("{id}")
  @SuccessResponse(204, "No content")
  /**
   * Xóa một thể loại phim
   * @example id 1
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @SuccessResponse(204, "No content")
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([notFoundArray(Genre, "genre"), validateError(DeleteModel)])
  /**
   * Xóa một mảng thể loại phim
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
