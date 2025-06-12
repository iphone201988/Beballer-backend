import playerController from "../controllers/player.controller";
import express from "express";
import upload from "../middleware/multer.middleware";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import uploads3 from "../middleware/multers3.middleware";
import playerSchema from "../schema/player.schema";
import validate from "../middleware/validate.middleware";
const playerRouter = express.Router();

playerRouter.put(
    "/set-onboard-analytics",
    authenticationMiddleware,
    playerController.isOnboardAnalyticsDone
);

playerRouter.post(
    "/create-player-profile",
    authenticationMiddleware,
    uploads3.single("profilePicture"),
    validate(playerSchema.createPlayerProfileSchema),
    playerController.createPlayerProfile
);

export default playerRouter;