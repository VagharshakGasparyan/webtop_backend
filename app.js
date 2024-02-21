const express = require('express');
const app = express();
const path = require('node:path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const cron = require('node-cron');
require('dotenv').config();
// require("./components/logger");
// const fs = require("node:fs");
const {exec, spawn} = require("node:child_process");
const fileUpload = require("express-fileupload");
//---------------------------------------------------------------------------------
console.log(">>>>>>>>>>started");
//-------------------------------cors----------------------------------------------
app.use(cors({
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));
//-------------------------------global functions----------------------------------
require("./components/globalFunctions")(__dirname);
//---------------------cron jobs-begin---------------------------------------------
require("./jobs/sessionCleaner");
require("./jobs/logFileCleaner");
//---------------------cron jobs-end-----------------------------------------------
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//------------------set layouts----------------------------------------------------
app.use(require('express-ejs-layouts'));
app.set('layout', 'layouts/main');

// app.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    // useTempFiles : true,
    // tempFileDir : __dirname + '/tmp',
    // safeFileNames: true,
    // preserveExtension: true,
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'ses',
    secret: 'Fb25ekS7Im',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 10 * 60 * 1000}
}));

app.use(require("./middleware/auth"));
app.use(require("./middleware/api_auth"));

app.use('/', require('./routes/web'));
app.use('/api/v1', require('./routes/api_v1'));

require("./middleware/errors")(app);

module.exports = app;
