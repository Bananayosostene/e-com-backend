/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTypes, Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'
import Collection from './collectionModel'
import Review from './reviewsModel'

/**
 * Product Interface
 */
interface ProductAttributes {
  id?: string
  name: string
  price: number
  category: string
  collectionId: string
  bonus: number
  sku: string
  quantity: number
  images: string[]
  expiryDate: Date
  sellerId: number
  productStatus: string
  expired: boolean
  tsv?: any
}

/**
 * Represents a product in the database.
 */
class Product extends Model<ProductAttributes> implements ProductAttributes {
  public id!: string

  public name!: string

  public price!: number

  public category!: string

  public collectionId!: string

  public bonus!: number

  public sku!: string

  public quantity!: number

  public images!: string[]

  public expiryDate!: Date

  public expired!: boolean

  public sellerId!: number

  public productStatus: string

  public tsv!: any

  /**
   * Initializes the Product model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  static associate(): void {
    Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })
    Product.belongsTo(Collection, { foreignKey: 'collectionId' })
    Product.hasMany(Review, { as: 'reviews', foreignKey: 'productId' })
  }
}
Product.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bonus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'available',
    },
    tsv: {
      type: DataTypes.TSVECTOR,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true,
  },
)

export default Product
