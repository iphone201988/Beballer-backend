import mongoose from "mongoose";
import { commentModel } from "../type/Database/type";

const commentSchema = new mongoose.Schema<commentModel>({
    id: {
        type: String,
        unique: true,
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
    comment: {
        type: String,
    },
    postId: {
        type: String,
    }
},
    { timestamps: true }
);

const Comments = mongoose.model<commentModel>("comment", commentSchema);
export default Comments;