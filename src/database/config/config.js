const dotenv = require('dotenv')

dotenv.config()

const commonDatabaseConfig = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
}

const sequelizeConfig = {
  development: {
    ...commonDatabaseConfig,
    url: process.env.DEV_DATABASE_URL,
  },
  test: {
    ...commonDatabaseConfig,
    url: process.env.TEST_DATABASE_URL,
  },
  production: {
    ...commonDatabaseConfig,
    url: process.env.PROD_DATABASE_URL,
  },
}

module.exports = sequelizeConfig