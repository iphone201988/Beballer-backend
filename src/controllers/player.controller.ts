import Players from "../models/players.model";
import ErrorHandler from "../utils/ErrorHandler";
import { getFiles, SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response, NextFunction } from "express";
import ProGamesTeams from "../models/proGamesTeams.model";
import teamsModel from "../models/teams.model";
const isOnboardAnalyticsDone = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;
    const user = await Players.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 400));
    if (user.isOnboardAnalyticsDone) {
        return next(new ErrorHandler("User already onboarded", 400));
    }
    user.isOnboardAnalyticsDone = !user.isOnboardAnalyticsDone;
    await user.save();
    return SUCCESS(res, 200, "Onboard Analytics Status Updated");
});



const createPlayerProfile = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;
    const { firstName, lastName, username, birthDate, gender, height,country,countryCode } = req.body;
    const profilePicture = req.s3UploadedKeys.profilePicture[0];
    const player = await Players.findById(userId);
    if (!player) return next(new ErrorHandler("User not found", 400));
    if (!player.isOnboardAnalyticsDone) {
        return next(new ErrorHandler("User not onboarded", 400));
    }
    player.firstName = firstName;
    player.lastName = lastName;
    player.username = username;
    player.birthDate = birthDate;
    player.gender = gender;
    player.height = height;
    player.profilePicture = profilePicture;
    player.country = country;
    player.countryCode = countryCode;

    await player.save();
    console.log('===========askcxazoxcxjio',player);
    return SUCCESS(res, 200, "Profile Created");
});

const getTeams = TryCatch(async (req: Request, res: Response) => {
    const teams = await ProGamesTeams.find();

    return SUCCESS(res, 200, "Teams Fetched Successfully", {
        data: teams
    })
});


const playerController = {
    isOnboardAnalyticsDone,
    createPlayerProfile,
    getTeams
};

export default playerController