import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import SeatController from '../Controllers/SeatController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { SeatModel } from '../Model/SeatModel';
import { Seat } from '../Data/Seat';

const router = express.Router();
const seatController = new SeatController();

const validateError=new ValidateErrorMiddleware<SeatModel>(SeatModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Seat,'seat',"Không tìm thấy ghế này")
// Lấy tất cả genres với filter và phân trang
router.get('/', seatController.getAllWithFilterAndPagination);
router.get("/:id"
    ,validatorNotFound.IsNotFound
    ,seatController.get)
router.get('/seatStatus/:id',seatController.getStatusSeat)
router.post("/",authenticateToken
    , validateError.ValidateError
    ,seatController.create)
router.post("/createArray"
    ,authenticateToken
    ,validateError.ValidateError
    ,seatController.createArray)
router.put("/:id"
    ,authenticateToken
    ,validatorNotFound.IsNotFound
    ,validateError.ValidateError
    ,seatController.update)
router.delete("/:id"
    ,authenticateToken
    ,validatorNotFound.IsNotFound
    ,seatController.remove)
router.delete("/",authenticateToken,seatController.removeArray)
export default router;
