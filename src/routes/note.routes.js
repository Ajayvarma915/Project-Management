import { Router } from "express";
import { deleteNote,updateNote,getNoteDetails,getProjectNote,createNote } from "../controllers/note.controller.js";
import  { createProjectNoteValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt,validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router=Router();
router.use(verifyJwt)


const VIEW_ROLES = [
  UserRolesEnum.ADMIN,
  UserRolesEnum.PROJECT_ADMIN,
  UserRolesEnum.MEMBER
]


router.route('/:projectId').get(validateProjectPermission(VIEW_ROLES),getProjectNote).post(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),createProjectNoteValidator(),validate,createNote);

router.route('/:projectId/n/:noteId').get(validateProjectPermission(VIEW_ROLES),getNoteDetails).put(validateProjectPermission([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]),createProjectNoteValidator(),validate,updateNote).delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteNote);

export default router;