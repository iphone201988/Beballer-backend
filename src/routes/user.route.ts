import express from "express"
import userController from "../controllers/user.controller"
import {authenticationMiddleware} from "../middleware/auth.middleware"
import validate from "../middleware/validate.middleware"
import userSchema from "../schema/user.schema"
import { commonQuerySchema } from "../schema"
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

userRouter.post(
  "/subscribe",
  authenticationMiddleware,
  userController.subscribeUser
);


export default userRouter;