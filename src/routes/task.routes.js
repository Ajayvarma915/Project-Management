import { Router } from "express";
import { getTasks,getTaskById,createTask,deleteTask,updateTask,createSubTask,updateSubTask,deleteSubTask } from "../controllers/task.controller.js";
import  { createSubTaskValidator,createTaskValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt,validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();

router.use(verifyJwt);

router.route('/:projectId').get(getTasks).post(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),upload.array("attachments",5),createTaskValidator(),validate,createTask)

router.route('/:projectId/t/:taskId').get(getTaskById).put(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),upload.array("attachments",5),updateTask).delete(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),deleteTask)

router.route('/:projectId/t/:taskId/subtasks').post(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),createSubTaskValidator(),validate,createSubTask);

router.route('/:projectId/st/:subTaskId').put(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),updateSubTask).delete(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),deleteSubTask)

export default router;