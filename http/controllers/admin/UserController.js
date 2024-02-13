const {api_validate, unique} = require("../../../components/validate");
const Joi = require("joi");
const {User} = require("../../../models");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser, generateString} = require("../../../components/functions");
const {userNotification} = require('../../notifications/userNotification');
const {conf} = require("../../../config/app_config");
const db = require("../../../models");
const {DB} = require('../../../components/db');
const md5 = require("md5");
const {extFrom} = require("../../../components/mimeToExt");
const UsersResource = require("../../resources/UsersResource");
const moment = require("moment/moment");
const fs = require('node:fs');

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
            'Hello, You are registered in WebTop, your password: ' + req.body.password
        );
        return res.send({data: {user: newUserData, message: message, generatedPassword}, errors: {}});
    }

    async update(req, res, next) {
        let {user_id} = req.params;
        let user = null;
        if(!user_id){
            res.status(422);
            return res.send({errors: 'No user id parameter.'});
        }
        let valid_err = api_validate({
            email: Joi.string().email(),
            first_name: Joi.string().min(2).max(30),
            last_name: Joi.string().min(2).max(30),
            role: Joi.string().min(2).max(30),
            old_password: Joi.string().min(6).max(30),
            new_password: Joi.string().min(6).max(30),
        }, req, res);
        if (valid_err) {
            res.status(422);
            return res.send({errors: valid_err});
        }
        let {email, first_name, last_name, role, new_password, old_password} = req.body;
        let updatedUserData = {};
        try {
            user = await DB('users').find(user_id);
            if(!user){
                res.status(422);
                return res.send({errors: "User with this id " + user_id + " can not found."});
            }
            if(email){
                let uniqueErr = await unique('users', 'email', email);
                if(uniqueErr){
                    res.status(422);
                    return res.send({errors: {email: uniqueErr}});
                }
                updatedUserData.email = email;
            }
            if(first_name){
                updatedUserData.first_name = first_name;
            }
            if(last_name){
                updatedUserData.last_name = last_name;
            }
            if(role){
                updatedUserData.role = role;
            }
            if(new_password){
                if(!old_password){
                    res.status(422);
                    return res.send({errors: "The old password with new password is required."});
                }
                if (!bcrypt.compareSync(old_password, user.password)) {
                    res.status(422);
                    return res.send({errors: 'The old password is incorrect.'});
                }
                updatedUserData.password = bcrypt.hashSync(new_password, 8);
            }
            let userPhoto = req.files ? req.files.photo : null;
            if (userPhoto) {
                let imageName = md5(Date.now()) + generateString(4);
                let ext = extFrom(userPhoto.mimetype, userPhoto.name);
                if(ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg"){
                    res.status(422);
                    return res.send({errors: 'file not a jpg or png.'});
                }

                let uploaded = saveFileContentToPublic('storage/uploads/users', imageName + ext, userPhoto.data);
                if (!uploaded) {
                    res.status(422);
                    return res.send({errors: 'Photo not uploaded.'});
                }
                if(user.photo){
                    fs.unlinkSync(__basedir + "/public/" + user.photo);
                }
                updatedUserData.photo = 'storage/uploads/users/' + imageName + ext;
            }

            if(Object.keys(updatedUserData).length > 0){
                updatedUserData.updated_at = moment().format('yyyy-MM-DD HH:mm:ss');
                await DB('users').where("id", user_id).update(updatedUserData);
            }else{
                return res.send({message: 'Nothing to update.'});
            }
        }catch (e) {
            console.error(e);
            res.status(422);
            return res.send({errors: 'User not updated.'});
        }

        return res.send({message: "User data updated successfully."});
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
        console.log(req.params);
        return res.send({message: "User with this id " + user_id + " deleted successfully."});
    }

}

module.exports = {UserController};