import { user } from "../data types";
import { Request } from "express";

export type userResponse = {
    _id: number,
    username: string,
    age: number,
    follwers: number,
    following: number,
};

export type postUser = Request<{},user[]|{message:string},{username:string,password:string,age:number},{_id:string}>;
export type requestUser = Request<{},userResponse[],{},{_id:string,username:string}>;
