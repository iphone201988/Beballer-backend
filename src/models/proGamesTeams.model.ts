import mongoose from 'mongoose'
import { proGamesTeamsModel } from '../type/Database/type'

const proGamesTeamsSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
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
    imageURL: {
        type: String
    },
    country: {
        type: String
    }
},
{
    timestamps: true
}
)  
const ProGamesTeams = mongoose.model("progamesteamlatests", proGamesTeamsSchema);
export default ProGamesTeams;
