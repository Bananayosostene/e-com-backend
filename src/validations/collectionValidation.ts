import Joi from 'joi'

const collectionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
})

export default collectionSchema
