
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel, User } = require('discord.js');
const MDB = require('../../MDB/data');

const quiz = require('./quiz');
const { hint, skip } = require('./user');

module.exports = {
    ansermsg,
};

async function ansermsg(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
    const text = args.join(' ').trim().toLowerCase();

    var count = sdb.quiz.quiz.count;
    var name = sdb.quiz.quiz.name[count];
    var vocal = sdb.quiz.quiz.vocal[count];

    const anser = sdb.quiz.anser.anser;
    var anser_text = '';
    if (anser == 0) anser_text = `${name}`.trim().toLowerCase();
    if (anser == 1) anser_text = `${vocal}`.trim().toLowerCase();
    if (anser == 2) anser_text = `${name}-${vocal}`.trim().toLowerCase();
    if (anser == 3) anser_text = `${vocal}-${name}`.trim().toLowerCase();

    if (text == '힌트' || text == 'hint') {
        return await hint(client, message, args, sdb, user);
    }
    if (text == '스킵' || text == 'skip') {
        return await skip(client, message, args, sdb, user);
    }
    if (text == anser_text) {
        sdb.quiz.start.user = false;
        await sdb.save();
        return await quiz.anser(client, message, args, sdb, user);
    }
}
