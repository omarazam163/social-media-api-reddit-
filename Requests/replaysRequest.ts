import { Request } from "express";

export type replaysresponse = {
    user: {
        username: string,
        _id: number,
        age: number
    },
    _id: number,
    post_id: number,
    content: string,
    created_at: Date,
    parent_id: number,
    upvotes: number,
}
export type requestReplay = Request<{},replaysresponse[],{},{comment_id:string}>
