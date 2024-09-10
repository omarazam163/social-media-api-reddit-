import { Request } from "express";
import { comment } from "../data types";
export type commentresponse = {
    user: {
        username: string,
        _id: number,
        age: number
    },
    _id: number,
    post_id: number,
    content: string,
    created_at: Date,
    upvaotes: number,
}
export type postComment = Request<{},comment|{message:string},{post_id:number,content:string,parent_id:number|null,user_id:number}>
export type requestcomment = Request<{},commentresponse[],{},{post_id:string}>
