import { Request, Response } from 'express'
import Product from '../database/models/productModel'
import Wishlist, { wishlistProduct } from '../database/models/wishlistModel'
import Paginator from '../utils/paginator'
import { getWishlistsCount } from '../services/userServices'

/**
 * Wishlist Controller class
 */
export default class WishlistController {
  /**
   * Adding product to wishlist
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async addToWishlist(req: Request, res: Response): Promise<Response> {
    try{
    const { productId } = req.params

    const buyerId = req.user?.id

    if (!productId || !buyerId) {
      return res
        .status(400)
        .json({ message: 'Product ID and user ID are required' })
    }

    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const productDetails: wishlistProduct = {
      productId: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    }

    let wishlist = await Wishlist.findOne({ where: { buyerId } })

    if (!wishlist) {
      wishlist = await Wishlist.create({ buyerId, products: [productDetails] })
    } else {
      const productExists = wishlist.products.some(
        (p) => p.productId === productId,
      )
      if (productExists) {
        return res.status(400).json({ message: 'Product already in wishlist' })
      }

      const updatedProducts: wishlistProduct[] = [
        ...wishlist.products,
        productDetails,
      ]

      wishlist.products = updatedProducts
      await wishlist.save()
    }

    return res.status(201).json({
      message: 'Product added to wishlist successfully',
      wishlist,
    })
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message})
  }
  }

  /**
   * Get user's wishlist
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getWishlist(req: Request, res: Response): Promise<Response> {
    try{
    const buyerId = req.user?.id
    if (!buyerId) {
      return res.status(400).json({ message: 'User ID are required' })
    }

    const paginationResults = Paginator(req, res)

    if(!paginationResults){
      return res
  .status(400)
  .json({ message: 'Invalid pagination parameters' })
}

const {offset, limit, page} = paginationResults

const totalCount: number = await getWishlistsCount(buyerId)
const totalPages = Math.ceil(totalCount / limit)

    const wishlist = await Wishlist.findAll({
      where: { buyerId },
      limit,
      offset
    })

    if (!wishlist || wishlist.length === 0) {
      return res.status(404).json({ message: 'No product in wishlist' })
    }

    return res.status(200).json({ 
      message: 'WishList retrieved successfully',
      wishlist,
      pagination: { limit, page, totalPages },
    })
  } catch (error) {
    return res.status(500).json({message: 'Internal server error', error: error.message})
  }
  }

  /**
   * Delete product from wishlist
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async deleteFromWishlist(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try{
    const { productId } = req.params
    const buyerId = req.user?.id

    if (!productId || !buyerId) {
      return res
        .status(400)
        .json({ message: 'Product ID and user ID are required' })
    }
    const wishlist = await Wishlist.findOne({ where: { buyerId } })

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' })
    }
    const productIndex = wishlist.products.findIndex(
      (product) => product.productId === productId,
    )
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' })
    }

    wishlist.products.splice(productIndex, 1)

    await Wishlist.update(
      { products: wishlist.products },
      { where: { buyerId } },
    )

    return res.status(200).json({
      message: 'Product removed from wishlist successfully',
      updatedWishlist: wishlist,
    })
  } catch (error) {
    return res.status(500).json({message: 'Internal server error', error: error.message})
  }
  }
}
