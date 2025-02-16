import AppRole from "models/modelRequest/AppRole";
import { Movie } from "../entitys/Movie";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { MovieFilter } from "../models/modelRequest/FilterModel";
import { MovieModel } from "../models/modelRequest/MovieModel";
import MovieService from "../services/MovieService";
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
@Route("/Movie")
@Tags("Movie Controller")
export class MovieController extends BaseController<MovieService> {
  constructor() {
    const service = new MovieService();
    super(service);
  }
  /**
   *Lọc phim
   */
  @Get("/")
  async getFilter(@Queries() filter: MovieFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm bản ghi phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(MovieModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: MovieModel) {
    return await super.create(data);
  }

  @Get("{id}")
  /**
   * Lấy một bản ghi phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập bản ghi
   * @example id "1"
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Movie, "movie"), validateError(MovieModel)])
  async update(@Path() id: number, @Body() data: MovieModel) {
    return await super.update(id, data);
  }

  @Delete("{id}")
  /**
   * Xóa một bản ghi
   * @example id 1
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([notFoundArray(Movie, "movie"), validateError(DeleteModel)])
  /**
   * Xóa một mảng bản ghi
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
