'use strict'

const { CreatedAt, UpdatedAt } = require('sequelize-typescript')
const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const collectionId = uuidv4()

    await queryInterface.bulkInsert('Collections', [
      {
        id: uuidv4(),
        name: 'Shoes',
        sellerId: 1182,
        createdAt: new Date(2000),
        updatedAt: new Date(2000),
      },
      {
        id: collectionId,
        name: 'Electronics',
        sellerId: 1182,
        createdAt: new Date(2000),
        updatedAt: new Date(2000),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Colletions', null, {})
  },
}
