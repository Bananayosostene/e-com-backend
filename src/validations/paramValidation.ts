import Joi from 'joi'

const paramSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token must not be empty',
    'any.required': 'Token is required',
  }),
})

export const paramIdSchema = Joi.object({
  productId: Joi.string().guid().required().messages({
    'string.empty': 'id must not be empty',
    'any.required': 'id is required',
  }),
})

export default paramSchema
