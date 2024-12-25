import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import BillController from '../Controllers/BillController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Bill } from '../Data/Bill';
import { BillModel, BillUpdateModel } from '../Model/BillModel';

const router = express.Router();
const billController = new BillController()
const validateError= new ValidateErrorMiddleware(BillModel)
const validateUpdateBill = new ValidateErrorMiddleware(BillUpdateModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Bill,'bill',"Không tìm thấy hóa đơn này này")
// Lấy tất cả genres với filter và phân trang
router.get('/', authenticateToken(),billController.getAllWithFilterAndPagination);

router.post("/"
    ,authenticateToken()
    ,validateError.ValidateError
    ,billController.create)
router.delete("/:id"
    ,validatorNotFound.IsNotFound
    ,billController.remove)
router.put('/:id',authenticateToken()
    ,validatorNotFound.IsNotFound,
    validateUpdateBill.ValidateError
    ,billController.update)
router.get('/:id',
    authenticateToken()
    ,validatorNotFound.IsNotFound
    ,billController.get
)
export default router;
