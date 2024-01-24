const {api_validate} = require("../../../components/validate");
const Joi = require("joi");
const {User} = require("../../../models");
const bcrypt = require("bcrypt");
const {saveAndGetUserToken, apiLogoutUser} = require("../../../components/functions");


class UserController {
    async login(req, res, next){
        let valid_err = api_validate({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(20).required()
        }, req, res);
        if (valid_err) {
            return res.send({errors: valid_err});
        }

        const {email, password} = req.body;
        let errors = {};
        const user = await User.findOne({where: {email: email}});
        if (user) {
            if (!bcrypt.compareSync(password, user.dataValues.password)) {
                errors['password'] = 'The password is incorrect.';
                return res.send({errors: errors});
            }
        } else {
            errors['email'] = 'The user with this email does not exists.';
            return res.send({errors: errors});
        }
        let token = await saveAndGetUserToken(user.dataValues.id, 'admin');

        return res.send({user: user, token: token});
    }
    async logout(req, res, next){
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

}

module.exports = {UserController};