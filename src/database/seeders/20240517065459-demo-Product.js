'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Products',
      [
        {
          id: '9e555bd6-0f36-454a-a3d5-89edef4ff9d7',
          name: 'Banana',
          price: 83,
          images: [
            'https://res.cloudinary.com/dzbxg4xeq/image/upload/v1713877715/e-commerce/cx03adwvxevuvxxeewyv.png',
          ],
          bonus: 0,
          quantity: 321,
          category: 'vegetables',
          productStatus: 'available',

          sellerId: 6,
          sku: '7321d946-7265-45a1-9ce3-3da1789e657e',
          collectionId: '6439b2e7-3fe6-4856-81e5-601c0d687dec',
          expiryDate: '2324-04-30T00:00:00.000Z',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '9e555bd6-0f36-454a-a3d5-89edef4ff9d1',
          name: 'Electronics',
          price: 49,
          category: 'Electronics',

          images: [
            'https://res.cloudinary.com/dzbxg4xeq/image/upload/v1713877715/e-commerce/cx03adwvxevuvxxeewyv.png',
          ],
          bonus: 0,
          productStatus: 'available',
          sku: '7321d946-7265-45a1-9ce3-3da1789e657e',
          quantity: 197,
          sellerId: 9,
          collectionId: '6439b2e7-3fe6-4856-81e5-601c0d687dec',
          expiryDate: '2324-04-30T00:00:00.000Z',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {})
  },
}
