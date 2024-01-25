const nodemailer = require('nodemailer');
const {conf} = require('../../config/app_config');

const transporter = nodemailer.createTransport(conf.mail.transporter);
let userNotification = async (email, subject = '', message = null, type = 'text') => {
    let options = {
        from: conf.mail.from //'webtop@info.com'
    };
    let allIn = 0;
    if(email && typeof email === 'string'){
        options.to = email;
        allIn ++;
    }
    if(typeof subject === 'string'){
        options.subject = subject;
        allIn ++;
    }
    if(email && typeof email === 'string'){
        options.to = email;
        allIn ++;
    }
    if(message && typeof message === 'string' && (type === 'text' || type === 'html')){
        options[type] = message;
        allIn ++;
    }
    if(allIn >= 3){
        try {
            // const info = await transporter.sendMail(options);
            await transporter.sendMail(options);
            return true;
        }catch (e) {
            console.error(e);
            return false;
        }
    }
    console.error('Arguments for userNotification are less');
    return false;

}

module.exports = {userNotification};