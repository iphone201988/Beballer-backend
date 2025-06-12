import mongoose from "mongoose";
import { userType, gender, deviceType } from "../utils/enum";
import { PlayerModel } from "../type/Database/type";

const playerSchema = new mongoose.Schema<PlayerModel>(
  {
    id: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
    },
    email: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    totalProgression: {
      type: Number,
      default: 0,
    },
    subscriptions: [
      {
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
      },
    ],
    sector: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    reports: [{ type: String }],
    reported: {
      type: Boolean,
      default: false,
    },
    region: {
      type: String,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    rankSector: {
      type: Number,
      default: 0,
    },
    rankRegion: {
      type: Number,
      default: 0,
    },
    rankCountry: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    progression: [{ type: Number }],
    profileDescription: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    lastName: {
      type: String,
    },
    lastLogon: {
      type: Date,
    },
    height: {
      type: Number,
    },
    role: {
      type: String,
      enum: [userType.ORGANIZER, userType.PLAYER],
    },
    godchildren: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    geohash: {
      type: String,
    },
    gender: {
      type: String,
      enum: [gender.MALE, gender.FEMALE, gender.OTHER],
    },
    games: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "games",
      },
    ],
    friendList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    followers: [
       {
        collectionName: {
          type: String,
          default: "players",
        },
        id: {
          type: String,
        },
      },
    ],
    feedCountry: {
      type: String,
    },
    favoriteEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "events",
      },
    ],
    favoriteCourts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courts",
      },
    ],
    favoriteBars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bars",
      },
    ],
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    birthDate: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "badges",
      },
    ],
    isOnboardAnalyticsDone: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
    },
    countryCode: { type: String, require: true },
    phone: { type: String, require: true, unique: true },
    deviceToken: { type: String, require: true },
    deviceType: {
      type: Number,
      enum: [deviceType.IOS, deviceType.ANDROID],
      require: true,
    },
    jti: { type: String },
  },
  { timestamps: true }
);
playerSchema.index({ location: "2dsphere" });

const Players = mongoose.model<PlayerModel>("player", playerSchema);
export default Players;