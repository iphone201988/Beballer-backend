import Joi from "joi"

export const stringValidation = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .required()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
        "any.required": `${key} is required`,
      });
  } else {
    schema = Joi.string()
      .optional()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
      });
  }

  return schema;
};