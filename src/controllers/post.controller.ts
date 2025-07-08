import { Request, Response, NextFunction } from "express";
import { SUCCESS, TryCatch } from "../utils/helper";
import Posts from "../models/post.model";
import { likePost, commentOnPost } from "../type/Api/postApi.type";
import Comments from "../models/comment.model";
import mongoose from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { getFilterPost } from "../utils/helper";
import { date } from "joi";
import { create } from "domain";


const createPost = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { user, userType } = req;
    const { contentType, description, postContentWidth, postContentHeight } = req.body;
    const collectionName = userType === 'player' ? 'plaeyrs' : 'organizers';

    const imageKey = req.s3UploadedKeys?.postImage ? req.s3UploadedKeys.postImage[0] : null;
    const videoKey = req.s3UploadedKeys?.postVideo ? req.s3UploadedKeys.postVideo[0] : null;

    const newPost = await Posts.create({
        id: new mongoose.Types.ObjectId().toString(),
        description,
        contentType,
        isFeed: true,
        feedCountry: user.countryCode || 'FR',
        image: imageKey,
        video: videoKey,
        publisher: {
            ref: {
                collectionName,
                id: user.id
            }
        }
    });

    if (postContentHeight) {
        newPost.postContentHeight = postContentHeight;
    }
    if (postContentWidth) {
        newPost.postContentWidth = postContentWidth;
    }
    await newPost.save();

    return SUCCESS(res, 200, "Post created successfully");
});


