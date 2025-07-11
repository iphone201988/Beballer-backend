import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PlayerModel } from "../type/Database/type";
export const connectDb =async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log('EROORR WHILE CONNECTING DATABASE',error);
    }
}

export const TryCatch =
  (func: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(func(req, res, next)).catch(next);

  export const generateJwtToken = (payload: any) => {
  // { expiresIn: "1d" }
  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}[]:;<>+=?/|";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

type ResponseData = Record<string, any>;
export const SUCCESS = (
  res: Response,
  status: number,
  message: string,
  data?: ResponseData
): ResponseData => {
  return res.status(status).json({
    success: true,
    message,
    ...(data ? data : {}),
  });
};

export const getFileteredUser = (user: PlayerModel) => {
  return {
    ...user,
    jti: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    __v: undefined,
    reports: undefined,
    likes: undefined,
    posts: undefined,
    godchildren: undefined,
    favoriteEvents: undefined,
    followers: undefined,
    games: undefined,
    blockedBy: undefined,
    blockedUsers: undefined,
    friendList: undefined,
    favoriteCourts: undefined,
    favoriteCamps: undefined,
    favoriteTournaments: undefined,
    favoriteBars: undefined,
    deviceToken: undefined,
    deviceType: undefined,
    subscriptions: undefined,
    fcmToken: undefined,
    badge: undefined,
    badges: undefined,
    reported: undefined,
    location: undefined,
    email: undefined,
    profileDescription: undefined,
    geohash: undefined,
    rankCountry: undefined,
    favoriteProTeam: undefined

  };
};

export const getFilterPost = (post: any) => {
  return {
    ...post,
    createdAt: undefined,
    updatedAt: undefined,
    __v: undefined,
  };
};


export const getFiles = (req: Request, fileNames: Array<string>) => {
  const files: any = {};
  fileNames.forEach((fileKey: string) => {
    if (req?.files && req.files[fileKey]) {
      files[fileKey] = req.files[fileKey].map((file: any) => file.key);
    }
  });
  if (Object.keys(files).length) return files;

  return null;
};