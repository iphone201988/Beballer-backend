import express from "express";
import organiserController from "../controllers/organiser.controller";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import uploads3 from "../middleware/multers3.middleware";
const organiserRouter = express.Router();

organiserRouter.post(
    "/create-organiser",
    authenticationMiddleware,
     uploads3.single("profilePicture"),
    organiserController.createOrganisProfile
);

export default organiserRouter;