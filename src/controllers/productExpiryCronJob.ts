import cron from 'node-cron';
import { Op } from 'sequelize';
import { CRON_TIME } from '../config/index'
import Product from '../database/models/productModel';
import User from '../database/models/userModel';
import notifyProductExpiry from '../utils/productExpiryNotify';
import logger from '../utils/logger'
import { Request, Response, NextFunction } from 'express'
import { passwordExpiryCron } from '../utils/passwordUpdateEvent'
/**
 * creates a cron job for a product that has expired.
 * @returns {void} A promise that resolves when the email is sent.
 */
const productExpiryCron = (): void => {
try{
  cron.schedule(CRON_TIME, async () => {
    logger.log('info', `Running a cron job at ${CRON_TIME}`)

    const currentDate = new Date();
    const products = await Product.findAll({
      where: {
        expiryDate: {
          [Op.lt]: currentDate,
        },
      },
    });

    for (const product of products) {
      if (!product.expired) {
        await product.update({ expired: true });
        await notifyProductExpiry(product);
      }
      await product.update({ productStatus: 'unavailable' });
    }
  });
}
catch(error){
  const errorr = 'Something went wrong!'
  logger.log('error', ` ${errorr}`)
}
};

export default productExpiryCron
