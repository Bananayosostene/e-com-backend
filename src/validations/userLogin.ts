import Joi from 'joi'

const loginSchema = Joi.object({
  email: Joi.string()
    .regex(/^\S+@\S+\.\S{2,}$/)
    .lowercase()
    .required()
    .messages({
      'string.pattern.base':
        'Please enter a valid email address in the format name@example.example',
    }),
  password: Joi.string().required(),
})

export default loginSchema
