
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const request = require('request');
const sdata = MDB.module.server();
const pdata = MDB.module.patchnote();

module.exports = {
    render,
};

async function render(req, res, ejs = '', data = {}) {
    return res.status(200).render(ejs, {
        domain: process.env.DOMAIN,
        ejs: ejs,
        data: data
    });
}
