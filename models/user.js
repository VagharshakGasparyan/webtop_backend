'use strict';
const bcrypt = require("bcrypt");
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
        getFullName() {
            return [this.first_name, this.last_name].join(' ');
        }

    }

    User.init({
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        email: DataTypes.STRING,
        photo: DataTypes.STRING,
        password: {
            type: DataTypes.STRING,
            set(value){
                this.setDataValue('password', bcrypt.hashSync(value, 8));
            },
            get(){
                return null;
            }
        },
        role: DataTypes.STRING,
        email_verified_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,

    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        // timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        // created_at: 'createTimestamp',
        // updated_at: 'updateTimestamp',
    });
    return User;
};