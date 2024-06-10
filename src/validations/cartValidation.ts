import Joi from 'joi'

const cartSchema = Joi.object({
  quantity: Joi.number().required(),
})

export default cartSchema
