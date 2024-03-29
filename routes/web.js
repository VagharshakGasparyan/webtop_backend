const express = require('express');
const {DB} = require("../components/db");
const router = express.Router();
const {normalizeTypes} = require("express/lib/utils");
const bcrypt = require("bcrypt");
const moment = require('moment');
const Joi = require('joi');
const {validate} = require('../components/validate');
const {loginUser, logoutUser} = require('../components/functions');


/* GET home page. */
router.get('/', async (req, res, next) => {
    // app.param('id', /^\d+$/);
    // app.get('/user/:id', function(req, res){
    //     res.send('user ' + req.params.id);
    // });
    res.render('pages/home', {title: 'Home', page: 'home'});
});

router.get('/products', async (req, res, next) => {
    //console.log(res.locals.$local);
    try {
        let products = [{id: 1, slug:"tes-hla", name:"TesHla", description:"ElektraMobile", category_id: 5, image: "images/qwerty.png"}];

        res.render('pages/products', {title: 'Products', page: 'products', products: products});
    }catch (e) {
        // res.status(500).json({message: "Server error", status: 500});
        // console.log(e.message);
        res.render('errors/error', {message: "Server Error", error: {status: 500, stack: e.message}});
    }
});
router.get('/login', async (req, res, next) => {
    // console.log(moment().format('yyyy_MM_DD_HH:mm:ss'));
    // console.log(req.session);

    if(res.locals.$auth.user){
        return res.redirect('/');
    }

    res.render('pages/login', {title: 'Login', page: 'login'});
});
router.post('/login', async (req, res, next) => {
    if(res.locals.$auth.user){
        return res.redirect('/');
    }

    if(
        !validate({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(20).required()
        }, req, res)
    ){
        return res.redirectBack();
    }

    const {email, password} = req.body;
    const user = await DB('users').where("email", email).first();
    if(user){
        if(!bcrypt.compareSync(password, user.password)){
            req.session.errors['password'] = 'The password is incorrect.';
            return res.redirectBack();
        }
    }else{
        req.session.errors['email'] = 'The user with this email does not exists.';
        return res.redirectBack();
    }
    await loginUser(user.id, req, res, 'user');
    await loginUser(user.id, req, res, 'admin');

    res.redirect('/');

});

router.get('/logout', async (req, res, next)=>{
    if(res.locals.$auth.user){
        await logoutUser(res.locals.$auth.user.id, 'user', req, res);
    }
    if(res.locals.$auth.admin){
        await logoutUser(res.locals.$auth.admin.id, 'admin', req, res);
    }
    res.redirectBack();
});


module.exports = router;
