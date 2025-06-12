import userRouter from "./user.route";
import express from "express";
import playerRouter from "./player.route";
import postRouter from "./post.route";
const router = express.Router();

router.use("/user", userRouter);
router.use("/player", playerRouter);
router.use("/post", postRouter);
export default router;
