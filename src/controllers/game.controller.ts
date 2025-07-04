import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response, NextFunction } from "express";
import Game from "../models/game.model";
import mongoose from "mongoose";
import { Types } from "aws-sdk/clients/customerprofiles";
import Players from "../models/players.model";
import { date } from "joi";
import { mode } from "../utils/enum";
import Fields from "../models/fields.model";
import ErrorHandler from "../utils/ErrorHandler";
import { constrainedMemory } from "process";
import ChatGroup from "../models/chatGroup.model";


const createGame = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { mode, courtId, date, isAutoRefereeing, refereeId, team1Players, team2Players } = req.body;
    const { user, userType } = req;

    if (!mode || !courtId || !date) {
        return next(new ErrorHandler("Mode, courtId, and date are required", 400));
    }
    const maxPlayersPerTeam = mode;
    if (team1Players?.length > maxPlayersPerTeam) {
        return next(new ErrorHandler(`Team 1 can only have ${maxPlayersPerTeam} players for mode ${mode}`, 400));
    }
    if (team2Players?.length > maxPlayersPerTeam) {
        return next(new ErrorHandler(`Team 2 can only have ${maxPlayersPerTeam} players for mode ${mode}`, 400));
    }

    const gameData: any = {
        id: new mongoose.Types.ObjectId().toString(),
        mode,
        date: new Date(date),
        isAutoRefereeing: !!isAutoRefereeing,
        status: "scheduled",
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
        team1Players: [],
        team2Players: [],
    };

    if (Array.isArray(team1Players) && team1Players.length > 0) {
        for (const id of team1Players) {
            const player = await Players.findOne({ id });
            if (!player) {
                return next(new ErrorHandler(`User not found with id ${id}`, 400));
            }
            gameData.team1Players.push({
                collectionName: "players",
                id,
                accepted: id === user.id,
            });
        }
    }
    if (Array.isArray(team2Players) && team2Players.length > 0) {
        for (const id of team2Players) {
            const player = await Players.findOne({ id });
            if (!player) {
                return next(new ErrorHandler(`User not found with id ${id}`, 400));
            }
            gameData.team2Players.push({
                collectionName: "players",
                id,
            });
        }
    }
    if (!isAutoRefereeing && refereeId) {
        const referee = await Players.findOne({ id: refereeId });
        if (!referee) {
            return next(new ErrorHandler(`Referee not found with id ${refereeId}`, 400));
        }
        gameData.referee = {
            ref: {
                collectionName: "players",
                id: refereeId,
            },
        };
        gameData.hasAcceptedInvitationReferee = false;
    }

    const newGame = new Game(gameData);
    const savedGame = await newGame.save();

    const chatGroup = new ChatGroup({
        gameId: savedGame.id,
        members: [...(team1Players || []), ...(team2Players || [])],
        lastMessage: null,
    });

    await chatGroup.save();

    return SUCCESS(res, 201, "Game created successfully", {
        data: savedGame,
    });
});


const getGames = TryCatch(async (req: Request, res: Response) => {
    const { user, userType } = req;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const getAll = req.query.getAll === 'true' ? true : false;
    const skip = (page - 1) * limit;
    const [lng, lat] = user.location.coordinates;

    const games = await Fields.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                distanceField: "distance",
                maxDistance: 20000,
                spherical: true,
            },
        },
        {
            $lookup: {
                from: "games",
                let: { fieldId: "$id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$field.ref.id", "$$fieldId"] },
                                    {
                                        $or: getAll
                                            ? [
                                                { $eq: ["$visible", true] }
                                            ]
                                            : [
                                                {
                                                    $and: [
                                                        { $eq: ["$organizer.ref.id", user.id] },
                                                        {
                                                            $eq: [
                                                                "$organizer.ref.collectionName",
                                                                userType === "player" ? "players" : "organizers"
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    $in: [user.id, "$team1Players.id"]
                                                },
                                                {
                                                    $in: [user.id, "$team2Players.id"]
                                                }
                                            ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "games"
            }
        },
        {
            $unwind: "$games",
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ["$games", { field: "$$ROOT" }],
                },
            },
        },
        {
            $project: {
                createdAt: 1,
                date: 1,
                mode: 1,
                id: 1,
                totalJoinedPlayers: {
                    $concat: [
                        {
                            $toString: {
                                $add: [
                                    { $size: { $ifNull: ["$team1Players", []] } },
                                    { $size: { $ifNull: ["$team2Players", []] } },
                                ],
                            },
                        },
                        "/",
                        { $toString: "$mode" },
                    ],
                },
                status: 1,
                "field._id": 1,
                "field.id": 1,
                "field.name": 1,
                "field.postalCode": 1,
                "field.photos": 1,
                "field.long": { $arrayElemAt: ["$field.location.coordinates", 0] },
                "field.lat": { $arrayElemAt: ["$field.location.coordinates", 1] },
            },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
    ]);

    return SUCCESS(res, 200, "Games fetched successfully", {
        data: {
            games
        }
    });

});


