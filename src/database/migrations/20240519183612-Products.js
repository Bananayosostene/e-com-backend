module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'productStatus', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ])
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'productStatus'),
    ])
  },
}
