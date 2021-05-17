
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const request = require('request');
const log = require('../../log/log');
const sdata = MDB.module.server();
const pdata = MDB.module.patchnote();

const mdl = require('./mdl');

var nameobj = {
    'bot': '디스코드 봇',
    'quiz': '퀴즈',
    'site': '사이트',
    'selfcheck': '자가진단',
    'err': '에러'
};
var namelist = Object.keys(nameobj);

module.exports = {
    logset: {
        logobj: nameobj,
        loglist: namelist
    },
    getlog,
};

async function getlog(req, res, name = '') {
    if (namelist.includes(name)) {
        request(`${process.env.DOMAIN}/log/${name}.txt`, async (err, res2, body) => {
            if (err) return log.errlog(err);
            return mdl.render(req, res, `log`, {
                title: `로그확인 - ${name}`,
                name: name,
                text: body,
                btn: null
            });
        });
        return;
    }
    return mdl.render(req, res, `err`, {
        text: `사이트를 찾을수 없습니다.`
    });
}
