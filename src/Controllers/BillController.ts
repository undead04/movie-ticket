import BillService from "../services/BillService";
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
import BaseController from "../utils/BaseController";
import validateError from "../middlewares/ValidateErrorDTO";
import { notFoundArray } from "../middlewares/NotFoundHandle";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { BillFilter } from "../models/modelRequest/FilterModel";
import AppRole from "models/modelRequest/AppRole";

@Route("/Bill")
@Tags("Bill Controller")
export class BillController extends BaseController<BillService> {
  constructor() {
    const service = new BillService();
    super(service);
  }
}
