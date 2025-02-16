import { Showtime } from "../entitys/Showtime";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { ShowtimeFilter } from "../models/modelRequest/FilterModel";
import { ShowtimeModel } from "../models/modelRequest/ShowtimeModel";
import ShowtimeService from "../services/ShowtimeService";
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
@Route("/Showtime")
@Tags("Showtime Controller")
export class ShowtimeController extends BaseController<ShowtimeService> {
  constructor() {
    const service = new ShowtimeService();
    super(service);
  }
  /**
   *Lọc thể loại thời gian chiếu phim
   */
  @Get("/")
  async getFilter(@Queries() filter: ShowtimeFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm bản ghi thời gian chiếu phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(ShowtimeModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: ShowtimeModel) {
    return await super.create({
      ...data,
      movie: { id: data.movieId },
      screen: { id: data.screenId },
    });
  }

  @Get("{id}")
  /**
   * Lấy một bản ghi thời gian chiếu phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập thời gian chiế phim
   * @example id "1"
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Showtime, "showtime"), validateError(ShowtimeModel)])
  async update(@Path() id: number, @Body() data: ShowtimeModel) {
    return await super.update(id, {
      showDate: data.showDate,
      endTime: data.endTime,
      startTime: data.endTime,
      screen: { id: data.screenId },
      movie: { id: data.movieId },
      price: data.price,
    });
  }

  @Delete("{id}")
  /**
   * Xóa một bản ghi thời gian chiếu phim
   * @example id 1
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([
    notFoundArray(Showtime, "showtime"),
    validateError(DeleteModel),
  ])
  /**
   * Xóa một mảng bản ghi thời gian chiếu phim
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
