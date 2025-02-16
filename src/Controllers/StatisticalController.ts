import { NextFunction, Request, Response } from "express";
import StatisticalService from "../services/StatisticalService";
import { parseDate, parseNumber } from "../utils/ConverEnum";
import { RepositoryDTO } from "../utils/ReponseDTO";
import { Controller, Get, Queries, Route, Tags } from "tsoa";
@Route("/Statistical")
@Tags("Statistical Controller")
export class StatisticalController extends Controller {
  protected statisticalSerice: StatisticalService;
  constructor() {
    super();
    this.statisticalSerice = new StatisticalService();
  }
}
