import { Request, Response,NextFunction } from "express";
import { SUCCESS, TryCatch } from "../utils/helper";
import Posts from "../models/post.model";
import { likePost, commentOnPost } from "../type/Api/postApi.type";
import Comments from "../models/comment.model";
import mongoose from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { getFilterPost } from "../utils/helper";
import { date } from "joi";
import { create } from "domain";


const createPost = TryCatch(async (req: Request, res: Response , next: NextFunction) => {
    const { user, userType } = req;
    const { contentType ,description } = req.body;
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

    return SUCCESS(res, 200, "Post created successfully");
});



const getPosts = TryCatch(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
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
        // {
        //     $match: {
        //         "publisherData.subscriptions": {
        //             $elemMatch: {
        //                 id: user.id,
        //                 collectionName: collectionName
        //             }
        //         }
        //     },
        // },
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
// const getPostsz = TryCatch(async (req: Request, res: Response) => {
//     const { user, userType } = req;
//     const onlySubscribed = true;
//     const collectionName = userType === 'player' ? 'players' : 'organizers';
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const pipeline: any[] = [
//         // Events
//         {
//             $lookup: {
//                 from: "events",
//                 localField: "event.ref.id",
//                 foreignField: "id",
//                 as: "event"
//             }
//         },

//         // Games
//         {
//             $lookup: {
//                 from: "games",
//                 localField: "game.ref.id",
//                 foreignField: "id",
//                 as: "game"
//             }
//         },

//         // Comments
//         {
//             $lookup: {
//                 from: "comments",
//                 localField: "id",
//                 foreignField: "postId",
//                 as: "comments"
//             }
//         },

//         // Fields
//         {
//             $lookup: {
//                 from: "fields",
//                 localField: "court.ref.id",
//                 foreignField: "id",
//                 as: "court"
//             }
//         },

//         // Set publisherCollection
//         {
//             $addFields: {
//                 publisherCollection: "$publisher.ref.collectionName"
//             }
//         },

//         // Organizer
//         {
//             $lookup: {
//                 from: "organizers",
//                 let: { pubId: "$publisher.ref.id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ["$id", "$$pubId"] }
//                         }
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             username: 1,
//                             email: 1,
//                             location: 1,
//                             subscriptions: 1
//                         }
//                     }
//                 ],
//                 as: "publisherOrganizer"
//             }
//         },

//         // Player
//         {
//             $lookup: {
//                 from: "players",
//                 let: { pubId: "$publisher.ref.id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ["$id", "$$pubId"] }
//                         }
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             username: 1,
//                             email: 1,
//                             location: 1,
//                             subscriptions: 1
//                         }
//                     }
//                 ],
//                 as: "publisherPlayer"
//             }
//         },

//         // Merge publisherData
//         {
//             $addFields: {
//                 publisherData: {
//                     $cond: [
//                         { $eq: ["$publisherCollection", "organizers"] },
//                         { $arrayElemAt: ["$publisherOrganizer", 0] },
//                         { $arrayElemAt: ["$publisherPlayer", 0] }
//                     ]
//                 }
//             }
//         },

//         // Cleanup
//         {
//             $project: {
//                 publisherOrganizer: 0,
//                 publisherPlayer: 0,
//                 publisher: 0,
//                 publisherCollection: 0
//             }
//         },
//     ];

//     // Add filtering by subscription if onlySubscribed = true
//     if (onlySubscribed) {
//         pipeline.push({
//             $match: {
//                 "publisherData.subscriptions": {
//                     $elemMatch: {
//                         id: user.id,
//                         collectionName: collectionName
//                     }
//                 }
//             }
//         });
//     }


//     // Pagination should come after filtering
//     pipeline.push({ $skip: skip });
//     pipeline.push({ $limit: limit });

//     const posts = await Posts.aggregate(pipeline).allowDiskUse(true);
//     console.log("Posts-===========================:", posts);
//     const totalPosts = onlySubscribed
//         ? await Posts.aggregate([
//             ...pipeline.filter(stage => !("$skip" in stage || "$limit" in stage)),
//             { $count: "total" }
//         ]).then(res => res[0]?.total || 0)
//         : await Posts.estimatedDocumentCount();

//     const totalPages = Math.ceil(totalPosts / limit);

//     return SUCCESS(res, 200, "Posts fetched successfully", {
//         data: posts,
//         pagination: {
//             currentPage: page,
//             totalPages
//         }
//     });
// });

// const getPosts = TryCatch(async (req: Request, res: Response) => {
//     const { user, userType } = req;
//     const onlySubscribed = req.query.isOnlySubscribed === 'yes' ? true : false;
//     const collectionName = userType === 'player' ? 'players' : 'organizers';
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     let pipeline: any[] = [];

//     if (onlySubscribed) {
//         const subscribedPublishers = await Promise.all([
//             mongoose.connection.db.collection('organizers').find({
//                 subscriptions: {
//                     $elemMatch: {
//                         id: user.id,
//                         collectionName: collectionName
//                     }
//                 }
//             }, { projection: { id: 1 } }).toArray(),
//             mongoose.connection.db.collection('players').find({
//                 subscriptions: {
//                     $elemMatch: {
//                         id: user.id,
//                         collectionName: collectionName
//                     }
//                 }
//             }, { projection: { id: 1 } }).toArray()
//         ]);

//         const organizerIds = subscribedPublishers[0].map(org => org.id);
//         const playerIds = subscribedPublishers[1].map(player => player.id);
//         pipeline.push({
//             $match: {
//                 $or: [
//                     {
//                         "publisher.ref.collectionName": "organizers",
//                         "publisher.ref.id": { $in: organizerIds }
//                     },
//                     {
//                         "publisher.ref.collectionName": "players", 
//                         "publisher.ref.id": { $in: playerIds }
//                     }
//                 ]
//             }
//         });
//     }

//     pipeline.push({
//         $sort: { date: -1, _id: -1 } 
//     });

//     pipeline.push({ $skip: skip });
//     pipeline.push({ $limit: limit });

//     pipeline.push(
//         {
//             $lookup: {
//                 from: "events",
//                 localField: "event.ref.id",
//                 foreignField: "id",
//                 as: "event"
//             }
//         },
//         {
//             $lookup: {
//                 from: "games",
//                 localField: "game.ref.id", 
//                 foreignField: "id",
//                 as: "game"
//             }
//         },
//         {
//             $lookup: {
//                 from: "comments",
//                 localField: "id",
//                 foreignField: "postId",
//                 as: "comments"
//             }
//         },
//         {
//             $lookup: {
//                 from: "fields",
//                 localField: "court.ref.id",
//                 foreignField: "id", 
//                 as: "court"
//             }
//         },
//         {
//             $lookup: {
//                 from: "organizers",
//                 let: { 
//                     pubId: "$publisher.ref.id",
//                     pubCollection: "$publisher.ref.collectionName"
//                 },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     { $eq: ["$$pubCollection", "organizers"] },
//                                     { $eq: ["$id", "$$pubId"] }
//                                 ]
//                             }
//                         }
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             username: 1,
//                             email: 1,
//                             location: 1,
//                             subscriptions: 1
//                         }
//                     }
//                 ],
//                 as: "publisherOrganizer"
//             }
//         },
//         {
//             $lookup: {
//                 from: "players",
//                 let: { 
//                     pubId: "$publisher.ref.id",
//                     pubCollection: "$publisher.ref.collectionName"
//                 },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     { $eq: ["$$pubCollection", "players"] },
//                                     { $eq: ["$id", "$$pubId"] }
//                                 ]
//                             }
//                         }
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             username: 1,
//                             email: 1,
//                             location: 1,
//                             subscriptions: 1
//                         }
//                     }
//                 ],
//                 as: "publisherPlayer"
//             }
//         },
//         {
//             $addFields: {
//                 publisherData: {
//                     $cond: [
//                         { $eq: ["$publisher.ref.collectionName", "organizers"] },
//                         { $arrayElemAt: ["$publisherOrganizer", 0] },
//                         { $arrayElemAt: ["$publisherPlayer", 0] }
//                     ]
//                 }
//             }
//         },
//         {
//             $project: {
//                 publisherOrganizer: 0,
//                 publisherPlayer: 0
//             }
//         }
//     );

//     const posts = await Posts.aggregate(pipeline).allowDiskUse(true);

//     let totalPosts = 0;
//     if (onlySubscribed) {
//         const countPipeline = pipeline.slice(0, 1);
//         countPipeline.push({ $count: "total" });
//         const countResult = await Posts.aggregate(countPipeline);
//         totalPosts = countResult[0]?.total || 0;
//     } else {
//         totalPosts = await Posts.estimatedDocumentCount();
//     }

//     const totalPages = Math.ceil(totalPosts / limit);

//     return SUCCESS(res, 200, "Posts fetched successfully", {
//         data: posts,
//         pagination: {
//             currentPage: page,
//             totalPages,
//             totalPosts
//         }
//     });
// });
const likePost = TryCatch(async (req: Request<{}, {}, {}, likePost>, res: Response) => {
    const { postId } = req.query;
    const { user, userType } = req;
    const post: any = await Posts.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 400));
    }
    const collectionName = userType === 'player' ? 'players' : 'organizers';

    let like = true;
    if (post.likes.find(like => like.id === user.id && like.collectionName === collectionName)) {
        like = false;
        post.likes = post.likes.filter(like => !(like.id === user.id && like.collectionName === collectionName));
    } else {
        post.likes.push({
            collectionName,
            id: user.id
        });
    }
    await post.save();

    return SUCCESS(res, 200, `${like ? 'liked' : 'unliked'} successfully`);
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

const postController = {
    getPosts,
    likePost,
    commentOnpost,
    likeComment,
    createPost
}

export default postController

function next(arg0: any) {
    throw new Error("Function not implemented.");
}
