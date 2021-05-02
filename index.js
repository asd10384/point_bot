
require('dotenv').config();
const { Client, Collection, MessageEmbed, Message } = require('discord.js');
const client = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']});
const { readdirSync } = require('fs');
const { join } = require('path');
const db = require('quick.db');
const { ansermsg } = require('./module/musicquiz/ansermsg');

// env
const dfprefix = process.env.prefix;
const deletetime = Number(process.env.deletetime) || 6000;

// DB
const MDB = require('./MDB/data');
const sdata = MDB.module.server();

// google key
const googleapi = require('./googlettsapi');
googleapi.getkeyfile();

// commands get
client.commands = new Collection();
const commandFiles = readdirSync(join(__dirname, 'cmd')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(join(__dirname, 'cmd', `${file}`));
    client.commands.set(command.name, command);
}

// client errorcheck
client.on('error', (err) => console.error(err));

// client on
require('./client/ready')(client);

// client login
client.login(process.env.token);

client.on('message', async (message) => {
    // 봇이나 디엠 메시지 무시
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    
    // prefix 설정
    var prefix = await db.get(`db.prefix.${message.member.id}`);
    if (prefix == (null || undefined)) {
        await db.set(`db.prefix.${message.member.id}`, dfprefix);
        prefix = dfprefix;
    }

    await sdata.findOne({
        serverid: message.guild.id
    }, async (err, db) => {
        var sdb = MDB.object.server;
        sdb = db;
        if (err) console.log(err);
        if (!sdb) {
            await MDB.set.server(message);
        } else {
            // 채팅 채널 연결
            var ttsid = sdb.tts.ttschannelid;
            if (ttsid == null || ttsid == undefined) {
                ttsid = '0';
            }
            var musicquizid = sdb.musicquiz.mqchannelid;
            if (musicquizid == null || musicquizid == undefined) {
                musicquizid = '0';
            }

            // prefix 입력시
            if (message.content.startsWith(prefix)) {
                const args = message.content.slice(prefix.length).trim().split(/ +/g);
                const commandName = args.shift().toLowerCase();
                
                const command = client.commands.get(commandName) ||
                client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    
                try {
                    // 명령어 실행
                    await command.run(client, message, args, sdb);
                } catch(error) {
                    if (commandName == '' || commandName == ';' || commandName == undefined || commandName == null) return ;
                    // 코드 확인 console.log(error);
                    const embed = new MessageEmbed()
                        .setColor('DARK_RED')
                        .setDescription(`\` ${commandName} \` 이라는 명령어를 찾을수 없습니다.`)
                        .setFooter(` ${prefix}help 를 입력해 명령어를 확인해 주세요.`);
                    message.channel.send(embed).then(m => msgdelete(m, deletetime));
                } finally {
                    return msgdelete(message, 150);
                }
            } else {
                var args = message.content.trim().split(/ +/g);
                var command = undefined;
                if (ttsid == message.channel.id) {
                    command = client.commands.get('tts');
                }
                if (musicquizid == message.channel.id) {
                    if (sdb.musicquiz.start.start == true) {
                        return await ansermsg(client, message, args, sdb);
                    } else {
                        command = client.commands.get('musicquiz');
                        msgdelete(message, 100);
                    }
                }
                if (command) return command.run(client, message, args, sdb, true);
            }
        }
    });
});

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}

const { reac } = require('./client/reaction');
client.on('messageReactionAdd', async (reaction, user) => {
    await reac(client, reaction, user);
});
