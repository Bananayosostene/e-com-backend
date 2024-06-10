import { Request, Response } from 'express'
import cloudinary from 'cloudinary'
import { Op } from 'sequelize'
import moment from 'moment'
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from '../config/index'
import eventEmitter from '../services/notificationServices'

import Product from '../database/models/productModel'
import Collection from '../database/models/collectionModel'
import {
  deleteProductById,
  getProductById,
  getProductCount,
  getProductCollectionCount,
  getCollectionCount,
} from '../services/productServices'
import User, { UserRole } from '../database/models/userModel'
import  cloudinaryUpload  from '../utils/cloudinary'
import Review from '../database/models/reviewsModel'

cloudinary.v2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

interface CustomProduct extends Product {
  reviews?: Review[]
}

/**
 * Product Controller class
 */
export default class productController {
  /**
   * Adding product
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async addProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { name, price, category, bonus, sku, quantity, expiryDate } =
        req.body

      const collectionId = req.params.id
      const sellerId = req.user?.id

      const collection = await Collection.findByPk(collectionId)
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' })
      }

      const existingProduct = await Product.findOne({
        where: { name, sellerId, sku },
      })
      if (existingProduct) {
        return res.status(409).json({
          message: 'Product exists, please update your stock',
        })
      }

      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Images are required' })
      }
      if (files.length < 4 || files.length > 8) {
        return res.status(400).json({ message: 'Please upload 4 to 8 images' })
      }

      const uploadedImages = await Promise.all(
        (req.files as Express.Multer.File[]).map(
          async (file: Express.Multer.File) => {
            const result = await cloudinary.v2.uploader.upload(file.path)
            return { secure_url: result.secure_url }
          },
        ),
      )

      const imageUrls = uploadedImages.map((image) => image.secure_url)

      const product = await Product.create({
        name,
        price,
        category,
        collectionId,
        bonus,
        sku,
        quantity,
        images: imageUrls,
        expiryDate,
        sellerId,
      })
      eventEmitter.emit('product:created', product)

      return res.status(201).json({ message: 'Product added successfully' })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Create collection
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async createCollection(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const { name, description } = req.body
      const sellerId = req.user?.id

      const collection = await Collection.create({
        name,
        description,
        sellerId,
      })
      eventEmitter.emit('collection:created', collection)
      return res
        .status(201)
        .json({ message: 'Collection created successfully', collection })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * List products
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
static async listAllCollections(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const user = req.user

    const page: number =
      Number.parseInt(req.query.page as unknown as string, 10) || 1
    const limit: number =
      Number.parseInt(req.query.limit as unknown as string, 10) || 5

    if (
      Number.isNaN(page) ||
      Number.isNaN(limit) ||
      page <= 0 ||
      limit <= 0
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid pagination parameters' })
    }

    const offset = (page - 1) * limit

    const collections = await Collection.findAll({
      where: { sellerId: user.id},
      offset,
      limit,
    })

    if (!collections) {
      return res.status(400).json({ message: 'No collections available' })
    }

    const totalCount: number = await getCollectionCount(user.id)
    const totalPages = Math.ceil(totalCount / limit)


    return res.status(200).json({
      message: 'Collections retrieved successfully',
      collections,
      pagination: { limit, page, totalPages },
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

  //  User should be able to view specific item

  /**
   * Retrieves the details of a product.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<Response>} - A promise that resolves to an Express response.
   */
  static async getProductDetails(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const userId = req.user?.id
    const userRole = req.user?.userRole
    const productId = req.params.id

    try {
      const product: CustomProduct | null = await Product.findByPk(productId, {
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Review,
            as: 'reviews',
            attributes: [
              'id',
              'rating',
              'buyerId',
              'feedback',
              'createdAt',
              'updatedAt',
            ],
            include: [
              {
                model: User,
                as: 'buyer',
                attributes: ['id', 'username'],
              },
            ],
          },
        ],
      })

      if (!product) {
        return res.status(404).json({ status: 404, error: 'Product not found' })
      }

      const reviews = product.reviews || []
      
      const totalRating = reviews.reduce(
        (acc: number, review: any) => acc + review.rating,
        0,
      )
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0

      const productWithAverageRating = {
        ...product.toJSON(),
        averageRating,
      }

      if (userRole === UserRole.ADMIN) {
        if (product.quantity > 0) {
          return res.status(200).json({
            status: 200,
            message: 'Product details retrieved successfully by admin',
            item: productWithAverageRating,
          })
        }
      }

      if (userRole === UserRole.SELLER) {
        if (product.sellerId !== userId) {
          return res.status(403).json({
            status: 403,
            message: 'You are not authorized to access this product',
          })
        }
        if (product.quantity > 0) {
          return res.status(200).json({
            status: 200,
            message: 'Product details retrieved successfully by seller',
            item: productWithAverageRating,
          })
        }
      }

