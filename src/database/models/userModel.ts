import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../config/db.config';
import UserProfile from '../models/userProfile';
import Wishlist from './wishlistModel';
import Cart from './cartModel'
import Review from './reviewsModel'

export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
  SELLER = 'seller',
}

/**
 * User Interface
 */
export interface UserAttributes {
  id?: number
  username?: string
  email?: string
  password?: string
  userRole?: string
  verified?: boolean
  status?: string
  lastTimePasswordUpdate?: Date
  isExpired?: boolean
}

/**
 * Represents a user in the databases.
 */
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number

  public username!: string

  public email!: string

  public password!: string

  public lastTimePasswordUpdate!: Date

  public userRole!: string

  public verified: boolean

  public status!: string

  public isExpired?: boolean

  /**
   * Associations.
   * @returns {Object} An object representing association.
   */

  public static associate() {
    User.hasOne(UserProfile, {
      foreignKey: 'userId',
    })
    User.hasOne(Wishlist, { foreignKey: 'buyerId'});
    User.hasOne(Cart, { foreignKey: 'buyerId' })
    User.hasMany(Review, {
      foreignKey: 'buyerId',
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.ENUM('admin', 'seller', 'buyer'),
      defaultValue: 'buyer',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    lastTimePasswordUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  },
)

export default User
