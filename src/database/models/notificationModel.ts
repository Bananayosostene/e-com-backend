import { Model, DataTypes, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import User from './userModel'
import sequelizeConnection from '../config/db.config'
/**
 * NotificationAttributes Interface
 */
export interface NotificationAttributes {
  id: string
  userId: number
  productId: string
  message: string
  isRead: boolean
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'isRead'> {}
/**
 * Notification class in Model
 */
class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string

  public userId!: number

  public productId!: string

  public message!: string

  public isRead!: boolean

  public readonly createdAt!: Date

  public readonly updatedAt!: Date

  /**
   * Initializes the Product model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  public static associate(): void {
    Notification.belongsTo(User, { foreignKey: 'userId' })
  }
}

Notification.init(
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
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: 'Notifications',
    modelName: 'Notification',
  },
)

export default Notification
