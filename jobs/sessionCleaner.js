const cron = require("node-cron");
const {conf} = require("../config/app_config");
const {Op} = require("sequelize");
const queryInterface = require('../models').sequelize.getQueryInterface();

cron.schedule('*/5 * * * *', async () => {//running every 5 minutes
    // console.log('running session cleaner');
    await queryInterface.bulkDelete(
        conf.token.table,
        {
            updated_at: {
                [Op.lt]: new Date(new Date() - conf.token.maxAge)//updated_at < now - maxAge
            }
        },
        {}
    );
    // console.log('cron running at ' + moment().format('yyyy_MM_DD-HH:mm:ss'));
});