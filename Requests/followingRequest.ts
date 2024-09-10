import { following } from "../data types";
import express from "express";

export type postfollowing = express.Request<{},following|{message:string},{follower:number,following:number},{}>;
export type requestfollowing = express.Request<{},following[]|{message:string},{},{follower:string,following:string}>;