const getPosts = TryCatch(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const isOnlySubscribed = req.query.isOnlySubscribed === 'true' ? true : false;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { user, userType } = req;
    const collectionName = userType === 'player' ? 'players' : 'organizers';
    const posts = await Posts.aggregate([
        { $sort: { date: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $match: {
                isFeed: true
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "event.ref.id",
                foreignField: "id",
                as: "event",
                pipeline: [
                    {
                        $project: {
                            formats: 1,
                            hasCategories: 1,
                            type: 1,
                            geohash: 1,
                            isVisibleToPublic: 1,
                            paymentStatus: 1,
                            address: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            hasSponsors: 1,
                            discountCode: 1,
                            name: 1,
                            referees: 1,
                            startDate: 1,
                            refereesCode: 1,
                            organizersCode: 1,
                            spectatorsCode: 1,
                            country: 1,
                            city: 1,
                            region: 1,
                            shareLink: 1,
                            // organizers: 1,
                            endDate: 1,
                            // spectators: 1,
                            isVisible: 1,
                            createdAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$event",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "games",
                localField: "game.ref.id",
                foreignField: "id",
                as: "game",
                pipeline: [
                    {
                        $lookup: {
                            from: "fields",
                            localField: "field.ref.id",
                            foreignField: "id",
                            as: "fieldData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$fieldData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            createdAt: 1,
                            id: 1,
                            type: 1,
                            status: 1,
                            startDate: 1,
                            date: 1,
                            field: {
                                $cond: [
                                    { $eq: ["$fieldData", null] },
                                    null,
                                    {
                                        id: "$fieldData.id",
                                        _id: "$fieldData._id",
                                        name: "$fieldData.name",
                                        country: "$fieldData.country",
                                        city: "$fieldData.city",
                                        region: "$fieldData.region",
                                        photos: "$fieldData.photos",
                                        postalCode: "$fieldData.postalCode",
                                    }
                                ]
                            },
                            team1Players: 1,
                            team2Players: 1,
                            referees: 1,
                            organizer: 1,
                            hasAcceptedInvitationTeam2: 1,
                            hasAcceptedInvitationTeam1: 1,
                            hasAcceptedInvitationReferee: 1,
                            mode: 1,
                            isAutoRefereeing: 1,
                            visible: 1,
                            teamToValidate: 1,
                            scoreTeam1: 1,
                            scoreTeam2: 1,
                            team1ScoreTeam1: 1,
                            team1ScoreTeam2: 1,
                            team2ScoreTeam1: 1,
                            team2ScoreTeam2: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$game",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "id",
                foreignField: "postId",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "fields",
                let: { courtId: "$court.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$courtId"] }
                        }
                    },
                    {
                        $project: {
                            geohash: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            name: 1,
                            country: 1,
                            city: 1,
                            region: 1,
                            shareLink: 1,
                            id: 1,
                            photos: 1,
                            postalCode: 1,
                            addressString: 1,
                            createdAt: 1,
                            description: 1,
                            accessibility: 1,
                            hasWaterPoint: 1,
                            isWomanFriendly: 1,
                            areDimensionsStandard: 1,
                            hoopsCount: 1,
                            boardType: 1,
                            floorType: 1,
                            netType: 1,
                            level: 1,
                            grade: 1
                        }
                    }
                ],
                as: "court"
            }
        },
        {
            $unwind: {
                path: "$court",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                publisherCollection: "$publisher.ref.collectionName"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $addFields: {
                commentCount: { $size: "$comments" }
            }
        },
        {
            $lookup: {
                from: "organizers",
                let: { pubId: "$publisher.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$pubId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            firstName: 1,
                            lastName: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            city: 1,
                            country: 1,
                            profilePicture: 1,
                            verified: 1,
                            subscriptions: 1
                        }
                    }
                ],
                as: "publisherOrganizer"
            }
        },
        {
            $lookup: {
                from: "players",
                let: { pubId: "$publisher.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$pubId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            firstName: 1,
                            lastName: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            city: 1,
                            country: 1,
                            profilePicture: 1,
                            verified: 1,
                            subscriptions: 1
                        }
                    }
                ],
                as: "publisherPlayer"
            }
        },
        {
            $addFields: {
                publisherData: {
                    $cond: [
                        { $eq: ["$publisherCollection", "organizers"] },
                        { $arrayElemAt: ["$publisherOrganizer", 0] },
                        { $arrayElemAt: ["$publisherPlayer", 0] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isSubscribed: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$publisherData.subscriptions", []] }
                    ]
                }
            }
        },

        {
            $match: {
                $expr: {
                    $cond: [
                        isOnlySubscribed,
                        {
                            $or: [
                                { $eq: ["$isSubscribed", true] },
                                {
                                    $and: [
                                        { $eq: ["$publisherData.id", user.id] },
                                        { $eq: ["$publisherCollection", userType === 'player' ? 'players' : 'organizers'] }
                                    ]
                                }
                            ]
                        },
                        true
                    ]
                }
            }
        },

        {
            $addFields: {
                isLikedByCurrentUser: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$likes", []] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isSharedByCurrentUser: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$shares", []] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isCommentedByCurrentUser: {

                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        {
                            $ifNull: [
                                {
                                    $map: {
                                        input: "$comments",
                                        as: "comment",
                                        in: "$$comment.publisher.ref"
                                    }
                                },
                                []
                            ]
                        }
                    ]

                }
            }
        },
        {
            $addFields: {
                currentUserLikeCount: {
                    $size: {
                        $filter: {
                            input: "$likes",
                            as: "like",
                            cond: {
                                $eq: ["$$like.id", user.id]
                            }
                        }
                    }

                }
            }
        },
        {
            $project: {
                publisherOrganizer: 0,
                publisherPlayer: 0,
                publisher: 0,
                publisherCollection: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                "publisherData.subscriptions": 0,
                proGames: 0,
                reports: 0,
                createdAt: 0,
                updatedAt: 0

            }
        }
    ]);
    const totalPosts = await Posts.estimatedDocumentCount();
    const totalPages = Math.ceil(totalPosts / limit);

    return SUCCESS(res, 200, "Posts fetched successfully", {
        data: posts,
        pagination: {
            currentPage: page,
            totalPages
        }
    });
});

const likePost = TryCatch(async (req: Request<{}, {}, {}, likePost>, res: Response) => {
    const { postId } = req.query;
    const { user, userType } = req;

    const post: any = await Posts.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 400));
    }

    const collectionName = userType === 'player' ? 'players' : 'organizers';

    const userLikesCount = post.likes.filter(
        (like: any) => like.id === user.id && like.collectionName === collectionName
    ).length;

    if (userLikesCount >= 3) {
        return SUCCESS(res, 200, "Already liked 3 times");
    }

    post.likes.push({
        collectionName,
        id: user.id
    });

    await post.save();

    return SUCCESS(res, 200, `Liked successfully (${userLikesCount + 1}/3)`);
});


