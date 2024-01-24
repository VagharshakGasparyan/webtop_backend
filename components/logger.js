const winston = require('winston');
const moment = require("moment/moment");
const cron = require("node-cron");
const {conf} = require('../config/app_config');

let log = null;
const makeLog = () => {
    let now = moment().format(conf.log.format);
    log = winston.createLogger({
        level: 'info', // уровень логирования
        format: winston.format.simple(), // формат вывода
        transports: [
            // new winston.transports.Console(), // вывод в консоль
            new winston.transports.File({filename: conf.log.path + '/' + now + conf.log.ext}) // вывод в файл
        ]
    });
    global.log = log;
};
makeLog();
cron.schedule('0 0 * * *', () => {//running every day at 0:00
    makeLog();
    // console.log('cron running at ' + moment().format('yyyy_MM_DD-HH:mm:ss'));
});
// log.info('Info message.');
// log.warn('Warning message.');
// log.error('Error message.');
// let processEvents = ['beforeExit', 'disconnect', 'exit', 'rejectionHandled', 'uncaughtException',
//   'uncaughtExceptionMonitor', 'unhandledRejection', 'warning', 'message'];
let errProcessEvents = ['uncaughtException', 'uncaughtExceptionMonitor'];
// process.on('uncaughtException', (err) => {
//     log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\n' + err.stack + '\n\n');
//     process.exit(1);
// });
errProcessEvents.forEach((errProcessEvent) => {
    process.on(errProcessEvent, (err) => {
        log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\n' + err.stack + '\n\n');
        process.exit(1);
    });
});
process.on('warning', (err) => {
    log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\n' + err.stack + '\n\n');
});
// process.stdout.wr = process.stdout.write;
process.stdout.er = process.stderr.write;
process.stderr.write = (mes, c) => {
    log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\n' + mes + '\n\n');
    process.stdout.er(mes, c);
}
process.on('exit', (code) => {
  // console.log(`Процесс завершен с кодом: ${code}`);
  log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\nExit with code: ' + code + '\n\n');
  // process.exit(1);
});
