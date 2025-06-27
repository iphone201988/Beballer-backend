import Joi from "joi";
import { stringValidation } from ".";
import {
  courtAccessibility,
  courtBoardType,
  courtNetType,
  courtFloorType,
} from "../utils/enum"; 

export const newCourtSchema = {
  body: Joi.object({
    name: stringValidation("Name").required(),
    addressString: stringValidation("Address String").required(),
    city: stringValidation("City").required(),
    region: stringValidation("Region").required(),
    country: stringValidation("Country").required(),

    accessibility: stringValidation("Accessibility")
      .valid(...Object.values(courtAccessibility))
      .required()
      .messages({
        "any.only": `Accessibility must be one of: ${Object.values(courtAccessibility).join(", ")}`,
      }),

    hoopsCount: Joi.number().required(),
    isWomanFriendly: Joi.boolean().optional(),

    boardType: stringValidation("Board Type")
      .valid(...Object.values(courtBoardType))
      .required()
      .messages({
        "any.only": `Court Board Type must be one of: ${Object.values(courtBoardType).join(", ")}`,
      }),

    netType: stringValidation("Net Type")
      .valid(...Object.values(courtNetType))
      .required()
      .messages({
        "any.only": `Court Net Type must be one of: ${Object.values(courtNetType).join(", ")}`,
      }),

    floorType: stringValidation("Floor Type")
      .valid(...Object.values(courtFloorType))
      .required()
      .messages({
        "any.only": `Floor Type must be one of: ${Object.values(courtFloorType).join(", ")}`,
      }),

    description: stringValidation("Description").required(),
    grade: stringValidation("Grade").required(),
    lat: Joi.number().required(),
    long: Joi.number().required(),
  }),
};
