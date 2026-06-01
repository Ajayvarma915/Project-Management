import { body, oneOf } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

const userRegisterValidator=()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required.")
            .isEmail()
            .withMessage("Email is invalid."),
        body('username')
            .trim()
            .notEmpty()
            .withMessage("username is required.")
            .isLowercase()
            .withMessage("Must be in lowercase")
            .isLength({min:3})
            .withMessage("username must be 3 characters long."),
        body('password')
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isStrongPassword()
            .withMessage("password is not strong enough"),
        body('fullname')
            .optional()
            .trim(),
    ]
}

const loginValidator=()=>{
    return [
        oneOf([
            body('email')
            .trim()
            .notEmpty()
            .withMessage("Email is required.")
            .isEmail()
            .withMessage("Email is invalid."),
            body('username')
            .trim()
            .notEmpty()
            .withMessage('username is required')
            .isLowercase()
            .withMessage('username must be in lowercase')
            .isLength({min:3})
            .withMessage('username must be 3 characters long.'),
        ],
            "Please provide either a valid email or a valid username."
        ),
        body('password')
        .trim()
        .notEmpty()
        .withMessage('password is required'),
    ]
}

const userChangeCurrentPasswordValidator=()=>{
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("new password is required")
    ]
}

const userForgotPasswordValidator=()=>{
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const userResetForgotPassword=()=>{
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const createProjectValidator=()=>{
    return [
        body("name")
        .notEmpty()
        .withMessage("Name is Required"),
        body("description")
        .optional()
    ]
}

const addMemberToProjectValidator=()=>{
    return [
        body('email')
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid."),
        body('role')
        .notEmpty()
        .withMessage("Role is required")
        .isIn(AvailableUserRole)
        .withMessage("Role is invalid")
    ]
}

const createTaskValidator=()=>{
    return [
        body('title')
        .trim()
        .notEmpty()
        .withMessage("title is Required"),
        body('description')
        .trim()
        .notEmpty()
        .withMessage("description is required")
    ]
}

const createSubTaskValidator=()=>{
    return [
        body('title')
        .trim()
        .notEmpty()
        .withMessage("title is required")
    ]
}

const createProjectNoteValidator=()=>{
    return [
        body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
    ]
}

export {userRegisterValidator,loginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPassword,createProjectValidator,addMemberToProjectValidator,createTaskValidator,createSubTaskValidator,createProjectNoteValidator};