import { getUserById } from '../services/userServices';
import Product from '../database/models/productModel';
import sendMail from './sendEmail'
import expiryEmailTemplate from './expiryProductEmailTemplate';
import logger from './logger';

/**
 * Sends an email notification for a product that has expired.
 * @param {Product} product - The product that has expired.
 */
async function notifyProductExpiry(product: Product) {
  try {
    const seller = await getUserById(product.sellerId)
    if (!seller) {
      console.error(`Seller not found for product ${product.name}`);
      return;
    }
    const html = expiryEmailTemplate(seller, product)
    await sendMail(seller.email, 'Product Expiry', html);
    logger.log('info', `Email sent to seller for product ${product.name}`)
  } catch (error) {
    logger.log('error', `Failed to send email for product ${product.name}: ${error}`)
  }
}
export default notifyProductExpiry
