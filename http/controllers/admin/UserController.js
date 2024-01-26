const {api_validate, unique} = require("../../../components/validate");
const Joi = require("joi");
const {User} = require("../../../models");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser, generateString} = require("../../../components/functions");
const {userNotification} = require('../../notifications/userNotification');
const {conf} = require("../../../config/app_config");
const db = require("../../../models");
const queryInterface = db.sequelize.getQueryInterface();

class UserController {
    async login(req, res, next) {
        let valid_err = api_validate({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(30).required()
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }

        const {email, password} = req.body;
        let errors = {};
        const user = await User.findOne({where: {email: email}});
        if (user) {
            if (!bcrypt.compareSync(password, user.dataValues.password)) {
                errors['password'] = 'The password is incorrect.';
                res.status(422);
                return res.send({errors: errors});
            }
        } else {
            errors['email'] = 'The user with this email does not exists.';
            res.status(422);
            return res.send({errors: errors});
        }
        let token = await saveAndGetUserToken(user.dataValues.id, 'admin');

        return res.send({user: user, token: token});
    }

    async logout(req, res, next) {
        let logout = false;
        if (res.locals.$api_auth.admin) {
            logout = await apiLogoutUser(res.locals.$api_auth.admin.dataValues.id, 'admin', req, res);
        }
        if (logout) {
            return res.send({message: 'Logged out successfully.'});
        }
        res.status(422);
        return res.send({errors: 'Not logged out.'});
    }

    async create(req, res, next) {
        let uniqueErr = await unique('users', 'email', req.body.email);
        if(uniqueErr){
            res.status(422);
            return res.send({errors: {email: uniqueErr}});
        }
        let valid_err = api_validate({
            email: Joi.string().email().required(),
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            role: Joi.string().min(2).max(30),
            password: Joi.string().min(6).max(30)
        }, req, res);
        // return res.send({tmp: 'ok'});
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        // return res.send({tmp: 'no valid error'});
        let message = null, generatedPassword = null;
        if (!req.body.role) {
            req.body.role = 'admin';
        }
        if (!req.body.password) {
            generatedPassword = req.body.password = generateString(10);
            message = 'User password generated automatically, it send to email.';
        }
        let newUser = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            email_verified_at: new Date(),
            role: req.body.role,
            password: req.body.password,
        });
        let send = await userNotification(
            req.body.email,
            'User created',
            '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' + req.body.password + '</div>',
            'html');
        return res.send({user: newUser, message: message, generatedPassword});
    }

}

module.exports = {UserController};