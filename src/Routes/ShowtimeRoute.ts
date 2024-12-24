import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import ShowtimeController from '../Controllers/ShowtimeController';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Showtime } from '../Data/Showtime';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { ShowtimeModel } from '../Model/ShowtimeModel';
import AppRole from '../Model/GroupRoleModel';


const router = express.Router();
const showtimeController = new ShowtimeController()
const validateNotFound = new ValidatorNotFoundMiddlewares(Showtime,'showtime','Thời gian chiếu phim này không tồn tại')
const validateError = new ValidateErrorMiddleware(ShowtimeModel)
// Lấy tất cả genres với filter và phân trang
router.get('/', showtimeController.getAllWithFilterAndPagination);
router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validateNotFound.IsNotFoundArray
    ,showtimeController.waningDelete)
router.post("/"
    ,authenticateToken([AppRole.Admin])
    ,validateError.ValidateError
    ,showtimeController.create)
router.post('/createArray'
    ,authenticateToken([AppRole.Admin])
    ,validateError.ValidateError
    ,showtimeController.createArray)
router.delete("/"
    ,authenticateToken([AppRole.Admin])
    ,validateNotFound.IsNotFoundArray
    ,showtimeController.removeArray)
router.put("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validateNotFound.IsNotFound
    ,validateError.ValidateError
    ,showtimeController.update)
router.delete("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validateNotFound.IsNotFound
    ,showtimeController.remove)

router.get("/:id"
    ,validateNotFound.IsNotFound
    ,showtimeController.get)

export default router;
