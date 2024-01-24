'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
        getName() {
            return 'my name is Name';
        }
    }

    Product.init({
        // id: DataTypes.STRING,
        slug: DataTypes.STRING,
        name: {
            type: DataTypes.STRING,
            // get(){
            //     const rawName = this.getDataValue('name');
            //     return rawName['en'] ?? rawName['hy'] ?? '';
            // }
        },
        description: {
            type: DataTypes.STRING,
            // get(){
            //     const rawDescription = this.getDataValue('description');
            //     return rawDescription['en'] ?? rawDescription['hy'] ?? '';
            // }
        },
        image: DataTypes.STRING,
        images: DataTypes.STRING,
        category_id: DataTypes.STRING,
        disable: DataTypes.STRING,
    }, {
        sequelize,
        //----------------------------------------------------------------

        //----------------------------------------------------------------

        modelName: 'Product',
        tableName: 'products',
        // timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return Product;
};