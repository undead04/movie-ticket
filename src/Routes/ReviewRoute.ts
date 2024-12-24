import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import ReviewController from '../Controllers/ReviewController';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Review } from '../Data/Review';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { ReviewModel, ReviewUpdateModel } from '../Model/ReviewModel';
import AppRole from '../Model/GroupRoleModel';

const router = express.Router();
const reviewController = new ReviewController()
const validateNotFound = new ValidatorNotFoundMiddlewares(Review,'review','Không tìm thấy bài viết này')
const validatePostReview = new ValidateErrorMiddleware(ReviewModel)
const validateUpdateReview = new ValidateErrorMiddleware(ReviewUpdateModel)
// Lấy tất cả genres với filter và phân trang
router.get('/', reviewController.getAllWithFilterAndPagination);
router.get("/:id"
    ,validateNotFound.IsNotFound
    ,reviewController.get)
router.post("/"
    ,authenticateToken()
    ,validatePostReview.ValidateError
    ,reviewController.create)
router.put("/:id"
    ,authenticateToken()
    ,validateNotFound.IsNotFound
    ,validateUpdateReview.ValidateError
    ,reviewController.update)
router.delete("/:id"
    ,authenticateToken()
    ,validateNotFound.IsNotFound
    ,reviewController.remove)
router.delete('/'
    ,authenticateToken([AppRole.Admin])
    ,validateNotFound.IsNotFoundArray
    ,reviewController.removeArray)
export default router;
