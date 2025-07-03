import mongoose from 'mongoose';
import { eventModel } from '../type/Database/type';
import { time } from 'console';

const EventSchema = new mongoose.Schema({
    id: { type: String, unique: true, index: true },
    formats: {
        type: String,
        default: null
    },
    hasCategories: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: null
    },
    geohash: {
        type: String,
        default: null
    },
    isVisibleTo: [
        {
            type: String,
            default: null,
        },
    ],
    paymentStatus: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: null
    },
    hasSponsors: {
        type: Boolean,
        default: false
    },
    discountCode: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: null
    },
    referees: [
        {
            _id: false,
            collectionName: {
                type: String,
                enum: ['organizers', 'players'],
            },
            id: String,
        },
    ],
    startDate: {
        type: Date
    },
    refereesCode: {
        type: String,
        default: null
    },
    organizersCode: {
        type: String,
        default: null
    },
    spectatorsCode: {
        type: String,
        default: null
    },
    creationDate: {
        type: Date
    },
    country: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    region: {
        type: String,
        default: null
    },
    shareLink: {
        type: String,
        default: null
    },
    organizers: [
        {
            _id: false,
            collectionName: {
                type: String,
                enum: ['organizers', 'players'],
            },
            id: String,
        },
    ],
    endDate: {
        type: Date
    },
    spectators: [
        {
            _id: false,
            collectionName: {
                type: String,
                enum: ['organizers', 'players'],
            },
            id: String,
        },
    ],
    isVisible: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        },
    },
     eventPhotos: {
        type: [{ type: String }],
        default: [],
    }
},
{ timestamps: true }
);
EventSchema.index({ id: 1 });
export default mongoose.model('event', EventSchema);
