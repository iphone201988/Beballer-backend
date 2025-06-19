import mongoose from 'mongoose'
import { teamsModel } from '../type/Database/type'
const teamSchema = new mongoose.Schema<teamsModel>({
    id: {
        type: String,
        unique: true
    },
    coordinates: [
        {
            type: Number
        }
    ],
    name: {
        type: String
    },
    type: {
        type: String
    },
    url: {
        type: String
    },
    geohash: {
        type: String
    },
    gender: {
        type: String
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
},
{
    timestamps: true
}
)  

export default mongoose.model<teamsModel>('teams', teamSchema)