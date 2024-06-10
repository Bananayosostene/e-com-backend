'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'reference', {
      allowNull: true,
      type: Sequelize.STRING,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'reference')
  },
}
