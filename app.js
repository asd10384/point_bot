
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('./MDB/data');
const path = require('path');
const http = require('http');
const express = require('express');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessionParser = require('express-session');

const app = express();
const Route = require('./html/module/Route');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/html/ejs'));

app.use(flash());
app.use(sessionParser({
    secret: process.env.SESSION,
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/'));

app.use(Route);

app.use(async function(req, res, next) {
    res.status(404).render(`err`, {
        domain: process.env.DOMAIN,
        data: {
            text: `페이지를 찾을수 없습니다.`
        }
    });
});

app.use(async function (err, req, res, next) {
    res.status(500).send(err);
});

app.listen(process.env.PORT, function() {
    console.log(`\nNODEJS PAGE IS ONLINE\nDOMAIN : ${process.env.DOMAIN}\nPORT: ${process.env.PORT}\n`);
    setInterval(function() {
        http.get(process.env.DOMAIN_SLEEP, function(res) {
            res.on('data', function (chunk) {
                console.log(`사이트가 정상작동 중입니다.\n주소 : ${process.env.DOMAIN_SLEEP}\nres: ${res.statusCode}`);
             });
    
            res.on('error', function (err) {
                console.log(`사이트에 오류가 발생했습니다.\n주소 : ${process.env.DOMAIN_SLEEP}\nres: ${res.statusCode}`);
            });
        });
    }, (60*1000)*Number(process.env.DOMAIN_TIME));
});
