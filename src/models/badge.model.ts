import mongoose from 'mongoose'
import { badgeModel } from '../type/Database/type'
const badgeSchema = new mongoose.Schema<badgeModel>({
    id: {
        type: String,
        unique: true
    },
    condition: {
        type: String
    },
    count: {
        type: Number
    },
    image: {
        type: String
    },
    name: {
        type: String
    },
    category: {
        type: String
    }
},
{
    timestamps: true
}
)  

export default mongoose.model<badgeModel>('badges', badgeSchema)