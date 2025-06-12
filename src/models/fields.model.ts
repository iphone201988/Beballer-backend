import mongoose from "mongoose";
import { fieldsModel } from "../type/Database/type";
const fieldsSchema = new mongoose.Schema<fieldsModel>({
    accessibility: {
        type: String,
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
    country:{
        type: String,
    },
    description:{
        type: String,
    },
    expireIn:{
        type:Number,
    },
    floorType:{
        type: String,
    },
    geohash:{
        type: String,
    },
    grade:{
        type: Number,
    },
    hoopsCount:{
        type: Number,
    },
    id:{
        type: String,
        unique: true,
    },
    image:{
        type: String,
    },
    isWomanFriendly:{
        type: Boolean,
        default: true,
    },
    ishandi:{
        type: Boolean,
        default: false,
    },
    isverified:{
        type: Boolean,
        default: false,
    },
    king:{
        type: String,
    },
    level:{
        type: String,
    },
    name:{
        type: String,
    },
    netType:{
        type: String,
    },
    price:{
        type: Number,
    },
    region:{
        type: String,
    },
    photos: [{ type: String }]

});

const Fields = mongoose.model<fieldsModel>("field", fieldsSchema);
export default Fields;