import express from "express";
import postController from "../controllers/post.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const postRouter = express.Router();

postRouter.get("/get-posts", authenticationMiddleware, postController.getPosts);

export default postRouter;