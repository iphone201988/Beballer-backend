import { SUCCESS, TryCatch } from "../utils/helper";
import { Request, Response } from "express";
import Game from "../models/game.model";
import mongoose from "mongoose";
import { Types } from "aws-sdk/clients/customerprofiles";


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
    console.log(userId)
    const query = {
        $or: [
            { visible: true },
            { "organizer.ref.id": userId }
        ]
    };
    if (getAll) {
        games = await Game.find(query)
            .select(projection)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        totalGames = await Game.countDocuments(query);
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





export const getGameById = TryCatch(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const gameId = req.params.id;
    console.log(gameId)

    const gameArray = await Game.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(gameId) }
        },
        {
            $addFields: {
                homeTeam: {
                    $first: {
                        $filter: {
                            input: "$team1Players",
                            as: "p",
                            cond: {
                                $eq: ["$$p.collectionName", "players"]
                            }
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "players",
                let: { playerId: "$homeTeam.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$playerId"]
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            sector: 1,
                            //   homeTeamName: "$lastName",
                            //   homeTeamCountry: "$feedCountry"
                        }
                    }
                ],
                as: "homeTeamInfo"
            }
        },

        {
            $addFields: {
                outsideTeam: {
                    $first: {
                        $filter: {
                            input: "$team2Players",
                            as: "p",
                            cond: {
                                $eq: ["$$p.collectionName", "players"]
                            }
                        }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "players",
                let: { playerId: "$outsideTeam.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$playerId"]
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            sector: 1,
                            //   homeTeamName: "$lastName",
                            //   homeTeamCountry: "$feedCountry"
                        }
                    }
                ],
                as: "outsideTeamInfo"
            }
        },














        {
            $lookup: {
                from: "fields",
                let: { fieldId: "$field.ref.id" }, 
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$fieldId"] 
                            }
                        }
                    },
                    {
                        $project: {
                            hoopsCount: 1,
                            netType: 1,
                            boardType: 1,
                            addressString: 1,
                            name:1,
                            king:1,
                            description:1,
                            floorType:1,
                            address:1
                          

                        }
                    }
                ],
                as: "FieldInformation"
            }
        },
        // {
        //     $addFields: {
        //         FieldInformation: { $first: "$FieldInformation" }
        //     }
        // }


    ]);

    const game = gameArray;

    if (!game) {
        return res.status(404).json({ message: "Game not found" });
    }

    // const isPublic = game.visible === true;
    // const isOwner = game.organizer?.ref?.id?.toString() === userId;

    return SUCCESS(res, 200, "Game fetched successfully", { game });
});


const gameControllers =
{
    getGames,
    createGame,
    getGameById
}

export default gameControllers