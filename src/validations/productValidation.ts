import Joi from 'joi'

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  bonus: Joi.number().required(),
  sku: Joi.string().trim().alphanum().min(5).max(20).required(),
  quantity: Joi.number().required(),
  expiryDate: Joi.date().required(),
})

export default productSchema
export const productStatusSchema = Joi.object({
  productStatus: Joi.string().valid('available', 'unavailable').required(),
})
export const reviewsValidationSchema = Joi.object({
  rating: Joi.number().min(0).max(5).required(),
  feedback: Joi.string().min(3).max(300).optional(),
});
