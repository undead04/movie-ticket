import { NextFunction, Request,Response } from "express";
import StatisticalService from "../Service/StatisticalService";
import { AutoBind } from "../utils/AutoBind";
import { parseDate, parseNumber } from "../utils/ConverEnum";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";

export default class StatisticalController{
    protected statisticalSerice:StatisticalService
    constructor(){
        this.statisticalSerice = new StatisticalService()
    }
    @AutoBind
    async getFillter (req:Request,res:Response,next:NextFunction){
        try{
            const {movieId,from,to,theaterId,page,pageSize} = req.query
            const movieIdNumber = parseNumber(movieId)
            const fromDate = parseDate(from)
            const toDate = parseDate(to)
            const theaterIdNumber = parseNumber(theaterId)
            const pageNumber = parseNumber(page)||1
            const pageSizeNumber = parseNumber(pageSize)||10
            const data = await this.statisticalSerice.getFillter(
                movieIdNumber,fromDate,toDate,theaterIdNumber,pageNumber,pageSizeNumber

            )
            res.status(200).json(RepositoryDTO.WithData(200,data))
        }catch(error){
            console.log(error)
            next(error)
        }
    }
}