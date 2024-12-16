
import dataService from "./DataService";
import { Payment } from "../Data/Payment";
import { IPaymentModel } from "../Model/PaymentModel";
const getAllWithFilterAndPagination = async ( page: number = 1, pageSize: number = 10) => {
  let queryBuilder =(await dataService.getBuilderQuery(Payment))
  const data=await dataService.getAllPagination(Payment,queryBuilder,page,pageSize)
  return data
  };
const create=async (model:IPaymentModel) => {
    
    await dataService.create(Payment,{
        ...model,
        bill:{id:model.billId}
    });
}

const update= async(id:number,model:IPaymentModel) => {
     const record=await getById(id)
    await dataService.update(Payment,record,{
        ...model,
        bill:{id:model.billId}
    });
}
const remove = async (id: number|number[])=> {
    const record=await getById(id)
   await dataService.remove(Payment,record)
}
const getById = async (id:number|number[]) => {
  const data =await dataService.getBy(Payment,id)
  return data;
}
const paymentService={getAllWithFilterAndPagination,getById,create,remove,update}
export default paymentService