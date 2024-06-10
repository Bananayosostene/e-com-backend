module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'expired', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ])
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'expired'),
    ])
  },
}
