
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel } = require('discord.js');
const MDB = require('../../MDB/data');

const mq = require('./musicquiz');
const { hint, skip } = require('./user');

module.exports = {
    ansermsg,
};

async function ansermsg(client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
    const text = args.join(' ').trim().toLowerCase();

    var count = sdb.musicquiz.music.count;
    var name = sdb.musicquiz.music.name[count];
    var vocal = sdb.musicquiz.music.vocal[count];

    const anser = sdb.musicquiz.anser.anser;
    var anser_text = '';
    if (anser == 0) anser_text = `${name}`.trim().toLowerCase();
    if (anser == 1) anser_text = `${vocal}`.trim().toLowerCase();
    if (anser == 2) anser_text = `${name}-${vocal}`.trim().toLowerCase();
    if (anser == 3) anser_text = `${vocal}-${name}`.trim().toLowerCase();

    if (text == anser_text) {
        sdb.musicquiz.start.user = false;
        await sdb.save().catch((err) => console.log(err));
        return await mq.anser(client, message, args, sdb);
    }
    if (text == '힌트' || text == 'hint') {
        return await hint(client, message, args, sdb, message.member.user);
    }
    if (text == '스킵' || text == 'skip') {
        return await skip(client, message, args, sdb, message.member.user);
    }
}
