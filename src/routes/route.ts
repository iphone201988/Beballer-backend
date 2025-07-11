import userRouter from "./user.route";
import express from "express";
import playerRouter from "./player.route";
import postRouter from "./post.route";
import courtRouter from "./court.route";
import gameRouter from "./game.route";
import organiserRouter from "./organiser.route";
// import { testFfmpegConversion } from "../controllers/test.controller";

const router = express.Router();

router.use("/user", userRouter);
router.use("/player", playerRouter);
router.use("/post", postRouter);
router.use("/court", courtRouter);
router.use("/game", gameRouter);
router.use("/organiser", organiserRouter);

// router.get("/test-ffmpeg",testFfmpegConversion.testFfmpegConversion);


export default router;
