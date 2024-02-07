const nodemailer = require('nodemailer');
const {conf} = require('../../config/app_config');

const transporter = nodemailer.createTransport(conf.mail.transporter);
let userNotification = async (email, subject = '', message = '') => {
    if(email && typeof email === 'string' && typeof subject === 'string' && typeof message === 'string'){
        let options = {
            from: conf.mail.from, //'webtop@info.com'
            to: email,
            subject: subject,
            html: '<div style="font-size: 25px;color: #077">' + message + '</div>', //text or html: message
        };
        try {
            // const info = await transporter.sendMail(options);
            await transporter.sendMail(options);
            return true;
        }catch (e) {
            console.error(e);
            return false;
        }
    }
    console.error('Not required arguments for userNotification.');
    return false;
}

module.exports = {userNotification};