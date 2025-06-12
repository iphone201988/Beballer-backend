import Joi from "joi";
import { deviceType } from "../utils/enum";
import {stringValidation} from "./index";


const createPlayerProfileSchema = {
    body:Joi.object({
        firstName: stringValidation("First Name"),
        lastName:stringValidation("Last Name"),
        username: stringValidation("Username"),
        birthDate: stringValidation("Birth Date"),
        gender: stringValidation("Gender"),
        height: Joi.number().min(0).max(300).required().messages({
            "any.required": "Height is required.",
            "number.base": "Height must be a number.",
            "number.min": "Height must be between 0 and 300.",
            "number.max": "Height must be between 0 and 300.",
        }),
    })
}

const playerSchema = {
    createPlayerProfileSchema
}

export default playerSchema