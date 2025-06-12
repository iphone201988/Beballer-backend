import { Request, Response } from "express";
import { SUCCESS, TryCatch } from "../utils/helper";
import Posts from "../models/post.model";

const getPosts = TryCatch(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await Posts.aggregate([
        {
            $lookup: {
                from: "events",
                localField: "event.ref.id",
                foreignField: "id",
                as: "event"
            }
        },
        {
            $lookup: {
                from: "games",
                localField: "game.ref.id",
                foreignField: "id",
                as: "game"
            }
        },
        {
            $lookup: {
                from: "fields",
                localField: "court.ref.id",
                foreignField: "id",
                as: "court"
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $addFields: {
                publisherCollection: "$publisher.ref.collectionName",
            }
        },
        {
            $lookup: {
                from: "organizers",
                let: { pubId: "$publisher.ref.id", collection: "$publisher.ref.collectionName" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ["$id", "$$pubId"] }, { $eq: ["$$collection", "organizers"] }]
                            }
                        }

                    },
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            email: 1,
                            location: 1
                        }
                    }
                ],
                as: "publisherOrganizer"
            }
        },

        // Lookup from 'players'
        {
            $lookup: {
                from: "players",
                let: { pubId: "$publisher.ref.id", collection: "$publisher.ref.collectionName" },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ["$id", "$$pubId"] }, { $eq: ["$$collection", "players"] }] } } }, {
                        $project: {
                            _id: 0,
                            username: 1,
                            email: 1,
                            location: 1
                        }
                    }
                ],
                as: "publisherPlayer"
            }
        },

        // Merge publisher info into a single field
        {
            $addFields: {
                publisherData: {
                    $cond: [
                        { $eq: ["$publisher.ref.collectionName", "organizers"] },
                        { $arrayElemAt: ["$publisherOrganizer", 0] },
                        { $arrayElemAt: ["$publisherPlayer", 0] }
                    ]
                }
            }
        },
        {
            $project: {
                publisherOrganizer: 0,
                publisherPlayer: 0,
                publisher:0
            }
        }

    ]);
    const totalPosts = await Posts.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    return SUCCESS(res, 200, "Posts fetched successfully", {
        data: posts,
        pagination: {
            currentPage: page,
            totalPages: totalPages
        }
    })
});

const postController = {
    getPosts
}

export default postController