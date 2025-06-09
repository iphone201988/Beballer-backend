import express from "express"
import userController from "../controllers/user.controller"
import {authenticationMiddleware} from "../middleware/auth.middleware"
import validate from "../middleware/validate.middleware"
import userSchema from "../schema/user.schema"
const userRouter = express.Router()

userRouter.post(
  "/login",
  validate(userSchema.loginSchema),
  userController.userLogin
);

userRouter.get(
  "/profile",
  authenticationMiddleware,
  userController.getUserProfile
);


export default userRouter;