import { DataTypes, Model } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'

/**
 * Collection Interface
 */
interface CollectionAttributes {
  id?: string
  name: string
  description: string
  sellerId: number
}

/**
 * Represents a collection in the database.
 */
class Collection
  extends Model<CollectionAttributes>
  implements CollectionAttributes
{
  public id!: string

  public name!: string

  public description!: string

  public sellerId!: number

 /**
   * Initializes the Product model.
   * @param {object} sequelize The Sequelize instance.
   * @returns {void}
   */
  static associate(): void {
   Collection.belongsTo(User, { foreignKey: 'sellerId' })
  }
}
  
    Collection.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: () => uuidv4(),
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sellerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize: sequelizeConnection,
        modelName: 'Collection',
        tableName: 'Collections',
      },
    )

export default Collection
