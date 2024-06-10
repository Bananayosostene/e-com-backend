import { Model, DataTypes } from 'sequelize'
import sequelizeConnection from '../config/db.config'

interface TokenAttributes {
  id?: number
  userId: number
  token: string
}

// interface CreationAttributes extends Optional<TokenAttributes, 'id'> {}
/**
 * Token class for initialising token attributes.
 */
class Token extends Model<TokenAttributes> implements TokenAttributes {
  public id!: number

  public userId!: number

  public token!: string
}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Token',
    timestamps: true,
  },
)

export default Token
