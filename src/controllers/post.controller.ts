import { Request, Response } from "express";
import { SUCCESS, TryCatch } from "../utils/helper";
import Posts from "../models/post.model";
import { likePost, commentOnPost } from "../type/Api/postApi.type";
import Comments from "../models/comment.model";
import mongoose from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { getFilterPost } from "../utils/helper";


const getPosts = TryCatch(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Posts.aggregate([
        // Pagination early (push it after filtering if any)
        { $skip: skip },
        { $limit: limit },
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
                    }
                ],
                as: "court"
            }
        },
        {
            $addFields: {
                publisherCollection: "$publisher.ref.collectionName"
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
                            _id: 0,
                            username: 1,
                            email: 1,
                            location: 1,
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
                            _id: 0,
                            username: 1,
                            email: 1,
                            location: 1,
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
            $project: {
                publisherOrganizer: 0,
                publisherPlayer: 0,
                publisher: 0,
                publisherCollection: 0
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
// const getPosts = TryCatch(async (req: Request, res: Response) => {
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
                collectionName: userType,
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
    likeComment
}

export default postController

function next(arg0: any) {
    throw new Error("Function not implemented.");
}
