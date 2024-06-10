import { Request, Response } from 'express';
import Product from '../database/models/productModel';
import Review from '../database/models/reviewsModel';


/**
 * buyer add a review on a product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, feedback } = req.body;
    const {buyerId, productId} = req.purchasedProduct;

    const review = Review.create({
      buyerId,
      productId,
      rating,
      feedback,
    });

    return res.status(200).json({message: 'Review added success', review});
  } catch (err: unknown) {
    const errors = err as Error;
    return res.status(500).json(errors.message);
  }
};

/**
 * any user can get all reviews from a product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const productExist = await Product.findByPk(productId);

    if (!productExist) {
        return res.status(404).json({message: 'Product not found'});
    }
  
    const allReviews = await Review.findAll({
      where: { productId },
      order: [['createdAt', 'ASC']]
    });

    return res.status(200).json({message: 'Review got success', allReviews});
  } catch (err: unknown) {
    const errors = err as Error;
    return res.status(500).json(errors.message);
  }
};
