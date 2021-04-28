
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');

module.exports = {
    name: 'ping',
    aliases: ['핑'],
    description: '핑 확인',
    async run (client = new Client, message = new Message, args = Array) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        const ping = new MessageEmbed()
            .setTitle(`\` PONG! \``)
            .setDescription(`🏓 \` ${client.ws.ping} \` ms`)
            .setColor('RANDOM');
        return message.channel.send(ping).then(m => msgdelete(m, Number(process.env.deletetime)));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}