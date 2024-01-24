'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      slug: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.JSON
      },
      description: {
        type: Sequelize.JSON
      },
      image: {
        type: Sequelize.STRING
      },
      images: {
        type: Sequelize.STRING
      },
      category_id: {
        type: Sequelize.BIGINT
      },
      disable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};