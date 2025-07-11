import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response, NextFunction } from "express";
import Organizer from "../models/organizers.model";
import ErrorHandler from "../utils/ErrorHandler";
import Players from "../models/players.model";


const createOrganisProfile = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { user, userType } = req;
    const profilePicture = req.s3UploadedKeys?.profilePicture?.[0];
    const { username, email, feedCountry } = req.body;

    const playerAccount = await Players.findOne({ id: user.id });

    if (playerAccount?.hasOrganizerAccount) {
        return next(new ErrorHandler("Player already has an Organizer account", 400));
    }

    if (userType === "organizer") {
        console.log("Organizer already exists");
        await Organizer.updateOne(
            { id: user.id },
            {
                $set: {
                    username,
                    email,
                    feedCountry,
                    profilePicture,
                    hasPlayerAccount: !!playerAccount
                },
            },
            { upsert: true }
        );

        if (playerAccount) {
            playerAccount.hasOrganizerAccount = true;
            await playerAccount.save();
        }

        return SUCCESS(res, 200, "Organizer Profile Created");
    }

 
    const organizer = await Organizer.create({
        id: user.id,
        username,
        email,
        feedCountry,
        profilePicture,
        hasPlayerAccount: !!playerAccount
    });

    if (playerAccount) {
        playerAccount.hasOrganizerAccount = true;
        await playerAccount.save();
    }

    return SUCCESS(res, 200, "Organizer Profile Created");
});


const organizerController = {
    createOrganisProfile
};

export default organizerController;