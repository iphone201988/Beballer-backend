import express from "express";
import postController from "../controllers/post.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import postSchema  from "../schema/post.schema";
import validate from "../middleware/validate.middleware";
const postRouter = express.Router();

postRouter.get("/get-posts", authenticationMiddleware, postController.getPosts);

postRouter.post(
    "/like-post",
    authenticationMiddleware,
    validate(postSchema.postQuerySchema),
    postController.likePost);

postRouter.post(
    "/comment-on-post",
    authenticationMiddleware,
    validate(postSchema.commentOnPostSchema),
    postController.commentOnpost);

postRouter.post(
    "/like-comment",
    authenticationMiddleware,
    validate(postSchema.postCommentQuerySchema),
    postController.likeComment);
export default postRouter;