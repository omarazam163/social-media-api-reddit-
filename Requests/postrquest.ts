import {post} from "../data types";
import express from "express";


export type postresponse={
    user:{
        username:string,
        age:number,
        _id:number
    },
    _id:number,
    content:string,
    image_content:string,
    created_at:Date,
    upvotes:number,
}
export type postPost = express.Request<{},post[],{user_id:number,content:string,image_content:string},{}>;
export type requestpost=express.Request<{},postresponse[],{},{_id:string,search:string}>


