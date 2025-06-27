import mongoose from "mongoose";
import { userType, gender, deviceType } from "../utils/enum";
import { PlayerModel } from "../type/Database/type";
import { ref } from "process";

const playerSchema = new mongoose.Schema<PlayerModel>(
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
    firstName: {
      type: String,
      default:null
    },
    email: {
      type: String,
      default:null
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
        collectionName: {
          type: String,
          enum: ['organizers', 'players'],
        },
        id: String,
      },
    ],
    sector: {
      type: String,
      default:null
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
      default:null
    },
    referralCode: {
      type: String,
      default:null
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
      default:null
    },
    posts: [],
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
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
      },
    ],
    lastName: {
      type: String,
      default:null
    },
    lastLogon: {
      type: Date,
    },
    height: {
      type: Number,
      default: null,
    },
    role: {
      type: String,
      enum: [userType.ORGANIZER, userType.PLAYER],
    },
    godchildren: [
      {
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
      },
    ],
    geohash: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: [gender.MALE, gender.FEMALE, gender.OTHER],
    },
    games: [
      {
        _id: false,
        collectionName: {
          type: String,
          enum: ['games'],
        },
        id: String,
      },
    ],
    friendList: [
      {
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
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
      default: null,
    },
    favoriteEvents: [
      {
        _id: false,
        collectionName: {
          type: String,
          enum: ['events'],
        },
        id: String,
      },
    ],
    favoriteCourts: [
      {
        _id: false,
        collectionName: {
          type: String,
          enum: ['courts'],
        },
        id: String,
      },
    ],
    favoriteBars: [
      {
        _id: false,
        collectionName: {
          type: String,
          enum: ['bars'],
        },
        id: String,
      },
    ],
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    blockedUsers: [
      {
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
      },
    ],
    blockedBy:[
      {
         _id: false,
        collectionName:{
          type: String,
          enum: ['organizers', 'players'],
        },
        id:String,
      },
    ],
    birthDate: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    recutersViewed: {
      type:String,
      default: null
    },
    badges: [
      {
        _id: false,
        collectionName: {
          type: String,
          enum: ['badges'],
        },
        id: String,
      },
    ],
    isOnboardAnalyticsDone: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: null
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
    favoriteProTeam: {
         ref: {
            collectionName:{
              type: String,
              enum: ['progamesteams']
            },
            id: {
              type: String,
              default: null
            },
        },
    },
    position: {
      type: String,
      default: null
    },
    playPositionId:{
      type: Number,
      default: null
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    setProfilePopup: {
      type: Boolean,
      default: false,
    },
    setSettingsPopup: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
playerSchema.index({ location: "2dsphere" });
playerSchema.index({ "subscriptions.id": 1, "subscriptions.collectionName": 1 });

const Players = mongoose.model<PlayerModel>("player", playerSchema);
export default Players;