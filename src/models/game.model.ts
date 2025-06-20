import mongoose from 'mongoose'
import { gameModel } from '../type/Database/type'
const gameSchem = new mongoose.Schema<gameModel>({
    id: {
        type: String,
        unique: true,
    },
    date: {
        type: Date,
    },
    team1ScoreTeam1: {
        type: Number,
        default: 0,
    },
    team1ScoreTeam2: {
        type: Number,
        default: 0,
    },
    team2ScoreTeam1: {
        type: Number,
        default: 0,
    },
    team2ScoreTeam2: {
        type: Number,
        default: 0,
    },
    isAutoRefereeing: {
        type: Boolean,
        default: false
    },
    visible: {
        type: Boolean,
        default: false
    },
    hasAcceptedInvitationReferee: {
        type: Boolean,
        default: false
    },
    team1Players: [
        {
            _id: false,
            collectionName: {
                type: String,
                enum: ['organizers', 'players'],
            },
            id: String,
        },
    ],
    type: {
        type: String,
    },
    mode: {
        type: Number,
        default: 1
    },
    hasAcceptedInvitationTeam1: [
        {
            type: Boolean,
            default: false
        }
    ],
    field: {
        ref: {
            collectionName: {
                type: String,
                default: null,
            },
            id: {
                type: String,
            },
        }
    },
    organizer: {
        ref: {
            collectionName: {
                type: String,
                default: null,
            },
            id: {
                type: String,
            },
        }
    },
    isVisible: {
        type: Boolean,
        default: false
    },
    team2Players: [
        {
            _id: false,
            collectionName: {
                type: String,
                enum: ['organizers', 'players'],
            },
            id: String,
        },
    ],
    hasAcceptedInvitationTeam2: [
        {
            type: Boolean,
            default: false
        }
    ],
    status: {
        type: String
    },
    teamToValidate: {
        type: Number,
        default: 1
    }
})

const Game = mongoose.model<gameModel>('games', gameSchem)
export default Game