const commentOnpost = TryCatch(async (req: Request<{}, {}, commentOnPost>, res: Response) => {
    const { postId, comment } = req.body;
    const { user, userType } = req;
    const post: any = await Posts.find({ id: postId });
    if (!post) {
        return next(new ErrorHandler("Post not found", 400));
    }
    const newComment = await Comments.create({
        id: new mongoose.Types.ObjectId().toString(),
        comment,
        postId,
        publisher: {
            ref: {
                collectionName: userType === 'player' ? 'players' : 'organizers',
                id: user.id
            }
        }
    });

    return SUCCESS(res, 200, "Commented successfully");
});

const likeComment = TryCatch(async (req: Request, res: Response) => {
    const { commentId } = req.query;
    const { user, userType } = req;
    const comment: any = await Comments.findById(commentId);
    console.log('===================asjkasbkjhnijkoasjkjkl', comment);
    if (!comment) {
        return next(new ErrorHandler("Comment not found", 400));
    }
    const collectionName = userType === 'player' ? 'players' : 'organizers';

    let like = true;
    if (comment.likes.find(like => like.id === user.id && like.collectionName === collectionName)) {
        like = false;
        comment.likes = comment.likes.filter(like => !(like.id === user.id && like.collectionName === collectionName));
    } else {
        comment.likes.push({
            collectionName,
            id: user.id
        });
    }
    await comment.save();

    return SUCCESS(res, 200, `${like ? 'liked' : 'unliked'} successfully`);
});

