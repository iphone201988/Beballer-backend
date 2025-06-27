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
        return next(new ErrorHandler("User already onboarded", 200));
    }
    user.isOnboardAnalyticsDone = !user.isOnboardAnalyticsDone;
    await user.save();
    return SUCCESS(res, 200, "Onboard Analytics Status Updated");
});



const createPlayerProfile = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;
    const {
        firstName,
        lastName,
        username,
        birthDate,
        gender,
        height,
        country,
        countryCode,
        city,
        position,
        favoriteProTeam,
        recutersViewed,
        playPositionId,
        setProfilePopup,
        setSettingsPopup
    } = req.body;

    const profilePicture = req.s3UploadedKeys?.profilePicture?.[0];

    const player = await Players.findById(userId);
    if (!player) return next(new ErrorHandler("User not found", 400));
    if (!player.isOnboardAnalyticsDone) {
        return next(new ErrorHandler("User not onboarded", 400));
    }

    if (firstName !== undefined) player.firstName = firstName;
    if (lastName !== undefined) player.lastName = lastName;
    if (username !== undefined) player.username = username;
    if (birthDate !== undefined) player.birthDate = birthDate;
    if (gender !== undefined) player.gender = gender;
    if (height !== undefined) player.height = height;
    if (profilePicture !== undefined) player.profilePicture = profilePicture;
    if (country !== undefined) player.country = country;
    if (countryCode !== undefined) player.countryCode = countryCode;
    if (position !== undefined) player.position = position;
    if (city !== undefined) player.city = city;
    if (recutersViewed !== undefined) player.recutersViewed = recutersViewed;
    if (playPositionId !== undefined) player.playPositionId = playPositionId;

    if (favoriteProTeam !== undefined) {
        player.favoriteProTeam = {
            ref: {
                collectionName: 'progamesteams',
                id: favoriteProTeam
            }
        };
    }

    if (setProfilePopup !== undefined) player.setProfilePopup = setProfilePopup;
    if (setSettingsPopup !== undefined) player.setSettingsPopup = setSettingsPopup;

    if (!player.isProfileCompleted) {
        player.isProfileCompleted = true;
    }

    await player.save();
    return SUCCESS(res, 200, player.isProfileCompleted ? "Profile Updated" : "Profile Created");
});


const getTeams = TryCatch(async (req: Request, res: Response) => {
 const teams = await ProGamesTeams.aggregate([
        {
            $project: {
                coordinates: '$location.coordinates',
                _id: 1,
                id:1,
                name: 1,
                type: 1,
                url: 1,
                imageURL: 1 // Exclude _id
            }
        }
    ]);

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