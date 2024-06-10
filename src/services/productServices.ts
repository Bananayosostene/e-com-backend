/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import moment from 'moment'
import { UUID } from 'crypto'
import Collection from '../database/models/collectionModel'
import Product from '../database/models/productModel'
import { OrderItem } from '../database/models/orderModel'

const createProductQuery = (sellerId: number, productId: string) => ({
    where: {
      [Op.and]: [{ id: productId }, { sellerId }],
    },
  })

export const getProductById = async (sellerId: number, productId: string) => {
  const query = createProductQuery(sellerId, productId)
  const product = await Product.findOne(query)
  return product
}

export const deleteProductById = (sellerId: number, itemId: string) => {
    const querySearch =createProductQuery(sellerId, itemId)
    const productToDelete = Product.destroy(querySearch)
    return productToDelete
}

export const getProductCount = async () => {
  const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')

  const products = await Product.findAll({
    where: {
      productStatus: 'available',
      expiryDate: {
        [Op.gt]: currentDate,
      },
    },
  })
  return products.length
}

export const getProductCollectionCount = async (collectionId: string) => {
  const products = await Product.findAll({
    where: { collectionId },
  })
  return products.length
}
export const getCollectionCount = async (sellerId:number) => {
  const collections = await Collection.findAll({
    where: { sellerId }
  })
  return collections.length
}

export const searchProductsService = async (query: any) => {
  const { query: searchQuery, minPrice, maxPrice } = query

  const where: any = {}

  if (searchQuery) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${searchQuery}%` } },
      { category: { [Op.iLike]: `%${searchQuery}%` } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price[Op.gte] = Number(minPrice)
    if (maxPrice) where.price[Op.lte] = Number(maxPrice)
  }

  const products = await Product.findAll({ where })
  return products
}

export const decrementProductServices = async (items: OrderItem[]) => {
  
  for (const item of items) {
    try {
      const product = await Product.findByPk(item.productId);

      if (!product || product.productStatus !== 'available') {
        continue; 
      }
      if (item.quantity <= 0 || item.quantity > product.quantity) {
        // console.warn(`Invalid quantity for product with ID ${item.productId}`);
        continue; 
      }

      product.quantity -= item.quantity;

      await product.save();

    } catch (error) {
      throw new Error(`Error decrementing product quantity: ${error}`);
    }
  }
};
