import { isModuleNamespaceObject } from "util/types";
import { Movie } from "../Data/Movie";
import { Screen } from "../Data/Screen";
import { Showtime } from '../Data/Showtime';
import { IShowtimeModel } from "../Model/ShowtimeModel";
import CustomError from "../validations/CustumError";
import DataService from "./DataService";
import { EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import dataSource from "../DataSource";

export default class ShowtimeService{
    protected showtimeRepository : DataService<Showtime>
    protected movieRepository : DataService<Movie>
    protected screenRepository : DataService<Screen>
    constructor(){
        this.showtimeRepository = new DataService(Showtime,'showtime')
        this.movieRepository = new DataService(Movie,'movie')
        this.screenRepository = new DataService(Screen,'screem')
    }
    async get(id:number):Promise<Showtime>{
        return this.showtimeRepository.getBy(id,'id',[{
            original:"showtime.screen",link:"screen"
        }])
    }
    async getFillter(showDate?:string,movieId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        // Tạo QueryBuilder cho Showtime
        let queryBuilder = await this.showtimeRepository.createQueryBuilder()
        // Thêm các JOIN
        queryBuilder = queryBuilder.leftJoinAndSelect('showtime.movie', 'movie')
                                   .leftJoinAndSelect('showtime.screen', 'screen');
        // Thêm điều kiện lọc theo movieId nếu có
        if (movieId) {
            queryBuilder = queryBuilder.where("showtime.movieId = :movieId", { movieId });
        }
        // Thêm điều kiện lọc theo showDate nếu có
        if (showDate) {
            queryBuilder = queryBuilder.andWhere('showtime.showDate = :showDate', { showDate});
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`showtime.${orderBy}`,sortOrder)
        }
        // Nhóm kết quả theo movieId và chọn showtime
        const datas=await queryBuilder.select('movie.*',)
        .addSelect('GROUP_CONCAT(showtime.id)', 'showtimes')
        .groupBy('movie.id').getRawMany()

        // Phản hồi kết quả
        const dataDTO = await Promise.all(
            datas.map(async (data) => ({
                ...data,
                showtimes: await this.showtimeRepository.getByArray(data.showtimes.split(','))
            }))
        )
        return dataDTO
    }
    protected async isUnique(data: IShowtimeModel) {
        // Chuyển 'showDate' sang ISO string và lấy phần ngày (yyyy-mm-dd)
        const showDateISO = new Date(data.showDate).toISOString().split('T')[0]; // Lấy phần ngày 'yyyy-mm-dd'
        
        // Chuyển 'startTime' sang dạng 'HH:mm:ss'
        const startTime = new Date(data.startTime).toISOString().slice(11, 19); // Lấy phần thời gian (HH:mm:ss)
        
        console.log('showDate:', showDateISO);
        console.log('startTime:', startTime);
    
        // Truy vấn cơ sở dữ liệu
        const record = await (await this.showtimeRepository
            .createQueryBuilder())
            .andWhere('DATE(showtime.showDate) = :showDate', { showDate: showDateISO }) // So sánh phần ngày
            .andWhere('showtime.screenId = :screenId', { screenId: data.screenId })
            .andWhere(':startTime BETWEEN showtime.startTime AND showtime.endTime', { startTime })
            .getOne();
    
        // Kiểm tra nếu đã tồn tại một record với thông tin này
        if (record) {
            return record;
        }
        return null; // Trả về null nếu không tìm thấy
    }
    
    protected async validateShowtime(id:number){
        return await this.showtimeRepository.isNotFound(id, `thời gian này không tồn tại id = ${id}`)
    }
    protected async validateMovie(id:number){
        return await this.movieRepository.isNotFound(id,`Phim này không tồn tại id = ${id}`,400,"movieId")
    }
    protected async validateScreen(id:number){
        return await this.screenRepository.isNotFound(id,`Phòng chiếu phim này không tồn tại id = ${id}`,400,'screeId')
    }
    protected async validate(id: number, data: IShowtimeModel) {
        // Kiểm tra sự tồn tại của bản ghi
        if(id) await this.validateShowtime(id);
        const recordScreen = await this.validateScreen(data.screenId)
        await this.validateMovie(data.movieId)
        // Kiểm tra tên có trùng hay không
        const record = await this.isUnique(data);
        if (record && record.id != id) {
          throw new CustomError(`Thời gian chiếu phim ${record.startTime} tại phòng ${recordScreen.name} đã bị trùng lịch`, 400,'name');
        }
      }      
    async create(data: IShowtimeModel): Promise<void> {
        await this.validate(0,data);
        await this.showtimeRepository.create({
            ...data,
            screen:{id:data.screenId},
            movie:{id:data.movieId}
        })
    }
    async createArray(
        datas: IShowtimeModel[],
      ): Promise<void> {
        const arrayData = await datas.map(data=>({
            showDate:data.showDate,
            screenId:data.screenId,
            startTime:data.startTime
        }))
        if(isModuleNamespaceObject(arrayData)){
            throw new CustomError(`Tạo thời gian chiếu phim thất bại vì có model trùng`,400)
        }
        for(const data of datas){
            await this.create(data)
        }
      }
    async remove(id:number,transactionEntityManager?:EntityManager){
        await this.validateShowtime(id)
        await this.showtimeRepository.remove(id,transactionEntityManager)
    }
    async update(id:number,data:IShowtimeModel):Promise<void>{
        await this.validate(id,data);
        await this.showtimeRepository.update(id,{
            ...data,
            screen:{id:data.screenId},
            movie:{id:data.movieId}
        })
    }
    async removeArray(ids:number[]){
        if(IsDuplicatesWithSort(ids)){
            throw new CustomError(`Trong req.body có hai id trùng nhau`,404)
        } 
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            for(const id of ids){
                await this.remove(id,transactionEntityManager)
            }
        })
    }
    async waningDelete(ids:number[]){
        if(Array.isArray(ids)){
            await Promise.all(ids.map(async(id)=>await this.checkWaningDelete(id)))
        }
    }
    protected async checkWaningDelete(id:number){
            await this.validateShowtime(id)
            const records =await (await this.showtimeRepository.createQueryBuilder())
            .innerJoin('showtime.tickets','ticket')
            .andWhere('ticket.showtimeId =:id',{id}).getOne()
            if(records){
                throw new CustomError(`Bạn xóa thời gian chiếu phim ${records.showDate} ${records.startTime} ${records.movie.title}có thể mất nhiều dữ liệu quan trọng`,409)
            }
        }
    
}