const getPostById = TryCatch(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const { user, userType } = req;
    const post = await Posts.aggregate([
        {
            $match: {
                id: postId
            }
        },
        {
            $match: {
                isFeed: true
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "event.ref.id",
                foreignField: "id",
                as: "event",
                pipeline: [
                    {
                        $project: {
                            formats: 1,
                            hasCategories: 1,
                            type: 1,
                            geohash: 1,
                            isVisibleToPublic: 1,
                            paymentStatus: 1,
                            address: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            hasSponsors: 1,
                            discountCode: 1,
                            name: 1,
                            referees: 1,
                            startDate: 1,
                            refereesCode: 1,
                            organizersCode: 1,
                            spectatorsCode: 1,
                            country: 1,
                            city: 1,
                            region: 1,
                            shareLink: 1,
                            // organizers: 1,
                            endDate: 1,
                            // spectators: 1,
                            isVisible: 1,
                            createdAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$event",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "games",
                localField: "game.ref.id",
                foreignField: "id",
                as: "game",
                pipeline: [
                    {
                        $lookup: {
                            from: "fields",
                            localField: "field.ref.id",
                            foreignField: "id",
                            as: "fieldData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$fieldData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            createdAt: 1,
                            id: 1,
                            type: 1,
                            status: 1,
                            startDate: 1,
                            date: 1,
                            field: {
                                $cond: [
                                    { $eq: ["$fieldData", null] },
                                    null,
                                    {
                                        id: "$fieldData.id",
                                        _id: "$fieldData._id",
                                        name: "$fieldData.name",
                                        country: "$fieldData.country",
                                        city: "$fieldData.city",
                                        region: "$fieldData.region",
                                        photos: "$fieldData.photos",
                                        postalCode: "$fieldData.postalCode",
                                    }
                                ]
                            },
                            team1Players: 1,
                            team2Players: 1,
                            referees: 1,
                            organizer: 1,
                            hasAcceptedInvitationTeam2: 1,
                            hasAcceptedInvitationTeam1: 1,
                            hasAcceptedInvitationReferee: 1,
                            mode: 1,
                            isAutoRefereeing: 1,
                            visible: 1,
                            teamToValidate: 1,
                            scoreTeam1: 1,
                            scoreTeam2: 1,
                            team1ScoreTeam1: 1,
                            team1ScoreTeam2: 1,
                            team2ScoreTeam1: 1,
                            team2ScoreTeam2: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$game",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "id",
                foreignField: "postId",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "fields",
                let: { courtId: "$court.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$courtId"] }
                        }
                    },
                    {
                        $project: {
                            geohash: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            name: 1,
                            country: 1,
                            city: 1,
                            region: 1,
                            shareLink: 1,
                            id: 1,
                            photos: 1,
                            postalCode: 1,
                            addressString: 1,
                            createdAt: 1,
                            description: 1,
                            accessibility: 1,
                            hasWaterPoint: 1,
                            isWomanFriendly: 1,
                            areDimensionsStandard: 1,
                            hoopsCount: 1,
                            boardType: 1,
                            floorType: 1,
                            netType: 1,
                            level: 1,
                            grade: 1
                        }
                    }
                ],
                as: "court"
            }
        },
        {
            $unwind: {
                path: "$court",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                publisherCollection: "$publisher.ref.collectionName"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $addFields: {
                commentCount: { $size: "$comments" }
            }
        },
        {
            $lookup: {
                from: "organizers",
                let: { pubId: "$publisher.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$pubId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            firstName: 1,
                            lastName: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            city: 1,
                            country: 1,
                            profilePicture: 1,
                            verified: 1,
                            subscriptions: 1
                        }
                    }
                ],
                as: "publisherOrganizer"
            }
        },
        {
            $lookup: {
                from: "players",
                let: { pubId: "$publisher.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$pubId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            firstName: 1,
                            lastName: 1,
                            coordinates: {
                                $cond: [
                                    { $eq: ["$location", null] },
                                    null,
                                    "$location.coordinates"
                                ]
                            },
                            city: 1,
                            country: 1,
                            profilePicture: 1,
                            verified: 1,
                            subscriptions: 1
                        }
                    }
                ],
                as: "publisherPlayer"
            }
        },
        {
            $addFields: {
                publisherData: {
                    $cond: [
                        { $eq: ["$publisherCollection", "organizers"] },
                        { $arrayElemAt: ["$publisherOrganizer", 0] },
                        { $arrayElemAt: ["$publisherPlayer", 0] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isSubscribed: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$publisherData.subscriptions", []] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isLikedByCurrentUser: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$likes", []] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isSharedByCurrentUser: {
                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        { $ifNull: ["$shares", []] }
                    ]
                }
            }
        },
        {
            $addFields: {
                isCommentedByCurrentUser: {

                    $in: [
                        {
                            collectionName: userType === 'player' ? 'players' : 'organizers',
                            id: user.id
                        },
                        {
                            $ifNull: [
                                {
                                    $map: {
                                        input: "$comments",
                                        as: "comment",
                                        in: "$$comment.publisher.ref"
                                    }
                                },
                                []
                            ]
                        }
                    ]

                }
            }
        },
        {
            $addFields: {
                currentUserLikeCount: {
                    $size: {
                        $filter: {
                            input: "$likes",
                            as: "like",
                            cond: {
                                $eq: ["$$like.id", user.id]
                            }
                        }
                    }

                }
            }
        },
        {
            $project: {
                publisherOrganizer: 0,
                publisherPlayer: 0,
                publisher: 0,
                publisherCollection: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                "publisherData.subscriptions": 0,
                proGames: 0,
                reports: 0,
                createdAt: 0,
                updatedAt: 0

            }
        }

    ]);

    if (!post) {
        return res.status(404).json({ message: "No post found" })
    }

    return SUCCESS(res, 200, "Post found", {
        data: {
            post: post[0]
        }
    })


})


const getPostCommentsByPostId = async (req: Request, res: Response) => {
    const postId = req.params.id;
    const comments = await Comments.aggregate([
        {
            $match: {
                postId: postId

            }

        },
        {
            $lookup: {
                from: "players",
                let: { pubId: "$publisher.ref.id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$pubId"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            username: 1,
                            profilePicture: 1,
                        }
                    }
                ],
                as: "publisherPlayer"
            }
        },
        {
            $addFields: {
                publisherData: {
                    $arrayElemAt: ["$publisherPlayer", 0]
                }
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                publisherPlayer: 0,
                publisher: 0,
                createdAt: 0,
                updatedAt: 0,
                likes: 0,
                __v: 0
            }
        }
    ])

    return SUCCESS(res, 200, "Comments found", {
        data: {
            comments
        }
    })
}

const postController = {
    getPosts,
    likePost,
    commentOnpost,
    likeComment,
    createPost,
    getPostById,
    getPostCommentsByPostId
}




export default postController

function next(arg0: any) {
    throw new Error("Function not implemented.");
}
