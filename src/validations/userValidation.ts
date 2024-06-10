import Joi from 'joi'

const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required(),
})

export const profileValidationalSchema = Joi.object({
  username: Joi.string().min(3).optional(),
  email: Joi.string().email().optional,
  profileImageUrl: Joi.string().optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9]+$/)
    .optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  birthdate: Joi.string()
    .pattern(
      /^(?:19|20)\d{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)$/,
    )
    .message('Please provide a valid birthdate in the format YYYY-MM-DD')
    .optional(),
  preferredLanguage: Joi.string().optional(),
  preferredCurrency: Joi.string().optional(),
  phoneNumber: Joi.string()
    .regex(/^(078|079|072|073)\d{7}$/)
    .message('Please provide a valid phone number start with 078/079/072/073'),
  billingAddress: Joi.string().optional(),
  homeAddress: Joi.string().optional(),
})

export default userSchema
const otpSchema = Joi.object({
  otp: Joi.string().length(4).required(),
})
const resetPasswordsLinkSchema = Joi.object({
  email: Joi.string().email().required(),
})
const newPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required(),
})
export { userSchema, otpSchema, resetPasswordsLinkSchema, newPasswordSchema }
