const {api_validate, unique, VRequest} = require("../../../components/validate");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser, generateString} = require("../../../components/functions");
const {userNotification} = require('../../notifications/userNotification');
const {conf} = require("../../../config/app_config");
const {DB} = require('../../../components/db');
const md5 = require("md5");
const {extFrom} = require("../../../components/mimeToExt");
const UsersResource = require("../../resources/UsersResource");
const moment = require("moment/moment");
const fs = require('node:fs');
const TeamsResource = require("../../resources/teamsResource");
const SettingsResource = require("../../resources/settingsResource");
const controllersAssistant = require("../../../components/controllersAssistant");

class UserController {


    async notification(req, res, next){
        let send = await userNotification(
            req.body.email,
            'User created',
            'Hello, You are registered in WebTop, your password: ' + req.body.password,
            );
        return res.send({is: "ok"});
    }

    /**
     * verify, is admin logged in
     * @returns true|false
     */
    async logged(req, res, next) {
        // let loggedIn = !!res.locals.$api_auth.admin;
        if(res.locals.$api_auth.admin){
            // return res.send({data: {user: res.locals.$api_auth.admin}});
            return res.send();
        }
        res.status(401);
        return res.send();
        // return res.send({data: {user: null}});
        // let loggedIn = !!res.locals.$api_auth.admin;
        // return res.send({logged: loggedIn});
    }

    async login(req, res, next) {
        // console.log(req.body);
        // eval("if(true){ return res.send({errors: 'valid_err'});}");
        // new Function('if(true){return res.send({errors: \'valid_err\'});}')(res);
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
        let user = null;
        try {
            user = await DB("users").where("email", email).first();
        }catch (e) {
            console.error(e);
        }
        if (user) {
            if (!bcrypt.compareSync(password, user.password)) {
                errors['password'] = 'The password is incorrect.';
                res.status(422);
                return res.send({errors: errors});
            }
        } else {
            errors['email'] = 'The user with this email does not exists.';
            res.status(422);
            return res.send({errors: errors});
        }
        let token = await saveAndGetUserToken(user.id, 'admin');
        user = await new UsersResource(user);

        return res.send({data: {user: user}, token: token});
    }

    async logout(req, res, next) {
        let logout = false;
        if (res.locals.$api_auth.admin) {
            logout = await apiLogoutUser(res.locals.$api_auth.admin.id, 'admin', req, res);
        }
        if (logout) {
            return res.send({message: 'Logged out successfully.'});
        }
        res.status(422);
        return res.send({errors: 'Not logged out.'});
    }

    async create(req, res, next) {
        let errors = await new VRequest(req, res)
            .key('password').min(6).max(30)
            .key('role').min(2).max(15)
            .key('first_name').required().min(2).max(50)
            .key('last_name').required().min(2).max(50)
            .key('email').required().unique('users', 'email').email()
            .key('photo').image().max(5000000)
            .validate();
        if(errors){
            res.status(422);
            return res.send({errors: errors});
        }

        let message = null, generatedPassword = null;
        if (!req.body.role) {
            req.body.role = 'admin';
        }
        if (!req.body.password) {
            generatedPassword = req.body.password = generateString(10);
            message = 'User password generated automatically, it send to email.';
        }

        let newData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            email_verified_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            role: req.body.role,
            password: bcrypt.hashSync(req.body.password, 8),
            created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
        }

        try {
            controllersAssistant.filesCreate(req, res, ['photo'], [], 'storage/uploads/users',newData, []);
            let forId = await DB('users').create(newData);
            newData.id = forId.insertId;
        }catch (e) {
            res.status(422);
            return res.send({errors: 'User not created.'});
        }
        let send = await userNotification(
            req.body.email,
            'User created',
            'Hello, You are registered in WebTop, your password: ' + req.body.password
        );
        let locale = res.locals.$api_local;
        let user = await new UsersResource(newData, locale);

        return res.send({data: {user: user, message: message, generatedPassword}, errors: {}});
    }

    async update(req, res, next) {
        let {user_id} = req.params;
        let user = null;
        if(!user_id){
            res.status(422);
            return res.send({errors: 'No user id parameter.'});
        }
        user = await DB('users').find(user_id);
        if(!user){
            res.status(422);
            return res.send({errors: "User with this id " + user_id + " can not found."});
        }
        let errors = await new VRequest(req, res)
            .key('old_password').min(6).max(30)
            .key('new_password').min(6).max(30)
            .key('role').min(2).max(15)
            .key('first_name').min(2).max(50)
            .key('last_name').min(2).max(50)
            .key('email').unique('users', 'email', user.email).email()
            .key('photo').image().max(5000000)
            .validate();
        if(errors){
            res.status(422);
            return res.send({errors: errors});
        }

        let {new_password, old_password} = req.body;
        let newData = {};
        try {
            ['email', 'first_name', 'last_name', 'role'].forEach((item)=>{
                if(item in req.body){
                    newData[item] = req.body[item];
                }
            });

            if(new_password){
                if(!old_password){
                    res.status(422);
                    return res.send({errors: "The old password with new password is required."});
                }
                if (!bcrypt.compareSync(old_password, user.password)) {
                    res.status(422);
                    return res.send({errors: 'The old password is incorrect.'});
                }
                newData.password = bcrypt.hashSync(new_password, 8);
            }
            controllersAssistant.filesUpdate(req, res, ['photo'], [], 'storage/uploads/users', user, newData, []);

            if(Object.keys(newData).length > 0){
                newData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('users').where("id", user_id).update(newData);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'User not updated.'});
        }
        for(let key in newData){
            user[key] = newData[key];
        }
        let locale = res.locals.$api_local;
        user = await new UsersResource(user, locale);
        return res.send({data:{user}, message: "User data updated successfully.", errors: {}});
    }

    async destroy(req, res, next) {
        let {user_id} = req.params;
        if(!user_id){
            res.status(422);
            return res.send({errors: 'No user id parameter.'});
        }
        if(user_id === res.locals.$api_auth.admin.id.toString()){
            res.status(422);
            return res.send({errors: "You can not delete self."});
        }
        let user = null;
        try {
            user = await DB("users").find(user_id);
            if(!user){
                res.status(422);
                return res.send({errors: "User with this id " + user_id + " can not found."});
            }
            await DB("users").where("id", user_id).delete();
            let photo = user.photo;
            if(photo){
                fs.unlinkSync(__basedir + "/public/" + photo);
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'User not deleted.'});
        }
        return res.send({message: "User with this id " + user_id + " deleted successfully."});
    }

}

module.exports = {UserController};