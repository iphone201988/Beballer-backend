import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
// import ErrorHandler from "../utils/ErrorHandler";
import { TryCatch } from "../utils/helper";
import Players from "../models/players.model";
import Organizer from "../models/organizers.model";
import ErrorHandler from "../utils/ErrorHandler";
import { userType } from "../utils/enum";

export const authenticationMiddleware = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return next(new ErrorHandler("Please login to access the route", 401));

    const token = authHeader.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log("====decode", decode);
    if (!decode) return next(new ErrorHandler("Invalid token", 401));

    let user;
    if (decode.type === userType.PLAYER) {
      user = await Players.findById(decode.userId);
    } else {
      user = await Organizer.findById(decode.userId);
    }

    if (!user) return next(new ErrorHandler("User not found", 401));

    if (decode.jti !== user.jti)
      return next(new ErrorHandler("Unauthorized", 401));

    await user.save();
    req.userId = user._id.toString();
    req.user = user;
    next();
  }
);
