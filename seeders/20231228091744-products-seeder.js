'use strict';

const bcrypt = require("bcrypt");
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
        await queryInterface.bulkInsert('products', [
            {
                slug: 'xartoc',
                name: '{"en": "xartoc", "hy": "խարտոց"}',
                description: '{"en": "well xartoc", "hy": "լավ խարտոց"}',
                image: 'storage/products/offer.jpg',
                category_id: 1,
                disable: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                slug: 'bochka',
                name: '{"en": "bochka", "hy": "բոչկա"}',
                description: '{"en": "well bochka", "hy": "լավ բոչկա"}',
                image: 'storage/products/offer.jpg',
                category_id: 1,
                disable: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                slug: 'kanfetty',
                name: '{"en": "kanfetty", "hy": "կանֆետ"}',
                description: '{"en": "well kanfetty", "hy": "լավ կանֆետ"}',
                image: 'storage/products/offer.jpg',
                category_id: 1,
                disable: true,
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
    }
};
