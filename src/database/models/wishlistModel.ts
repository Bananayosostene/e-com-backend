import { DataTypes, Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'


export interface wishlistProduct{
  productId: string
  name: string
  price: number
  images: string[]
}
/**
 * Wishlist Interface
 */
interface WishlistAttributes {
  id?: string
  buyerId: number
  products: wishlistProduct[]
}

/**
 * Represents a wishlist in the database.
 */
class Wishlist extends Model<WishlistAttributes> implements WishlistAttributes {
  public id!: string

  public buyerId!: number

  public products!: wishlistProduct[]

  /**
   * Initializes the Wishlist model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  static associate(): void {
    Wishlist.belongsTo(User, { foreignKey: 'buyerId' })
  }
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Wishlist',
    tableName: 'Wishlists',
  },
)

export default Wishlist
