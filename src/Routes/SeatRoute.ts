import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import SeatController from '../Controllers/SeatController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { SeatModel } from '../Model/SeatModel';
import { Seat } from '../Data/Seat';
import AppRole from '../Model/GroupRoleModel';

const router = express.Router();
const seatController = new SeatController();

const validateError=new ValidateErrorMiddleware<SeatModel>(SeatModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Seat,'seat',"Không tìm thấy ghế này")
// Lấy tất cả genres với filter và phân trang
router.get('/', seatController.getAllWithFilterAndPagination);

router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,seatController.waningDelete)
router.post("/",authenticateToken([AppRole.Admin])
    , validateError.ValidateError
    ,seatController.create)
router.post("/createArray"
    ,authenticateToken([AppRole.Admin])
    ,validateError.ValidateError
    ,seatController.createArray)
router.delete("/",authenticateToken([AppRole.Admin]),seatController.removeArray)
router.put("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFound
    ,validateError.ValidateError
    ,seatController.update)
router.get("/:id"
    ,validatorNotFound.IsNotFound
    ,seatController.get)
router.delete("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFound
    ,seatController.remove)
router.get('/seatStatus/:id',seatController.getStatusSeat)

export default router;
