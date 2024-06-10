import { DataTypes, Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  images: string[]
}
/**
 * Cart Interface
 */
interface CartAttributes {
  id?: string
  buyerId: number
  items: CartItem[]
  totalQuantity: number
  totalPrice: number
  status: 'active' | 'completed' | 'cancelled'
}

/**
 * Represents a cart in the database.
 */
class Cart extends Model<CartAttributes> implements CartAttributes {
  public id!: string

  public buyerId!: number

  public items!: CartItem[]

  public totalQuantity!: number

  public totalPrice!: number

  public status!: 'active' | 'completed' | 'cancelled'

  /**
   * Initializes the Cart model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  static associate(): void {
    Cart.belongsTo(User, { foreignKey: 'buyerId' })
  }
}

Cart.init(
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
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Cart',
    tableName: 'Carts',
  },
)

export default Cart
