'use strict';
const bcrypt = require("bcrypt");
const {User, Product} = require("../models");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        // await User.create({
        //     first_name: 'Joe',
        //     last_name: 'Doe',
        //     email: 'joe@gmail.com',
        //     email_verified_at: new Date(),
        //     role: 'admin',
        //     password: 'qwerty',
        // });
        await queryInterface.bulkInsert('users', [
            {
                first_name: 'Root',
                last_name: 'Root',
                email: 'root@webtop.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: new Date(),
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                first_name: 'User',
                last_name: 'User',
                email: 'user@webtop.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: new Date(),
                role: 'user',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ], {});
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('users', null, {});
    }
};
