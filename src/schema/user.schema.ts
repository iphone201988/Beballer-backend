import Joi from "joi";
import { deviceType } from "../utils/enum";
import {ObjectIdValidation, stringValidation} from "./index";

const loginSchema = {
  body: Joi.object({
    id: stringValidation("id"),
    deviceToken:stringValidation("Device Token"),
     deviceType: Joi.number()
      .valid(...Object.values(deviceType))
      .required()
      .messages({
        "number.base": `Device Type must be a number.`,
        "any.only": `Device Type must be one of: ${Object.values(
          deviceType
        ).join(", ")}.`,
        "any.required": `Device Type is required.`,
      }),
    latitude: Joi.number().min(-90).max(90).optional().messages({
      "any.required": "Latitude is required.",
      "number.base": "Latitude must be a number.",
      "number.min": "Latitude must be between -90 and 90.",
      "number.max": "Latitude must be between -90 and 90.",
    }),
    longitude: Joi.number().min(-180).max(180).optional().messages({
      "any.required": "Longitude is required.",
      "number.base": "Longitude must be a number.",
      "number.min": "Longitude must be between -180 and 180.",
      "number.max": "Longitude must be between -180 and 180.",
    }),
    type: stringValidation("Type"),
  }),
};


export const paramsSchema  = {
  params: Joi.object({
    id: ObjectIdValidation("id"),
  })
}
export const querySchema  = {
  query: Joi.object({
    id: ObjectIdValidation("id",false),
  })
}

const userSchema = {
    loginSchema,
    paramsSchema,
    querySchema

}

export default userSchema