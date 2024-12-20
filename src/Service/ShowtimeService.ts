import { Movie } from "../Data/Movie";
import { Screen } from "../Data/Screen";
import { Showtime } from "../Data/Showtime";
import { IShowtimeModel } from "../Model/ShowtimeModel";
import CustomError from "../validations/CustumError";
import DataService from "./DataService";

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
        return this.showtimeRepository.getBy(id)
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
                showtimes: await this.showtimeRepository.getByArray(data.id)
            }))
        );
        return dataDTO
    }
    protected async isUnique(data:IShowtimeModel){
        const record = await (await this.showtimeRepository
        .createQueryBuilder())
        .where('showtime.showDate = :showDate', { showDate: data.showDate })
        .andWhere('showtime.screenId = :screenId', { screenId: data.screenId })
        .andWhere(':startTime BETWEEN showtime.startTime AND showtime.endTime', { startTime: data.startTime })
        .getOne();

        if(record){
            return true
        }
        return false
    }
    protected async validate(id: number, data: IShowtimeModel) {
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.showtimeRepository.isNotFound(id, `thời gian này không tồn tại id = ${id}`) : null;
        await this.movieRepository.isNotFound(data.movieId,`Phim này không tồn tại id = ${id}`,400,"movieId")
        const recordScreen = await this.screenRepository.isNotFound(data.screenId,`Phòng chiếu phim này không tồn tại id = ${data.screenId}`,400,'screeId')
        // Kiểm tra tên có trùng hay không
        const isNameUnique = await this.isUnique(data);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
        if (record === null && isNameUnique) {
          throw new CustomError(`Thời gian chiếu phim ${record.startTime} tại phòng ${recordScreen.name} đã bị trùng lịch`, 400,'name');
        }
        // Nếu có bản ghi, kiểm tra nếu tên trùng với bản ghi khác, và id không giống nhau
        if (record && isNameUnique && record.id !== id) {
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
        await Promise.all(datas.map(async(data)=>{
            await this.create(data)
        })) 
      }
    async remove(id:number):Promise<void>{
        await this.movieRepository.remove(id)
    }
    async removeArray(ids:number[]):Promise<void>{
        await this.movieRepository.removeArray(ids)
    }
    async update(id:number,data:IShowtimeModel):Promise<void>{
        await this.validate(id,data);
        await this.showtimeRepository.update(id,{
            ...data,
            screen:{id:data.screenId},
            movie:{id:data.movieId}
        })
    }
}