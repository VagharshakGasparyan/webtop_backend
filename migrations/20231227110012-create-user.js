'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      first_name: {
        type: Sequelize.STRING
        // allowNull defaults to true
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
      role: {
        type: Sequelize.STRING
      },
      email_verified_at: {
        allowNull: true,
        type: Sequelize.DATE
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
    await queryInterface.dropTable('users');
  }
};