import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";

/*
const healthcheck=async (req,res,next)=>{
    try {
        res.status(200).json(
            new ApiResponse(200,{message:"Server is running"})
        )
    } catch (error) {
        next(err)
    }
}

*/

const healthcheck=asyncHandler(async(req,res)=>{
    res.status(200).json(
        new ApiResponse(200,{message:"server is running"})
    )
})
export default healthcheck;