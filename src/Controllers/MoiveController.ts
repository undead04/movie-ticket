import { NextFunction,Request,Response } from "express";
import { IMovieModel, MovieModel } from "../Model/MovieModel";
import { parseStatusMovie } from "../utils/ConverEnum";
import dataService from "../Service/DataService";
import { Movie } from "../Data/Movie";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { MovieGenre } from "../Data/MovieGenre";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";

export  enum StatusMovie{
    noStatus=0,
    announcing=1,
    comingSoon=2,
    stopShowing=3,
  }
const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const { title, genreId,orderBy,sort, statusMovie,page, pageSize } = req.query;
        const genreIdArray = genreId  ? genreId.toString().split(',') : undefined;
        // Chuyển giá trị `page` và `pageSize` sang kiểu số và đảm bảo mặc định là 1 và 10 nếu không có trong query
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const statusMovieEnum:StatusMovie=parseStatusMovie(statusMovie)
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await dataService.getBuilderQuery(Movie,'movie'))
        queryBuilder=queryBuilder.leftJoinAndSelect('movie.movieGenre', 'movieGenre')
        .leftJoinAndSelect('movieGenre.genre',"genre"); 
        if(title){
             queryBuilder=queryBuilder.where("movie.title LIKE :title",{title:`%${title}%`})
        }    
        // Lọc theo genreId từ bảng MovieGenre
        if(genreIdArray && genreIdArray.length > 0) {
                queryBuilder = queryBuilder.andWhere('movieGenre.genreId IN (:...genreId)', {
                genreId:genreIdArray
              });
            }
        if(statusMovieEnum){
            const nowDate= Date.now();
            switch(statusMovieEnum){
                case StatusMovie.announcing:
                  queryBuilder=queryBuilder.andWhere('movie.releaseDate <=:value',{value:nowDate})
                  queryBuilder=queryBuilder.andWhere('movie.endDate >=:value',{value:nowDate})
                  break;
                case StatusMovie.comingSoon:
                  queryBuilder=queryBuilder.andWhere('movie.releaseDate >=:value',{value:nowDate})
                  break;
                case StatusMovie.stopShowing:
                  queryBuilder=queryBuilder.andWhere('movie.endDate <:value',{value:nowDate})
                  break;
              }
            }
            if(orderByField){
                queryBuilder=queryBuilder.orderBy(`movie.${orderByField}`,sortOrder)
            }
        const data=await dataService.getAllPagination(Movie,queryBuilder,pageNumber,pageSizeNumber)
            
        // Trả dữ liệu về cho client
        res.status(200).json(RepositoryDTO.WithData(200,data));
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const id=Number(req.params.id);
        const data=await dataService.getBy(Movie,"movie",id,'id',[{
            original:"movie.movieGenre",
            link:"movieGenre"
        },{
            original:"movieGenre.genre",
            link:"genre"
        }
    ]);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy phim này")) return
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const dataMovie=await dataService.getBy(Movie,"movie",id)
       if(await dataController.IsNotFound(res,dataMovie,"Không tìm thấy phim này")) return
        await dataService.remove(Movie,dataMovie)
        res.status(200).json(RepositoryDTO.Success("Xóa phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IMovieModel=req.body;
        const validateError = new MovieModel(0,model);
        if(await dataController.validateError(res,validateError)) return
        await dataSource.manager.transaction(async (transactionalEntityManager)=>{
            const dataMovie= await dataService.create(Movie,model,transactionalEntityManager)
            await dataService.createArray(MovieGenre,model.genreId.map((item)=>({
                movie:{id:dataMovie.id},
                genre:{id:item}
            })),transactionalEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Tạo phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IMovieModel=req.body;
        const data=await dataService.getBy(Movie,"movie",id,'id',[{
            original:"movie.movieGenre",
            link:"movieGenre"
        },{
            original:"movieGenre.genre",
            link:"genre"
        }]);
        const validateError = new MovieModel(id,model);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy phim này")) return
        if(await dataController.validateError(res,validateError)) return
        await dataSource.manager.transaction(async(transactionalEntityManager)=>{
            await dataService.removeArray(MovieGenre,data.movieGenre.map((item)=>item.id),transactionalEntityManager)
            await dataService.update(Movie,data,{
                description:model.description,
                duration:model.duration,
                title:model.title,
                releaseDate:model.releaseDate,
                endDate:model.endDate,
                trailerUrl:model.trailerUrl,
                posterUrl:model.posterUrl,
            },transactionalEntityManager)
            await dataService.createArray(MovieGenre,model.genreId.map((item)=>({
                movie:{id:id},
                genre:{id:item}
            })),transactionalEntityManager)
        })
         res.status(200).json(RepositoryDTO.Success("Cập nhập phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Movie,"movie",model.ids);
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy phim này")) return
        await dataSource.manager.transaction(async (transcationEntityManager)=>{
            await dataService.removeArray(Movie,model.ids,transcationEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa  phim này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:IMovieModel[]=req.body;
        for (const model of models) {
            const validateError = new MovieModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError(res, validateError)) return
        }
        // Trong transaction
        await dataSource.manager.transaction(async (transactionalEntityManager) => {
            for (const model of models) {
            const dataMovie = await dataService.create(Movie, model, transactionalEntityManager);
            await dataService.createArray(MovieGenre, model.genreId.map((item) => ({
                movie: { id: dataMovie.id },
                genre: { id: item }
            })), transactionalEntityManager);
            }
        });
        res.status(200).json(RepositoryDTO.Success("Tạo danh sách  phim thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}

const movieController={
    create,get,remove,getAllWithFilterAndPagination,update,createArray,removeArray
}
export default movieController