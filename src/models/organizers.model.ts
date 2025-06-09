import mongoose from "mongoose";
import { userType, gender, deviceType } from "../utils/enum";
import { PlayerModel } from "../type/Database/type";

const organizerSchema = new mongoose.Schema<PlayerModel>(
  {
    username: {
      type: String,
      required: true,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "player",
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

const Organizer = mongoose.model<PlayerModel>("organizer", organizerSchema);
export default Organizer;