import { Request, Response } from "express";
import { userType } from "../utils/enum";
import Organizer from "../models/organizers.model";
import {
  generateJwtToken,
  generateRandomString,
  getFileteredUser,
  SUCCESS,
  TryCatch,
} from "../utils/helper";
import Players from "../models/players.model";
import {UserLoginType} from "../type/Api/userApi.type";

const userLogin = TryCatch(async (req: Request<{}, {}, UserLoginType>, res: Response) => {
  const { id, deviceToken, deviceType, latitude, longitude, type } =
    req.body;
  let user;

  if (type === userType.PLAYER) {
    user = await Players.findOne({ id });
    if (!user) {
      user = await Players.create({ id });
    }
  } else {
    user = await Organizer.findOne({ id });
    if (!user) {
      user = await Organizer.create({ id });
    }
  }
  let token;
  if (user) {
    const jti = generateRandomString(20);
    token = generateJwtToken({ userId: user._id, type ,jti });
    user.jti = jti;
    user.deviceToken = deviceToken;
    user.deviceType = deviceType;
    if (latitude && longitude)
      user.location = { type: "Point", coordinates: [longitude, latitude] };
    await user.save();
  }

  return SUCCESS(res, 200, "LoggedIn successfully", {
    data: {
      token: token ? token : undefined,
      user: getFileteredUser(user.toObject()),
    },
  });
});

const getUserProfile = TryCatch(async (req: Request, res: Response) => {
  const { user } = req;
  return SUCCESS(res, 200, "LoggedIn successfully", {
    data: {
      user: getFileteredUser(user.toObject()),
    },
  });
});



export default {
  userLogin,
  getUserProfile,
};
