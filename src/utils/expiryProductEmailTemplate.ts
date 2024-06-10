import Product from '../database/models/productModel';
import User from '../database/models/userModel';

/**
 *  an email template for a product that has expired.
 * @param {Product} product - The product that has expired.
 * @param {User} seller - The product owner.
 */
const expiryEmailTemplate = (seller: User, product: Product) =>
    `
<h1>Product Expiry Notification</h1>
<p>Dear ${seller.username},</p>
<p>Your product,
  <span class='highlight'>${product.name}</span>, is now expired.☹️</p>
<p>Please take necessary actions to update or remove this product.</p>
<p>Thank you for your attention.</p>
<p>Best regards,</p>
<p>bitcrafters e-commerce</p>
`
export default expiryEmailTemplate