const getGameById = TryCatch(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const gameId = req.params.id;

    const game = await Game.aggregate([
        {
            $match: {
                id: gameId,
            }
        },
        {
            $lookup: {
                from: "players",
                let: { organizerId: "$organizer.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$organizerId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1
                        },
                    },
                ],
                as: "organizer",
            },
        },
        {
            $unwind: {
                path: "$organizer",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: "players",
                let: { team1PlayerIds: "$team1Players.id", team1PlayerStatus: "$team1Players.accepted" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$id", "$$team1PlayerIds"],
                            },
                        },
                    },
                    {
                        $addFields: {
                            accepted: {
                                $arrayElemAt: [
                                    "$$team1PlayerStatus",
                                    {
                                        $indexOfArray: ["$$team1PlayerIds", "$id"]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            city: 1,
                            accepted: 1
                        },
                    },
                ],
                as: "team1Players",
            },
        },

        {
            $lookup: {
                from: "players",
                let: { team2PlayerIds: "$team2Players.id", team2PlayerStatus: "$team2Players.accepted" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$id", "$$team2PlayerIds"],
                            },
                        },
                    },
                    {
                        $addFields: {
                            accepted: {
                                $arrayElemAt: [
                                    "$$team2PlayerStatus",
                                    {
                                        $indexOfArray: ["$$team2PlayerIds", "$id"]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            accepted: 1
                        },
                    },
                ],
                as: "team2Players",
            },
        },
        {
            $lookup: {
                from: "fields",
                let: { fieldId: "$field.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$fieldId"],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "players",
                            let: { contributorId: "$contributor.ref.id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$id", "$$contributorId"]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        id: 1,
                                        username: 1
                                    }
                                }
                            ],
                            as: "contributor"
                        }
                    },
                    {
                        $unwind: {
                            path: "$contributor",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            name: 1,
                            contributor: 1,
                            address: 1,
                            boardType: 1,
                            city: 1,
                            floorType: 1,
                            hoopsCount: 1,
                            photos: 1,
                            netType: 1
                        },
                    },
                ],
                as: "field",
            }
        },
        {
            $unwind: {
                path: "$field",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "players",
                let: { refereeId: "$referee.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$refereeId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1
                        },
                    },
                ],
                as: "referee",
            }
        },
        {
            $unwind: {
                path: "$referee",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                id: 1,
                organizer: 1,
                team1Players: 1,
                team2Players: 1,
                hasAcceptedInvitationTeam1: 1,
                hasAcceptedInvitationTeam2: 1,
                mode: 1,
                date: 1,
                status: 1,
                field: 1,
                isAutoRefereeing: 1,
                referee: 1
            }
        }


    ]);

    return SUCCESS(res, 200, "Game fetched successfully", {
        data: {
            game
        }
    });

});


const addPlayerToGame = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { gameId, playerId , team } = req.body;   //playerId = id , gameId = id
    const { userId, userType } = req;

    const game = await Game.findOne({ id: gameId });
    if (!game) return next(new ErrorHandler("Game not found", 404));

    if(team === 1){
       if(game.team1Players.length >= game.mode) return next(new ErrorHandler(`You can only select ${game.mode} players for selected mode ${game.mode}`, 400));
       const player = await Players.findOne({ id: playerId });
       if (!player) return next(new ErrorHandler(`User not found with id ${playerId}`, 400));
       game.team1Players.push(
            {
                collectionName: "players",
                id: playerId
            }
        )
        await game.save();
       const chatGroup = await ChatGroup.findOne({ gameId: gameId });
       if(!chatGroup) return next(new ErrorHandler("Chat group not found", 404));
       chatGroup.members.push(playerId);
       await chatGroup.save();
       
    }else{
        if(game.team2Players.length >= game.mode) return next(new ErrorHandler(`You can only select ${game.mode} players for selected mode ${game.mode}`, 400));
        const player = await Players.findOne({ id: playerId });
        if (!player) return next(new ErrorHandler(`User not found with id ${playerId}`, 400));
        game.team2Players.push(
            {
                collectionName: "players",
                id: playerId
            }
        )
        await game.save();
        const chatGroup = await ChatGroup.findOne({ gameId: gameId });
        if(!chatGroup) return next(new ErrorHandler("Chat group not found", 404));
        chatGroup.members.push(playerId);
        await chatGroup.save();
    }

    SUCCESS(res, 200, "Player added to game successfully");

})


const gameControllers =
{
    getGames,
    createGame,
    getGameById,
    addPlayerToGame
}

export default gameControllers