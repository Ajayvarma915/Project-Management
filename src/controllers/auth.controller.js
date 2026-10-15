import { User } from "../models/user.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import Apierror from "../utils/api-error.js";
import { emailVerificationMailGen, forgotPasswordMailGen, sendEmail } from "../utils/mail.js";
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        
        user.refreshToken=refreshToken;
    
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new Apierror(500,"Something went wrong while generating access token")
    }
}


const registerUser=asyncHandler(async (req,res)=>{
    const {username,email,password,role}=req.body;

    const existingUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existingUser){
        throw new Apierror(409,"User with username or email already existed!!!")
    }

    const newUser=await User.create({
        email,
        username,
        password,
        isEmailVerified:false
    })

    const {unHashedToken,hashedToken,tokenExpiry}=newUser.generateTemporaryToken();
    newUser.emailVerificationToken=hashedToken;
    newUser.emailVerificationExpiry=tokenExpiry;

    await newUser.save({validateBeforeSave:false});

    await sendEmail({
        email:newUser?.email,
        subject:"Please verify your email",
        mailgenContent:emailVerificationMailGen(newUser?.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    })

    const createdUser=await User.findById(newUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    if(!createdUser){
        throw new Apierror(500,"Something went wrong while registering a new user.")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            {user:createdUser},
            "user registered succesfully and verification email has been sent on your email"
        )
    )
})


const loginUser=asyncHandler(async (req,res)=> {
    const {username,email,password}=req.body;

    const existingUser=await User.findOne({
        $or:[{email},{username}]
    })
    if(!existingUser){
        throw new Apierror(409,"User does not exist or check your email,Please register.");
    }
    const checkPassword=await existingUser.isPasswordCorrect(password);
    if(!checkPassword)
    {
        throw new Apierror(409,"Incorrect Password entered, Check your password.");
    }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(existingUser._id)
    
    const loggedInUser=await User.findById(existingUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options={
        httpOnly:true,
        secure:false 
    }
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully"));
})


const logoutUser=asyncHandler(async (req,res)=>{
    const loggedInUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true,
        }
    );

    const options={
        httpOnly:true,
        secure:false
    }

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User logged Out Successfully."))
})

const getCurrentUser=asyncHandler(async (req,res)=>{
    return res
        .status(200)
        .json(
            new ApiResponse(200,req.user,"Current User fetched Successfully")
        )
})

const verifyEmail=asyncHandler(async (req,res)=>{
    const {verficationToken}=req.params;

    if(!verficationToken){
        throw new Apierror("Email verification token is missing");
    }

    let hashedToken=crypto.createHash('sha256').update(verficationToken).digest('hex');

    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })

    if(!user){
        throw new Apierror(400,"token is invalid or expired"); 
    }

    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{isEmailVerified:true},"Email verification is successful"))
})

const resendEmailVerification=asyncHandler(async (req,res)=>{
    const existingUser=await User.findById(req.user?._id);

    if(!existingUser){
        throw new Apierror(404,"User does not exist");
    }

    if(existingUser.isEmailVerified){
        throw new Apierror(409,"Email is already verified")
    }

    const {unHashedToken,hashedToken,tokenExpiry}=existingUser.generateTemporaryToken();
    existingUser.emailVerificationToken=hashedToken;
    existingUser.emailVerificationExpiry=tokenExpiry;

    await existingUser.save({validateBeforeSave:false});

    await sendEmail({
        email:existingUser?.email,
        subject:"Please verify your email",
        mailgenContent:emailVerificationMailGen(existingUser?.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    })

    return res.status(200).json(new ApiResponse(200,{},"Mail has been sent to your email, Please verify it."));
})

const refreshExistingRefreshToken=asyncHandler(async (req,res)=>{
    const existingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if(!existingRefreshToken){
        throw new Apierror(401, "Unauthorized access")
    }

    try {
        const decodedRefreshToken=jwt.verify(existingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        
        const existingUser=await User.findById(decodedRefreshToken?._id);
        
        if(!existingUser){
            throw new Apierror(401,"Invalid refresh token")
        }

        if(existingRefreshToken!==existingUser?.refreshToken){
            throw new Apierror(401,"refresh token is expired")
        }

        const options={
            httpOnly:true,
            secure:false
        }

        const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(existingUser._id);

        existingUser.refreshToken=refreshToken;
        await existingUser.save({validateBeforeSave:false})

        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken},"access token refreshed"))
    } catch (error) {
        throw new Apierror(401,"Invalid refresh token1")
    }
})

const forgotPasswordRequest=asyncHandler(async (req,res)=>{
    const {email}=req.body;

    const existingUser=await User.findOne({email});

    if(!existingUser){
        throw new Apierror(404,"User does not exists");
    }

    const {unHashedToken,hashedToken,tokenExpiry}=existingUser.generateTemporaryToken();

    existingUser.forgotPasswordToken=hashedToken;
    existingUser.forgotPasswordExpiry=tokenExpiry;

    await existingUser.save({validateBeforeSave:false})

    await sendEmail({
        email:existingUser?.email,
        subject: "Password Reset",
        mailgenContent:forgotPasswordMailGen(
            existingUser.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
        )
    })

    return res.status(200).json(new ApiResponse(200,{},"Forgot Password email sent successfully to your mail ID"))
})

const resetForgotPassword=asyncHandler(async (req,res)=>{
    const {resetToken}=req.params;
    const {newPassword}=req.body;

    let hashedToken=crypto.createHash("sha256").update(resetToken).digest('hex')

    let existingUser=await User.findOne({
        forgotPasswordToken:hashedToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })

    if(!existingUser){
        throw new Apierror(489,"Token is invalid or expired")
    }

    existingUser.forgotPasswordExpiry=undefined;
    existingUser.forgotPasswordToken=undefined;

    existingUser.password=newPassword;

    await existingUser.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},"password reset successfully"));
})

const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body;

    const existingUser=await User.findById(req.user?._id);

    const isPasswordCorrect=await existingUser.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new Apierror(400,"Old Password entered is Incorrect.")
    }

    existingUser.password=newPassword;
    await existingUser.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},"Password Changed Successfully."));
})


export {registerUser,loginUser,logoutUser,getCurrentUser,verifyEmail, resendEmailVerification,refreshExistingRefreshToken,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword}