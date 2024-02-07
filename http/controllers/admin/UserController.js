const {api_validate, unique} = require("../../../components/validate");
const Joi = require("joi");
const {User} = require("../../../models");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser, generateString} = require("../../../components/functions");
const {userNotification} = require('../../notifications/userNotification');
const {conf} = require("../../../config/app_config");
const db = require("../../../models");
const queryInterface = db.sequelize.getQueryInterface();
const {DB} = require('../../../components/db');
const md5 = require("md5");
const {extFrom} = require("../../../components/mimeToExt");
const moment = require("moment/moment");

class UserController {
    async notification(req, res, next){
        let send = await userNotification(
            req.body.email,
            'User created',
            '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' + req.body.password + '</div>',
            'html');
        return res.send({is: "ok"});
    }
    async login(req, res, next) {
        console.log(req.body);
        // let users = await DB('users').paginate(1, 10).get(['id', 'first_name', 'last_name', 'email']);
        // console.log(users);
        // return res.send({tmp: users});

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

        let userPhoto = req.files ? req.files.photo : null;
        let photo = null;
        if (userPhoto) {
            let imageName = md5(Date.now()) + generateString(4);
            let ext = extFrom(userPhoto.mimetype, userPhoto.name);
            if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                res.status(422);
                return res.send({errors: 'file not a jpg or png.'});
            }
            // fs.copyFileSync(file.path, __basedir + '/public/images/qwerty.png');
            let uploaded = saveFileContentToPublic('storage/uploads/users', imageName + ext, userPhoto.data);
            if (!uploaded) {
                res.status(422);
                return res.send({errors: 'file not uploaded.'});
            }
            photo = 'storage/uploads/users/' + imageName + ext;
            console.log(uploaded);
            // fs.writeFileSync(__basedir + '/public/images/' + imageName + ext, file.data );
        }
        let newUserData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            email_verified_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            role: req.body.role,
            photo: photo,
            password: bcrypt.hashSync(req.body.password, 8),
            created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
        }

        try {
            await DB('users').create(newUserData);
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'User not created.'});
        }
        let send = await userNotification(
            req.body.email,
            'User created',
            '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' + req.body.password + '</div>',
            'html');
        return res.send({data: {user: newUserData, message: message, generatedPassword}, errors: {}});
    }
    async update(req, res, next) {

    }
    async destroy(req, res, next) {

    }

}

module.exports = {UserController};