

import Joi from "joi";
import { mode } from "../utils/enum"; 

export const createGameSchema = {
  body: Joi.object({
    mode: Joi.number()
      .valid(...Object.values(mode))
      .default(mode.ONE_VS_ONE)
      .required()
      .label("Mode"),

    courtId: Joi.string()
      .required()
      .label("Court ID"),

    isAutoRefereeing: Joi.boolean()
      .required()
      .label("Is Auto Refereeing"),

    date: Joi.date()
      .iso()
      .required()
      .label("Date"),

    visible: Joi.boolean()
      .default(true)
      .label("Visible"),
    refereeId: Joi.string().label("Referee ID"),
  }),
};

export default {
    createGameSchema
}
