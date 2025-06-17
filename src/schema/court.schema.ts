import Joi from "joi"
import { stringValidation } from "."


// const newCourtSchema = {
//    body: Joi.object({
//     name:stringValidation("Name"),
//     addressString: stringValidation("Address String"),
//     city: stringValidation("City"),
//     region: stringValidation("Region"),
//     country: stringValidation("Country"),
//     // accessibility: joi,
//     hoopsCount: Joi.number().required(),
//     isWomanFriendly: Joi.boolean().required(),
//     boardType: Joi.string().required(),
//     netType: Joi.string().required(),
//     floorType: Joi.string().required(),
//     description: Joi.string().required(),
//     grade: Joi.string().required(),
//     lat: Joi.number().required(),
//     long: Joi.number().required(),
//     photos: Joi.array().required(),
//    })
// }