'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Setting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
        // getName() {
        //     return 'my name is Name';
        // }
    }

    Setting.init({
        // id: DataTypes.STRING,
        key: DataTypes.STRING,
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
            // get(){
            //     const rawDescription = this.getDataValue('description');
            //     return rawDescription['en'] ?? rawDescription['hy'] ?? '';
            // }
        },
        value: DataTypes.STRING,
        type: DataTypes.STRING,
        image: DataTypes.STRING,
        images: DataTypes.STRING,
        active: DataTypes.STRING,
    }, {
        sequelize,
        //----------------------------------------------------------------

        //----------------------------------------------------------------

        modelName: 'Setting',
        tableName: 'settings',
        // timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return Setting;
};