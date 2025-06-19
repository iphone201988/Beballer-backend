import express from "express";
import courtController from "../controllers/court.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import uploads3 from "../middleware/multers3.middleware";
const courtRouter = express.Router();

courtRouter.post(
    "/new",
    authenticationMiddleware,
    uploads3.fields([{ name: "photos", maxCount: 3 }]),
    courtController.newCourt
);

courtRouter.get(
    "/get-courts",
    authenticationMiddleware,
    courtController.getCourts
);

export default courtRouter;