      if (userRole === UserRole.BUYER) {
        const currentDate = new Date()
        if (
          product.productStatus !== 'available' ||
          product.expiryDate < currentDate
        ) {
          return res.status(404).json({
            status: 404,
            error:
              product.productStatus !== 'available'
                ? 'Product is currently unavailable'
                : 'Product has expired',
          })
        }
        if (product.quantity > 0) {
          return res.status(200).json({
            status: 200,
            message: 'Product details retrieved successfully by buyer',
            item: productWithAverageRating,
          })
        }
      }
    } catch (error) {
      // console.log('error is', error)
      return res
        .status(500)
        .json({ status: 500, error: 'Internal server error' })
    }
  }

  /**
   * seller can mark product status as availbale or unavailable
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async changeProductStatus(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const sellerId = req.user.id
    const productId = req.params.productId
    const { productStatus } = req.body
    const product = await getProductById(sellerId, productId)

    if (!product) {
      return res.status(404).json({
        error:  
          'Product not found or you are not authorized to update this product',
      })
    }

    const currentDate = new Date()
    if (
      (product.quantity === 0 || product.expiryDate < currentDate) &&
      productStatus === 'available'
    ) {
      return res.status(400).json({
        error:
          'Product cannot be marked as available. May be the quantity is zero or the product has expired.',
      })
    }
    const updatedProduct = await product.update({
      productStatus: productStatus,
    })
    return res.status(200).json({
      data: updatedProduct,
      message: `Product updated as ${productStatus}`,
    })
  }

  /**
   * delete product
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.productId
      const sellerId = req.user?.id
      const product = await getProductById(sellerId, productId)
      if (product) {
        const result: number = await deleteProductById(sellerId, productId)
        if (result !== 0) {
          return res.status(200).json({ message: 'item deleted' })
        }
      } else {
        return res.status(404).json({ message: 'item not found' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * List products
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async listProducts(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user
      const page: number =
        Number.parseInt(req.query.page as unknown as string, 10) || 1
      const limit: number =
        Number.parseInt(req.query.limit as unknown as string, 10) || 5

      if (
        Number.isNaN(page) ||
        Number.isNaN(limit) ||
        page <= 0 ||
        limit <= 0
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid pagination parameters' })
      }

      const offset = (page - 1) * limit
      const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
      const totalCount: number = await getProductCount()
      const totalPages = Math.ceil(totalCount / limit)

      const products =
        user.userRole === 'buyer'
          ? await Product.findAll({
              where: {
                productStatus: 'available',
                expiryDate: {
                  [Op.gt]: currentDate,
                },
              },
              offset,
              limit,
            })
          : await Product.findAll({
              where: {},
              offset,
              limit,
            })

      return res.status(200).json({
        message: 'Products retrieved successfully',
        products,
        pagination: { limit, page, totalPages },
      })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  }

  /**
   * List products
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async listCollectionProducts(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const user = req.user
      const { collectionId } = req.params

      const page: number =
        Number.parseInt(req.query.page as unknown as string, 10) || 1
      const limit: number =
        Number.parseInt(req.query.limit as unknown as string, 10) || 5

      if (
        Number.isNaN(page) ||
        Number.isNaN(limit) ||
        page <= 0 ||
        limit <= 0
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid pagination parameters' })
      }

      const offset = (page - 1) * limit

      const collection = await Collection.findOne({
        where: { sellerId: user.id, id: collectionId },
      })

      if (!collection) {
        return res.status(400).json({ message: 'Invalid collection id' })
      }

      const totalCount: number = await getProductCollectionCount(collection.id)
      const totalPages = Math.ceil(totalCount / limit)

      const products = await Product.findAll({
        where: { collectionId: collection.id, sellerId: user.id },
        offset,
        limit,
      })

      return res.status(200).json({
        message: 'Products in collection retrieved successfully',
        products,
        pagination: { limit, page, totalPages },
      })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }}

  /**
   * Get all products of the signed in user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const sellerId = req.user?.id
      const products = await Product.findAll({
        where: {
          sellerId,
        },
      })
      return res.status(200).json(products)
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server error' })
    }
  }
  
  /**
   * update product
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { name, price, category, bonus, sku, quantity, expiryDate } = req.body

      const productId = req.params.id
      const userId = req.user.id;

      const product = await Product.findByPk(productId)
      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }
      if (product.sellerId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to update this product' });
      }
  
      if (product.productStatus === 'unavailable') {
        return res.status(400).json({ message: 'Product is not available' })
      }

      const updatedProduct = await product.update({
        name,
        price,
        category,
        bonus,
        sku,
        quantity,
        expiryDate,
      })
      return res.status(200).json({ message: 'Product updated successfully', data: updatedProduct })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message })
    }
  }

/**
 * Remove images from a product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
static async removeImages(req: Request, res: Response): Promise<Response> {
  try {
    const { images } = req.body;
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentImages = product.images || [];
    const updatedImages = currentImages.filter((image: string) => !images.includes(image));

    if (updatedImages.length === currentImages.length) {
      return res.status(400).json({ message: 'No images were removed', imagesToRemove: images });
    }

    await product.update({ images: updatedImages });
    return res.status(200).json({ message: 'Images removed successfully', imagesRemaining: updatedImages });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

 /**
 * Update Image of a product
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
static async addImages(req: Request, res: Response): Promise<Response> {
  try {
    const images = req.files as Express.Multer.File[];
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingImages = product.images || [];
    const newImages = [];

    for (const image of images) {
      const fileName = `${productId}-${image.originalname}`;
      const url = await cloudinaryUpload(image.buffer, fileName);
      newImages.push(url);
    }
    const updatedImages = [...existingImages, ...newImages];
    if (updatedImages.length < 4 || updatedImages.length > 8 ){
      return res.status(404).json({ message: 'Only 4-8 images need to be uploaded'})
    }
    await product.update({ images: updatedImages });
    return res.status(200).json({ message: 'Images added successfully', images: updatedImages });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}}
