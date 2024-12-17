import { NextFunction,Request,Response } from "express";
import { IShowtimeModel, ShowtimeModel } from "../Model/ShowtimeModel";
import dataService from "../Service/DataService";
import { Showtime } from "../Data/Showtime";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
const getAllWithFilterAndPagination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { movieId, showDate, page, pageSize,orderBy,sort } = req.query;

        // Chuyển đổi các tham số từ query string
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        // Xử lý showDate, kiểm tra hợp lệ
        let showDateParsed: Date | null = null;
        if (showDate) {
            showDateParsed = new Date(showDate as string);
            if (isNaN(showDateParsed.getTime())) {
                res.status(400).json({ message: "Invalid showDate format" });
                return;
            }
        }

        // Tạo QueryBuilder cho Showtime
        let queryBuilder = await dataService.getBuilderQuery(Showtime, "showtime");
        
        // Thêm các JOIN
        queryBuilder = queryBuilder.leftJoinAndSelect('showtime.movie', 'movie')
                                   .leftJoinAndSelect('showtime.screen', 'screen');

        // Thêm điều kiện lọc theo movieId nếu có
        if (movieId) {
            queryBuilder = queryBuilder.where("showtime.movieId = :movieId", { movieId });
        }

        // Thêm điều kiện lọc theo showDate nếu có
        if (showDateParsed) {
            queryBuilder = queryBuilder.andWhere('showtime.showDate = :showDate', { showDate: showDateParsed.toISOString().split('T')[0] });
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`genre.${orderByField}`,sortOrder)
        }
        // Nhóm kết quả theo movieId và chọn showtime
        const datas=await queryBuilder.select('movie.*',)
        .addSelect('GROUP_CONCAT(showtime.id)', 'showtimes')
        .groupBy('movie.id').getRawMany()
        
        // Phản hồi kết quả
        const dataDTO = await Promise.all(
            datas.map(async (data) => ({
                ...data,
                showtimes: await dataService.getByArray(Showtime, 'showtime', data.showtimes.toString().split(',').map(item=>Number(item)))
            }))
        );
        
        res.status(200).json(RepositoryDTO.WithData(200,dataDTO));

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const id=Number(req.params.id);
        const data=await dataService.getBy(Showtime,'showtime',id)
        if(await dataController.IsNotFound(res,data,"Không tìm thấy thời gian chiếu phim này")) return
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const data=await dataService.getBy(Showtime,'showtime',id)
       if(await dataController.IsNotFound(res,data,"Không tìm thấy thời gian chiếu phim này")) return
        await dataService.remove(Showtime,data)
        res.status(200).json(RepositoryDTO.Success("Xóa thời gian chiếu phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const model:IShowtimeModel=req.body
        const validateError = new ShowtimeModel(0,model);
        if(await dataController.validateError(res,validateError)) return
        await dataService.create(Showtime,{
            ...model,
            screen:{id:model.screenId},
            movie:{id:model.movieId}
        })
        res.status(200).json(RepositoryDTO.Success("Tạo thời gian thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IShowtimeModel=req.body;
        const validateError = new ShowtimeModel(id,model);
        const data=await dataService.getBy(Showtime,'showtime',id)
        if(await dataController.IsNotFound(res,data,"Không tìm thấy lịch chiếu phim này")) return;
        if(await dataController.validateError(res,validateError)) return;
        await dataService.update(Showtime,data,{
            showDate:model.showDate,
            endTime:model.endTime,
            startTime:model.startTime,
            price:model.price
        })
         res.status(200).json(RepositoryDTO.Success("Cập nhập lịch chiếu phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Showtime,"showtime",model.ids);
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy lịch chiếu phim này")) return
        await dataSource.manager.transaction(async(transactionEntityManger)=>{
            await dataService.removeArray(Showtime,model.ids,transactionEntityManger)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa lịch chiếu phim này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:IShowtimeModel[]=req.body;
        for (const model of models) {
            const validateError = new ShowtimeModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError(res, validateError)) return
        }
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            await dataService.createArray(Showtime,models.map(model=>({
                showDate:model.showDate,
                startTime:model.startTime,
                endTime:model.endTime,
                price:model.price,
                movie:{id:model.movieId},
                screen:{id:model.screenId}
             })),transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Tạo danh sách phim thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const showtimeController={
    create,get,remove,getAllWithFilterAndPagination,update,createArray,removeArray
}
export default showtimeController