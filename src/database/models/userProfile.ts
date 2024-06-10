import { DataTypes, Model } from 'sequelize'
import sequelizeConnection from '../config/db.config'
import User from '../models/userModel'

/**
 * User Interface
 */
export interface UserProfileAttributes {
  id: number
  userId: number
  username: string
  email: string
  birthdate: string
  gender: string
  preferredLanguage: string
  preferredCurrency: string
  phoneNumber: string
  homeAddress: string
  billingAddress: string
  profileImageUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface userCreationAttributes
  extends Omit<
    UserProfileAttributes,
    | 'id'
    | 'gender'
    | 'birthdate'
    | 'preferredLanguage'
    | 'preferedCurrency'
    | 'phoneNumber'
    | 'homeAddress'
    | 'billingAddress'
    | 'createdAt'
    | 'updatedAt'
  > {
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Represents a user in the databases.
 */
class UserProfile extends Model<UserProfileAttributes> implements UserProfileAttributes {
  public id!: number

  public userId!: number

  public username!: string

  public email!: string

  public gender!: string

  public birthdate!: string

  public phoneNumber!: string

  public preferredLanguage!: string

  public preferredCurrency!: string

  public homeAddress!: string

  public billingAddress!: string

  public profileImageUrl!: string

  public readonly createdAt!: Date

  public readonly updatedAt!: Date

  /**
   * Associations.
   * @returns {Object} An object representing association.
   */
  public static associate() {
    UserProfile.belongsTo(User)
   }

  /**
   * Overrides the default toJSON method to exclude the password field.
   * @returns {Object} An object representing the user, excluding the password.
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      gender: this.gender,
      birthdate: this.birthdate,
      preferredLanguage: this.preferredLanguage,
      preferredCurrency: this.preferredCurrency,
      phoneNumber: this.phoneNumber,
      homeAddress: this.homeAddress,
      billingAddress: this.billingAddress,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    phoneNumber: DataTypes.STRING,
    homeAddress: DataTypes.STRING,
    billingAddress: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthdate: DataTypes.STRING,
    profileImageUrl: DataTypes.STRING,
    preferredLanguage: DataTypes.STRING,
    preferredCurrency: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },

  {
    sequelize: sequelizeConnection,
    modelName: 'UserProfile',
    tableName: 'UsersProfiles',
    timestamps: true,
  },
)

export default UserProfile
