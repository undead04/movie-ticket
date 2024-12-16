import express from 'express';
import groupRoleController from '../Controllers/GroupRoleController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', groupRoleController.getAllWithFilterAndPagination);
router.get("/:id",groupRoleController.get)
router.post("/",groupRoleController.create)
router.put("/:id",groupRoleController.update)
router.delete("/:id",groupRoleController.remove)
router.post('/createArray',groupRoleController.createArray)
export default router;
