
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'help',
    aliases: ['h','명령어','도움말'],
    description: '명령어 확인',
    async run (client = new Client, message = new Message, args = Array, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        const commands = client.commands.array();
        const embed = new MessageEmbed()
            .setTitle(`\` ${client.user.username} \` 명령어`)
            .setDescription(`명령어 [같은 명령어]\n명령어 설명`)
            .setColor('ORANGE');
        
        commands.forEach((cmd) => {
            embed.addField(
                `**${pp}${cmd.name} [${cmd.aliases ? cmd.aliases : ''}]**`,
                `${cmd.description}`,
                true
            );
        });
        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
