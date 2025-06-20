import mongoose from "mongoose";
import { userType, gender, deviceType } from "../utils/enum";
import { PlayerModel } from "../type/Database/type";

const organizerSchema = new mongoose.Schema<PlayerModel>(
  {
    id: {
      type: String,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      unique: true, 
    },
    email: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
   subscriptions: [
      {
         _id: false,
        collectionName:{
          type: String,
          enum: [userType.ORGANIZER, userType.PLAYER],
        },
        id:String,
      },
    ],
    reports: [{ type: String }],
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
    lastLogon: {
      type: Date,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
      },
    ],
    feedCountry: {
      type: String,
    },
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
organizerSchema.index({ location: "2dsphere" });
organizerSchema.index({ "subscriptions.id": 1, "subscriptions.collectionName": 1 });

const Organizer = mongoose.model<PlayerModel>("organizer", organizerSchema);
export default Organizer;