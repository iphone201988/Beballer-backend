import mongoose from "mongoose";
import { fieldsModel } from "../type/Database/type";
import { courtAccessibility,courtBoardType,courtNetType,courtFloorType } from "../utils/enum";

const fieldsSchema = new mongoose.Schema<fieldsModel>({
    accessibility: {
        type: String,
        enum: [courtAccessibility.AVAILABLE_TO_EVERYONE, courtAccessibility.AVAILABLE_TO_LICENSEES, courtAccessibility.SPECIAL_OPENING_HOURS],
        default: courtAccessibility.AVAILABLE_TO_EVERYONE
    },
    address: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        },
    },
    addressString: {
        type: String,
    },
    boardType: {
        type: String,
        enum: [courtBoardType.STEEL, courtBoardType.WOOD, courtBoardType.PLASTIC, courtBoardType.PLEXIGLAS ],
        default: "",
    },
    city: {
        type: String,
    },
    contributor: {
        ref: {
            collectionName: {
                type: String,
                default: null,
            },
            id: {
                type: String,
                required: true,
            },
        }
    },
    country: {
        type: String,
    },
    description: {
        type: String,
    },
    expireIn: {
        type: Number,
    },
    floorType: {
        type: String,
        enum: [courtFloorType.SYNTHETIC, courtFloorType.BITUMEN],
    },
    geohash: {
        type: String,
    },
    grade: {
        type: Number,
    },
    hoopsCount: {
        type: Number,
    },
    id: {
        type: String,
        unique: true,
    },
    image: {
        type: String,
    },
    isWomanFriendly: {
        type: Boolean,
        default: true,
    },
    ishandi: {
        type: Boolean,
        default: false,
    },
    isverified: {
        type: Boolean,
        default: false,
    },
    king: {
        type: String,
    },
    level: {
        type: String,
    },
    name: {
        type: String,
    },
    netType: {
        type: String,
        enum: [courtNetType.STRING, courtNetType.CHAIN, courtNetType.PLASTIC , courtNetType.NO_NET],
        default: null
    },
    price: {
        type: Number,
    },
    region: {
        type: String,
    },
    photos: [{ type: String }]

},
    { timestamps: true }
);
fieldsSchema.index({ location: "2dsphere" });

const Fields = mongoose.model<fieldsModel>("field", fieldsSchema);
export default Fields;