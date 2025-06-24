import Joi from "joi";
import { deviceType } from "../utils/enum";
import {stringValidation} from "./index";


const createPlayerProfileSchema = {
    body:Joi.object({
        firstName: stringValidation("First Name",false),
        lastName:stringValidation("Last Name",false),
        username: stringValidation("Username",false),
        birthDate: stringValidation("Birth Date",false),
        gender: stringValidation("Gender",false),
        height: Joi.number().min(0).max(300).optional().messages({
            "any.required": "Height is required.",
            "number.base": "Height must be a number.",
            "number.min": "Height must be between 0 and 300.",
            "number.max": "Height must be between 0 and 300.",
        }),
        country: stringValidation("Country",false),
        countryCode: stringValidation("Country Code",false),
        position: stringValidation("Position",false),
        favoriteProTeam: stringValidation("Favorite Pro Teams",false),
        recutersViewed: stringValidation("Recuters Viewed",false),
        playPositionId: Joi.number().optional(),
    })
}

const playerSchema = {
    createPlayerProfileSchema
}

export default playerSchema