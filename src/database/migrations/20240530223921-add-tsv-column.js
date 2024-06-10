'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'tsv', {
      type: 'tsvector',
    })

    await queryInterface.sequelize.query(`
      UPDATE "Products"
      SET "tsv" = 
          setweight(to_tsvector(coalesce("name", '')), 'A') ||
          setweight(to_tsvector(coalesce("category", '')), 'B');
    `)

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS tsvectorupdate ON "Products";
    `)

    await queryInterface.sequelize.query(`
      CREATE INDEX tsv_idx ON "Products" USING gin("tsv");
    `)

    await queryInterface.sequelize.query(`
      CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
      ON "Products" FOR EACH ROW EXECUTE FUNCTION
      tsvector_update_trigger("tsv", 'pg_catalog.english', "name", "category");
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS tsvectorupdate ON "Products";
    `)

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS tsv_idx;
    `)

    await queryInterface.removeColumn('Products', 'tsv')
  },
}
