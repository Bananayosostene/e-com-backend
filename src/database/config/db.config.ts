import { config } from 'dotenv'
import { Sequelize } from 'sequelize'

config()
const APP_MODE: string = 'development'
const DB_HOST_MODE: string = process.env.DB_HOST_TYPE as string

/**
 * Get the URI for the database connection.
 * @returns {string} The URI string.
 */
function getDbUri(): string {
  switch (APP_MODE) {
    case 'test':
      return process.env.TEST_DATABASE_URL as string
    case 'production':
      return process.env.PROD_DATABASE_URL as string
    default:
      return process.env.DEV_DATABASE_URL as string
  }
}

/**
 * Get dialect options for Sequelize.
 * @returns {DialectOptions} The dialect options.
 */
function getDialectOptions() {
  return DB_HOST_MODE === 'local'
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: true,
        },
      }
}

const sequelizeConnection: Sequelize = new Sequelize(getDbUri(), {
  dialect: 'postgres',
  dialectOptions: getDialectOptions(),
  logging: false,
})
export default sequelizeConnection
