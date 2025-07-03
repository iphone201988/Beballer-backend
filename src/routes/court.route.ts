import express from "express";
import courtController from "../controllers/court.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import uploads3 from "../middleware/multers3.middleware";
const courtRouter = express.Router();
import { newCourtSchema } from "../schema/court.schema";
import validate from "../middleware/validate.middleware";

courtRouter.post(
    "/new",
    authenticationMiddleware,
    uploads3.fields([{ name: "photos", maxCount: 3 }]),
    validate(newCourtSchema),
    courtController.newCourt
);

courtRouter.get(
    "/get-courts",
    authenticationMiddleware,
    courtController.getCourts
);
courtRouter.get(
    "/get-court/:id",
    authenticationMiddleware,
    courtController.getCourtById
);

export default courtRouter;