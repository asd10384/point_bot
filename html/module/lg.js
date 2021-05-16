
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const request = require('request');
const sdata = MDB.module.server();
const pdata = MDB.module.patchnote();

const mdl = require('./mdl');

module.exports = {
    getlog,
};

var namelist = [
    'bot',
    'quiz',
    'site'
];
async function getlog(req, res, name = '') {
    if (namelist.includes(name)) {
        request(`${process.env.DOMAIN}/log/${name}.txt`, async (err, res2, body) => {
            if (err) return console.log(err);
            return mdl.render(req, res, `log`, {
                title: `로그확인 - ${name}`,
                name: name,
                text: body
            });
        });
        return;
    }
    return mdl.render(req, res, `err`, {
        text: `사이트를 찾을수 없습니다.`
    });
}
