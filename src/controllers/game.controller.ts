import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response } from "express";
import Game from "../models/game.model";
import mongoose from "mongoose";


export const createGame = TryCatch(async (req: Request, res: Response) => {
    const { mode, courtId, date, isAutoRefereeing, refereeId } = req.body;
    const { user, userType } = req
 

    const gameData: any = {
        id: new mongoose.Types.ObjectId().toString(),
        mode,
        date: date ? new Date(date) : new Date(),
        isAutoRefereeing: !!isAutoRefereeing,
        status: "scheduled",
        team1Players: [
            {
                id: user.id,
                collectionName: "players",
            },
        ],
        field: {
            ref: {
                id: courtId,
                collectionName: "fields",
            },
        },
        organizer: {
            ref: {
                id: user.id,
                collectionName: userType === "player" ? "players" : "organizers",
            },
        },
    };

    if (!isAutoRefereeing && refereeId) {
        gameData.referees = [
            {
                id: refereeId,
                collectionName: userType === "player" ? "players" : "organizers",
            },
        ];
        gameData.hasAcceptedInvitationReferee = false;
    }

    const newGame = new Game(gameData);
    const savedGame = await newGame.save();

    return SUCCESS(res, 201, "Game created successfully", {
        game: savedGame,
    });
});


export const getGames = TryCatch(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const getAll = req.query.getAll === "true";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const projection = "id date mode status field.ref createdAt";

    let games;
    let totalGames;

    if (getAll) {
        games = await Game.find()
            .select(projection)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        totalGames = await Game.countDocuments();
    } else {
        games = await Game.find({ "organizer.ref.id": userId })
            .select(projection)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        totalGames = await Game.countDocuments({ "organizer.ref.id": userId });
    }

    return SUCCESS(res, 200, getAll ? "All games fetched" : "User's games fetched", {
        games,
        currentPage: page,
        totalPages: Math.ceil(totalGames / limit),
        totalGames,
    });
});


const gameControllers =
{
    getGames,
    createGame
}

export default gameControllers