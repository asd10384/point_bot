
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../../MDB/data');

module.exports = {
    voice,
};

async function voice (message = new Message, sdb = MDB.object.server) {
    var vchannel = message.member.voice.channel;
    if (!vchannel) {
        var desc = `음성채널에 들어간 뒤\n사용해주세요.`;
        return {
            success: false,
            desc: desc,
            vchannel: undefined
        };
    }
    sdb.quiz.vcid = vchannel.id;
    await sdb.save().catch((err) => console.log(err));
    return {
        success: true,
        desc: undefined,
        vchannel: vchannel,
    };
}
