import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNote } from "../models/note.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import Apierror from "../utils/api-error.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjectNote=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;

    const note=await ProjectNote.find({
        project:new mongoose.Types.ObjectId(projectId)
    }).populate("createdBy","username fullName avatar")
    .sort({createdAt:-1});

    if(!note){
        throw new Apierror(404,"note does not exists")
    }

    return res.status(200).json(new ApiResponse(200,note,"Note fetched successfully"))
})

const createNote=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const {content}=req.body;

    const note=await ProjectNote.create({
        project:new mongoose.Types.ObjectId(projectId),
        createdBy:new mongoose.Types.ObjectId(req.user._id),
        content
    });

    return res.status(201).json(new ApiResponse(201,note,"Note created successfully"))
})

const getNoteDetails=asyncHandler(async(req,res)=>{
    const {noteId}=req.params;

    const note=await ProjectNote.findById(noteId).populate("createdBy","username fullName avatar");

    if(!note){
        throw new Apierror(404,"note does not exists");
    }

    return res.status(200).json(new ApiResponse(200,note,"note details fetched successfully"))
})

const updateNote=asyncHandler(async(req,res)=>{
    const {noteId}=req.params;
    const {content}=req.body;
    const note=await ProjectNote.findById(noteId);

    if(!note){
        throw new Apierror(404,"note not found");
    }

    note.content=content ?? note.content;
    await note.save();

    return res.status(200).json(new ApiResponse(200,note,"note updated successfully"));
})

const deleteNote=asyncHandler(async(req,res)=>{
    const {noteId}=req.params;

    const note=await ProjectNote.findById(noteId);

    if(!note){
        throw new Apierror(404,"note not found");
    }

    await ProjectNote.findByIdAndDelete(noteId);
    
    return res.status(200).json(new ApiResponse(200,null,"note deleted successfully"));
})

export {
    deleteNote,updateNote,getNoteDetails,getProjectNote,createNote
}