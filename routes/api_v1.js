const express = require('express');
const router = express.Router();

// var app = require('express');
// require('express-group-routes');
const {validate, api_validate} = require("../components/validate");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser} = require("../components/functions");
const fs = require("node:fs");
const md5 = require('md5');
const {extFrom} = require('../components/mimeToExt');
const {UserController} = require('../http/controllers/admin/UserController');
const AdminDataController = require('../http/controllers/admin/AdminDataController');
const TeamsController = require('../http/controllers/TeamsController');
const SettingsController = require('../http/controllers/SettingsController');
const {DB} = require("../components/db");

const group = (callback) => {
    callback(router);
    return router;
};

router.get('/client', new UserController().client);

router.post('/admin/login', new UserController().login);
router.get('/admin/auth/me', new UserController().logged);
router.use('/admin', group((adminRouter)=>{
    adminRouter.use((req, res, next)=>{
        if(!res.locals.$api_auth.admin){
            res.status(401);
            return res.send({status: 401, message: "Unauthorized"});
        }
        next();
    });
    adminRouter.get('/logout', new UserController().logout);
    //--------------------admin user---------------------------------
    adminRouter.post('/user/create', new UserController().create);
    adminRouter.post('/user/update/:user_id([1-9]\\d?)', new UserController().update);
    adminRouter.delete('/user/delete/:user_id([1-9]\\d?)', new UserController().destroy);
    //--------------------admin team---------------------------------
    adminRouter.post('/team/create', new TeamsController().create);
    adminRouter.post('/team/update/:team_id([1-9]\\d?)', new TeamsController().update);
    adminRouter.delete('/team/delete/:team_id([1-9]\\d?)', new TeamsController().destroy);
    //--------------------settings-----------------------------------
    adminRouter.post('/setting/create', new SettingsController().create);
    adminRouter.post('/setting/update/:setting_id([1-9]\\d?)', new SettingsController().update);
    adminRouter.delete('/setting/delete/:setting_id([1-9]\\d?)', new SettingsController().destroy);
    // adminRouter.post('/notification', new UserController().notification);
    adminRouter.post('/admin-data', new AdminDataController().index);
}));

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.post('/login', async function (req, res, next) {
    let valid_err = api_validate({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required()
    }, req, res);
    if (valid_err) {
        return res.send({errors: valid_err});
    }

    const {email, password} = req.body;
    let errors = {};
    const user = await DB('users').where("email", email).first();
    if (user) {
        if (!bcrypt.compareSync(password, user.password)) {
            errors['password'] = 'The password is incorrect.';
            return res.send({errors: errors});
        }
    } else {
        errors['email'] = 'The user with this email does not exists.';
        return res.send({errors: errors});
    }
    let token = await saveAndGetUserToken(user.id, 'admin');

    return res.send({user: user, token: token});
});

router.get('/logout', async (req, res, next) => {
    let logout = false;
    if (res.locals.$api_auth.admin) {
        logout = await apiLogoutUser(res.locals.$api_auth.admin.id, 'admin', req, res);
    }
    if (res.locals.$api_auth.user) {
        logout = await apiLogoutUser(res.locals.$api_auth.user.id, 'user', req, res);
    }
    if (logout) {
        return res.send({message: 'Logged out successfully.'});
    }
    res.status(422);
    return res.send({errors: 'Not logged out.'});
});

router.get('/products', async (req, res) => {

    return res.send({auth: res.locals.$api_auth, locale: res.locals.$api_local});
});
router.post('/upload-file', async (req, res) => {
    let file = req.files ? req.files.avatar : null;
    // console.log('req.body=', req.body);
    // console.log('req.files=', req.files);
    // return res.send({is: 'ok'});

    if (file) {
        // console.log(file);
        let imageName = md5(Date.now());
        let ext = extFrom(file.mimetype, file.name);
        // fs.copyFileSync(file.path, __basedir + '/public/images/qwerty.png');
        let uploaded = saveFileContentToPublic('storage/uploads/avatars', imageName + ext, file.data);
        if (!uploaded) {
            res.status(422);
            return res.send({errors: 'file not uploaded.'});
        }
        console.log(uploaded);
        // fs.writeFileSync(__basedir + '/public/images/' + imageName + ext, file.data );
    }
    // fs.writeFileSync(__basedir + '/academious_123.png', req.files.avatar );

    return res.send({is: 'ok'});
});

module.exports = router;
