import Joi from "joi";
import { ObjectIdValidation, stringValidation } from ".";

const postQuerySchema  = {
  query: Joi.object({
    postId: ObjectIdValidation("PostId",false),
  })
}

export const postParamsSchema  = {
  params: Joi.object({
    postId: ObjectIdValidation("PostId"),
  })
}

const commentOnPostSchema = {
    body: Joi.object({
        postId: stringValidation("PostId"),
        comment: stringValidation("Comment")
    })
}
const postCommentQuerySchema  = {
  query: Joi.object({
    commentId: ObjectIdValidation(" Comment Id",false),
  })
}


const createPostSchema = {
    body: Joi.object({
        contentType: stringValidation("contentType"),
        description: stringValidation("description"),
        postContentWidth: stringValidation("postContentWidth",false),
        postContentHeight: stringValidation("postContentHeight",false)
    })
}

const postSchema = {
    postQuerySchema,
    postParamsSchema,
    commentOnPostSchema,
    postCommentQuerySchema,
    createPostSchema
}
export default postSchema