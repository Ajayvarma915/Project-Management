import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import Apierror from "../utils/api-error.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getTasks=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;

    const project=await Project.findById(projectId);

    if(!project){
        throw new Apierror(404,"project not found");
    }

    const tasks=await Task.find({
        project:new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo","avatar username fullName");

    return res.status(200).json(new ApiResponse(201,tasks,"tasks fetched successfully"));
})

const createTask=asyncHandler(async(req,res)=>{
    const {title,description,assignedTo}=req.body;
    const {projectId}=req.params;

    const project=await Project.findById(projectId);

    if(!project){
        throw new Apierror(404,"Project not found");
    }

    const files=req.files ||[]

    const attachments=files.map((file)=>{
        return {
            url:`${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype:file.mimetype,
            size:file.size
        }
    })

    const task=await Task.create({
        title,
        description,
        project:new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo? new mongoose.Types.ObjectId(assignedTo):undefined,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
    })

    return res.status(200).json(new ApiResponse(201,task,"task created successfully"));
})

const getTaskById=asyncHandler(async(req,res)=>{
    const {taskId}=req.params;
    const task=await Task.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(taskId),
                
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'assignedTo',
                foreignField:'_id',
                as:'assignedTo',
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1     
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:'subtasks',
                localField:'_id',
                foreignField:'task',
                as:'subtasks',
                pipeline:[
                    {
                        $lookup:{
                            from:'users',
                            localField:'createdBy',
                            foreignField:'_id',
                            as:'createdBy',    
                            pipeline:[
                                {
                                    $project:{
                                        _id:1,
                                        username:1,
                                        fullName:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            createdBy:{
                                $arrayElemAt:["$createdBy",0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                assignedTo:{
                    $arrayElemAt:["$assignedTo",0]
                }
            }
        }
    ])

    if(!task || task.length===0){
        throw new Apierror(404,"task not found")
    }

    return res.status(200).json(new ApiResponse(200, task[0],"task fetched successfully"))
})

const updateTask=asyncHandler(async(req,res)=>{
    const {taskId}=req.params;
    const {title,description,status,assignedTo}=req.body;

    const task=await Task.findById(taskId);
    if(!task){
        throw new Apierror(404,"task not found")
    }

    let attachments=task.attachments;
    const files=req.files || [];

    if(files.length>0){
        attachments=files.map((file)=>({
            url:`${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype:file.mimetype,
            size:file.size,
        }))
    }

    task.title=title?? task.title;
    task.description=description ?? task.description;
    task.status=status ?? task.status;
    task.assignedTo=assignedTo? new mongoose.Types.ObjectId(assignedTo):task.assignedTo;
    task.attachments=attachments;

    await task.save();

    return res.status(200).json(new ApiResponse(200,task,"task updated successfully"))
})

const deleteTask=asyncHandler(async(req,res)=>{
    const {taskId}=req.params;
    const task=await Task.findById(taskId);

    if(!task){
        throw new Apierror(404,"task not found")
    }

    await SubTask.deleteMany({task:taskId});
    await Task.findByIdAndDelete(taskId);

    return res.status(200).json(new ApiResponse(200,null, "Task deleted successfully"))
})

const createSubTask=asyncHandler(async(req,res)=>{
    const {taskId}=req.params;
    const {title}=req.body;

    const task=await Task.findById(taskId);
    if(!task){
        throw new Apierror(404,"task not found");
    }

    const subTask=await SubTask.create({
        title,
        task:new mongoose.Types.ObjectId(taskId),
        createdBy:new mongoose.Types.ObjectId(req.user._id),
    });

    return res.status(201).json(new ApiResponse(201,subTask,"subTask created successfully"));
})

const updateSubTask=asyncHandler(async(req,res)=>{
    const {subTaskId} =req.params;
    const {title,isCompleted}=req.body;

    const subTask=await SubTask.findById(subTaskId);

    if(!subTask){
        throw new Apierror(404,"subTask not found");
    }

    subTask.title=title ?? subTask.title;
    subTask.isCompleted=typeof isCompleted==="boolean" ? isCompleted: subTask.isCompleted;

   await subTask.save();

   return res.status(200).json(new ApiResponse(200,subTask,"subTask updated successfully"));
})

const deleteSubTask=asyncHandler(async(req,res)=>{
    const {subTaskId}=req.params;
    
    const subTask=await subTask.findById(subTaskId);
    if(!subTask){
        throw new Apierror(404, "subTask not found");
    }

    await subTask.findByIdAndDelete(subTaskId);

    return res.status(200).json(new ApiResponse(200,null,"subTask deleted Successfully"))
})

export {
    getTasks,getTaskById,createTask,deleteTask,updateTask,createSubTask,updateSubTask,deleteSubTask
}