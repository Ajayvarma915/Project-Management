import { Router } from "express";
import { createProject,deleteMember,updateMemberRole,getProjectMembers,addMembersToProject,deleteProject,getProjects,getProjectById,updateProject } from "../controllers/project.controller.js";
import  { addMemberToProjectValidator,createProjectValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt,validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router=Router();
router.use(verifyJwt);

router.route('/').get(getProjects).post(createProjectValidator(),validate,createProject);

router.route('/:projectId').get(validateProjectPermission(AvailableUserRole),getProjectById).put(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.MEMBER]),createProjectValidator(),validate,updateProject).delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteProject)

router.route('/:projectId/members').get(getProjectMembers).post(validateProjectPermission([UserRolesEnum.ADMIN]),addMemberToProjectValidator(),validate,addMembersToProject)

router.route('/:projectId/members/:userId').put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole).delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)
export default router