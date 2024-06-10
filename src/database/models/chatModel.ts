import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'

/**
 * Chat Model
 */
class Chat extends Model {
  public id!: string

  public userId!: number

  public username!: string

  public message!: string
}

Chat.init(
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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Chat',
    tableName: 'Chats',
  },
)

export default Chat
