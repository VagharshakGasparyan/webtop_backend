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
        await User.create({
            first_name: 'Vagharshak',
            last_name: 'Gasparyan',
            email: 'vvagharshak@gmail.com',
            email_verified_at: new Date(),
            role: 'admin',
            password: 'qwerty',
        });
        await queryInterface.bulkInsert('users', [
            {
                first_name: 'Ara',
                last_name: 'Aramyan',
                email: 'ara@gmail.com',
                password: bcrypt.hashSync('abcdefgh', 8),
                email_verified_at: new Date(),
                role: 'user',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                first_name: 'Abo',
                last_name: 'Abrahamyan',
                email: 'abo@gmail.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: new Date(),
                role: 'user',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                first_name: 'Ani',
                last_name: 'Ananyan',
                email: 'ani@gmail.com',
                password: bcrypt.hashSync('a1b2c3', 8),
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
