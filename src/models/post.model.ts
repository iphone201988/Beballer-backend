import mongoose from "mongoose";
import { postModel } from "../type/Database/type";

const postSchema = new mongoose.Schema<postModel>(
    {
        id: {
            type: String,
        },
        date: {
            type: Date,
        },
        reports: [],
        country: {
            type: String,
        },
        game: {
            ref: {
                collectionName: {
                    type: String,
                    default: null,
                },
                id: {
                    type: String,
                },
            }
        },
        description: {
            type: String,
            default: "",
        },
        isFeed: {
            type: Boolean,
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
                },
            }
        },
        likes: [
            {
                _id: false,
                collectionName: {
                    type: String,
                    enum: ['organizers', 'players'],
                },
                id: String,
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);
postSchema.index({ "publisher.ref.id": 1 });
postSchema.index({ "publisher.ref.collectionName": 1, "publisher.ref.id": 1 });
postSchema.index({ "game.ref.id": 1 });
postSchema.index({ id: 1 });
postSchema.index({ date: -1 });
postSchema.index({ country: 1 });
const Posts = mongoose.model<postModel>("post", postSchema);
export default Posts;