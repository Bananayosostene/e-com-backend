'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('Pending', 'Confirmed', 'Canceled'),
      allowNull: false,
      defaultValue: 'Pending',
    });
  }
};
