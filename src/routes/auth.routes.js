import { Router } from "express";
import {changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshExistingRefreshToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail} from "../controllers/auth.controller.js";
import  { loginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userRegisterValidator, userResetForgotPassword } from "../validators/index.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router=Router();

//unsecured routes  
router.route('/register').post(userRegisterValidator(),validate,registerUser);
router.route('/login').post(loginValidator(),validate,loginUser);
router.route('/verify-email/:verficationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshExistingRefreshToken);
router.route('/forgot-password').post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route('/reset-password/:resetToken').post(userResetForgotPassword(),validate,resetForgotPassword);


//secure routes
router.route('/logout').post(verifyJwt,logoutUser);
router.route('/current-user').get(verifyJwt,getCurrentUser);
router.route('/change-password').post(userChangeCurrentPasswordValidator(),validate,verifyJwt,changeCurrentPassword)
router.route('/resend-email-verification').post(verifyJwt,resendEmailVerification)

export default router;  