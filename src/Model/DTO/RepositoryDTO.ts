export class RepositoryDTO<T> {
    status: number;
    message: string;
    data: T;
  
    constructor(status: number, message: string, data: T) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  
    public static WithData<T>(status: number, data: T): RepositoryDTO<T> {
      return new RepositoryDTO<T>(status,"", data);
    }
    public static Success<T>(message:string):RepositoryDTO<T>{
        return new RepositoryDTO<T>(200,message,null)
    }
    public static Error<T>(status:number,message:string):RepositoryDTO<T>{
        return new RepositoryDTO<T>(status,message,null)
    }
  }
  