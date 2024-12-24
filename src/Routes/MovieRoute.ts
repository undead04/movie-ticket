import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import MovieController from '../Controllers/MoiveController';
import { MovieModel } from '../Model/MovieModel';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Movie } from '../Data/Movie';
import AppRole from '../Model/GroupRoleModel';

const router = express.Router();
const movieController = new MovieController()
const validateError=new ValidateErrorMiddleware(MovieModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Movie,'movie',"Không tìm thấy phim này")
// Lấy tất cả genres với filter và phân trang
router.get('/', movieController.getAllWithFilterAndPagination);

router.post("/"
    ,authenticateToken([AppRole.Admin])
    ,validateError.ValidateError
    ,movieController.create)
// chech trước khi xóa
router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,movieController.waningDelete)
router.delete('/'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,movieController.removeArray)
router.post("/createArray"
    ,authenticateToken([AppRole.Admin])
    ,validateError.ValidateError
    ,movieController.createArray)
router.put("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFound
    ,validateError.ValidateError
    ,movieController.update)
router.delete("/:id"
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFound
    ,movieController.remove)
router.get("/:id"
    ,validatorNotFound.IsNotFound
    ,movieController.get)
export default router;
