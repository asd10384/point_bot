
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('./MDB/data');
const path = require('path');
const http = require('http');
const express = require('express');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const app = express();
const Route = require('./html/module/Route');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/html/ejs'));

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/'));

app.use(Route);

app.use(async function(req, res, next) {
    res.status(404).render(`err`);
});

app.use(async function (err, req, res, next) {
    res.status(500).send(err);
});

app.listen(process.env.PORT, function() {
    console.log(`\nNODEJS PAGE IS ONLINE, PORT : ${process.env.PORT}\n`);
    setInterval(function() {
        http.get(process.env.DOMAIN);
    }, (60*1000)*30);
});
