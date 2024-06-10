'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    
    await queryInterface.addColumn('Users', 'lastTimePasswordUpdate', {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    });

    await queryInterface.addColumn('Users', 'isExpired', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "lastTimePasswordUpdate" = CURRENT_TIMESTAMP
      WHERE "lastTimePasswordUpdate" IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "isExpired" = false
      WHERE "isExpired" IS NULL
    `);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'lastTimePasswordUpdate');
    await queryInterface.removeColumn('Users', 'isExpired');
  }
};
