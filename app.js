
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('./MDB/data');
const log = require('./log/log');
const lg = require('./html/module/lg');
const path = require('path');
const http = require('http');
const express = require('express');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessionParser = require('express-session');

const app = express();
const Route = require('./html/module/Route');
const { writeFileSync } = require('fs');

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
    return res.status(404).render(`err`, {
        domain: process.env.DOMAIN,
        data: {
            text: `페이지를 찾을수 없습니다.`
        }
    });
});

app.use(async function (err, req, res, next) {
    return res.status(500).send(err);
});

app.listen(process.env.PORT, async function() {
    await clearlog();
    await log.sitelog(`NODEJS PAGE IS ONLINE\nDOMAIN : ${process.env.DOMAIN}\nPORT: ${process.env.PORT}`, new Date());
    setInterval(function() {
        http.get(process.env.DOMAIN_SLEEP, function(res) {
            res.on('data', function (chunk) {
                log.sitelog(`사이트가 정상작동 중입니다.\n주소 : ${process.env.DOMAIN_SLEEP}\nres: ${res.statusCode}`, new Date());
             });
    
            res.on('error', function (err) {
                log.sitelog(`사이트에 오류가 발생했습니다.\n주소 : ${process.env.DOMAIN_SLEEP}\nres: ${res.statusCode}`, new Date());
            });
        });
    }, (60*1000)*Number(process.env.DOMAIN_TIME));
});

async function clearlog() {
    for (i of lg.logset.loglist) {
        writeFileSync(`log/${i}.txt`, '', { encoding: 'utf8' });
    }
}
