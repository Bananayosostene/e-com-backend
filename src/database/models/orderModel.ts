import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  images: string[]
}

export interface PaymentInfo {
  method: 'creditCard' | 'mobileMoney'
  cardNumber?: string
  cardHolderName?: string
  expiryDate?: string
  cvv?: string
  mobileMoneyNumber?: string
}

interface DeliveryInfo {
  country: string
  fullName: string
  phoneNumber: number
  streetAddress: string
  town: string
  email: string
  deliveryDate: Date
}

export enum OrderStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
  INITIATED = 'Initiated',
  FAILED = 'Failed',
}

interface OrderAttributes {
  id: string
  userId: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryInfo: DeliveryInfo
  paymentInfo: PaymentInfo
  orderNumber: string
  expectedDeliveryDate: string
  reference:string

}

/**
 * Order class for initializing order Attributes.
 */
class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: string

  public userId!: number

  public items!: OrderItem[]

  public totalAmount!: number

  public status!: OrderStatus

  public deliveryInfo!: DeliveryInfo

  public paymentInfo!: PaymentInfo

  public orderNumber!: string;

  public expectedDeliveryDate!: string;

  public reference!: string

  public readonly createdAt!: Date

  public readonly updatedAt!: Date

  /**
   * Initializes the Order model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  static associate(): void {
    User.hasMany(Order, {
      as: 'orders',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })
  }
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    deliveryInfo: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    paymentInfo: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true,
  },
)

export default Order
