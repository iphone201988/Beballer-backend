import express from "express";
import postController from "../controllers/post.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import postSchema  from "../schema/post.schema";
import validate from "../middleware/validate.middleware";
import uploads3 from "../middleware/multers3.middleware";
const postRouter = express.Router();


postRouter.post(
    "/create-post",
    authenticationMiddleware,
    uploads3.fields([
        { name: "postImage", maxCount: 1 }, 
        { name: "postVideo", maxCount: 1 }  
    ]),
    validate(postSchema.createPostSchema),
    postController.createPost
);

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

postRouter.get(
    "/get-post/:id",
    authenticationMiddleware,
    postController.getPostById);

postRouter.get(
    "/get-post-comments/:id",
    authenticationMiddleware,
    postController.getPostCommentsByPostId);


postRouter.get(
    "/get-post-by-puplisher-id",
    authenticationMiddleware,
    postController.getPostByBuplisherId);
    
export default postRouter;