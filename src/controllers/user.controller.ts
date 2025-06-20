import { Request, Response, NextFunction } from "express";
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
import { UserLoginType, subscribeType } from "../type/Api/userApi.type";
import ErrorHandler from "../utils/ErrorHandler";

const userLogin = TryCatch(async (req: Request<{}, {}, UserLoginType>, res: Response) => {
  const { id, deviceToken, deviceType, latitude, longitude, type } =
    req.body;
  let user;

  if (type === userType.PLAYER) {
    user = await Players.findOne({ id });
    if (!user) {
      user = await Players.create({ id: id });
      console.log('Player Created', user);
    }
  } else {
    user = await Organizer.findOne({ id });
    if (!user) {
      user = await Organizer.create({ id: id });
      console.log('Organiser Created');
    }
  }
  let token;
  if (user) {
    const jti = generateRandomString(20);
    token = generateJwtToken({ userId: user._id, type, jti });
    user.jti = jti;
    user.deviceToken = deviceToken;
    user.deviceType = deviceType;
    if (latitude && longitude)
      user.location = { type: "Point", coordinates: [longitude, latitude] };
    await user.save();
  }
  const followingCount = user.subscriptions.length;
  const followersCount = user.followers.length;

  return SUCCESS(res, 200, "LoggedIn successfully", {
    data: {
      token: token ? token : undefined,
      user: {
        ...getFileteredUser(user.toObject()),
        followingCount,
        followersCount
      },
    },
  });
});

const getUserProfile = TryCatch(async (req: Request, res: Response) => {
  const { user } = req;
   const followingCount = user.subscriptions.length;
  const followersCount = user.followers.length;
  return SUCCESS(res, 200, "User fetched successfully", {
    data: {
      user: {
        ...getFileteredUser(user.toObject()),
        followingCount,
        followersCount
      },
    },
  });
});

const subscribeUser = TryCatch(async (req: Request<{}, {}, subscribeType>, res: Response, next: NextFunction) => {
  const { user, userType } = req;
  const subscribedUserId = req.query.id; // it should be _id
  const collectionName = userType === 'player' ? 'players' : 'organizers';
  const subscriberId = user.id;

  let playerUser = await Players.findById(subscribedUserId);
  if (playerUser) {
    if (playerUser.subscriptions.find(sub => sub.id === subscriberId)) {
      return next(new ErrorHandler("Already Subscribed", 400));
    }
    playerUser.subscriptions.push({
      collectionName,
      id: subscriberId
    });
    await playerUser.save();
  } else {
    const organizerUser = await Organizer.findById(subscribedUserId);
    if (organizerUser.subscriptions.find(sub => sub.id === subscriberId)) {
      return next(new ErrorHandler("Already Subscribed", 400));
    }
    if (organizerUser) {
      organizerUser.subscriptions.push({
        collectionName,
        id: subscriberId
      });
      await organizerUser.save();
    }
  }

  return SUCCESS(res, 200, "Subscribed successfully");
});


export default {
  userLogin,
  getUserProfile,
  subscribeUser
};
