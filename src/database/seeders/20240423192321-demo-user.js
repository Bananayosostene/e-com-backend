'use strict'

const bcrypt = require('bcryptjs')
const { CreatedAt, UpdatedAt } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords using bcrypt
    const hashedPassword = await bcrypt.hash('Testing123', 10)
    const hashedPassword1 = await bcrypt.hash('password1', 10)
    const hashedPassword2 = await bcrypt.hash('password2', 10)

    await queryInterface.bulkInsert('Users', [
      {
        username: 'John',
        email: 'John@gmail.com',
        password: hashedPassword1,
        createdAt: new Date(2000),
        updatedAt: new Date(2000),
      },
      {
        username: 'Karangwa',
        email: 'k@gmail.com',
        password: hashedPassword2,
        createdAt: new Date(2000),
        updatedAt: new Date(2000),
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {})
  },
}
