import { NextFunction, Response } from "express";
import TicketService from "../services/TicketService";
import { Controller, Get, Route, Tags } from "tsoa";
import { RepositoryDTO } from "../utils/ReponseDTO";
@Route("/ticket")
@Tags("Ticket Controller")
export class TicketController extends Controller {
  protected ticketService: TicketService;
  constructor() {
    super();
    this.ticketService = new TicketService();
  }
}
