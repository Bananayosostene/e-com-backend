import JoiBase from 'joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

const orderSchema = Joi.object({
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().phoneNumber().required(),
  country: Joi.string().required(),
  streetAddress: Joi.string().required(),
  town: Joi.string().required(),
  email: Joi.string().email().required(),
  deliveryDate: Joi.date().required(),
  paymentMethod: Joi.string().valid('creditCard', 'mobileMoney').required(),
  cardHolderName: Joi.when('paymentMethod', {
    is: 'creditCard',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  expiryDate: Joi.when('paymentMethod', {
    is: 'creditCard',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  cvv: Joi.when('paymentMethod', {
    is: 'creditCard',
    then: Joi.string().length(3).required(),
    otherwise: Joi.forbidden(),
  }),
  cardNumber: Joi.when('paymentMethod', {
    is: 'creditCard',
    then: Joi.string().creditCard().required(),
    otherwise: Joi.forbidden(),
  }),
  mobileMoneyNumber: Joi.when('paymentMethod', {
    is: 'mobileMoney',
    then: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required(),
    otherwise: Joi.forbidden(),

  }),
  orderNumber: Joi.string(),

})

export const orderStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Canceled', 'Initiated','Failed', 'Completed').required(),
})

export default orderSchema
