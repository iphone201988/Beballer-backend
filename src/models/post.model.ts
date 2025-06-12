import mongoose from "mongoose";
import {postModel} from "../type/Database/type";

const postSchema = new mongoose.Schema<postModel>(
    {
        id: {
            type: String,
            unique: true,
        },
        date: {
            type: Date,
            required: true,
        },
        reports: [],
        country: {
            type: String,
            required: true,
        },
        game: {
            ref: {
                collectionName: {
                    type: String,
                    default: null,
                },
                id: {
                    type: String,
                    required: true,
                },  
            }
        },
        description: {
            type: String,
            default: "",
        },
        isFeed: {
            type: Boolean,
            default: true,
        },
        shares: [],
        publisher: {
            ref: {
                collectionName: {
                    type: String,
                    default: null,
                },
                id: {
                    type: String,
                    required: true,
                },
            }
        },
        event: {
            ref: {
                collectionName: {
                    type: String,
                    default: null,
                },
                id: {
                    type: String,
                    required: true,
                },
            }
        },
        likes: [
            {
                collectionName: {
                    type: String,
                    default: "players",
                },
                id: {
                    type: String,
                    required: true,
                },
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Posts = mongoose.model<postModel>("post", postSchema);
export default Posts;