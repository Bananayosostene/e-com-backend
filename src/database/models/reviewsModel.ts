import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid'
import sequelizeConnection from '../config/db.config'
import User from './userModel'
import  Product from './productModel';

export interface ReviewAttributes {
  id: string;
  productId: string;
  buyerId: number;
  rating: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a product in the system.
 */
export class Review extends Model<ReviewAttributes> implements ReviewAttributes {
  
  public id!: string;

  public productId!: string;

  public buyerId!: number;

  public rating!: number;

  public feedback!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  /**
   * Associations.
   * @returns {Object} An object representing association.
   */
  public static associate(models:{
    Product: typeof Product;
    User: typeof User;
  }) {
    Review.belongsTo(models.User, {foreignKey: 'buyerId', as: 'buyer'});
    Review.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'});
  }
}

Review.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rating: DataTypes.FLOAT,
      feedback: DataTypes.STRING,
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
      },
      buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize: sequelizeConnection,
      modelName: 'Review',
      tableName: 'Reviews',
      timestamps: true,
    }
  );

export default Review;
