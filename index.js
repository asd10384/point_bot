
require('dotenv').config();
const { Client, Collection, MessageEmbed, Message, User } = require('discord.js');
const client = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER']});
const { readdirSync } = require('fs');
const { join } = require('path');
const db = require('quick.db');

// env
const dfprefix = process.env.prefix;
const deletetime = Number(process.env.deletetime) || 6000;

// DB
const mdb = require('./MDB/data');
const sdata = mdb.module.server();
const udata = mdb.module.user();

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

// client login
client.login(process.env.token);

// client on
client.on('ready', async () => {
    var db_text = '';
    try {
        var db_key_list = Object.keys(db.all()[0]['data']);
        for (i in db_key_list) {
            db_text += `\n       \`${i+1}. ${db_key_list[i]} \``;
            for (j=0; j<Object.keys(db.all()[0]['data'][db_key_list[i]]).length; j++) {
                var db_user_id = Object.keys(db.all()[0]['data'][db_key_list[i]])[j];
                db_text += `\n       ${db_user_id}　:　`;
                db_text += `${Object.values(db.all()[0]['data'][db_key_list[i]])[j]}\n`;
            }
        }
    } catch(err) {
        db_text = '\n       없음\n';
    }
    console.log(`

        =========================
          이름 : ${client.user.username}
        
          태그 : ${client.user.tag}
        ==========================

    `);
    console.log('       ====================');
    console.log(db_text);
    console.log('       ====================\n');

    client.user.setPresence({
        activity: {
            name: `${dfprefix}help`,
            type: 'WATCHING'
        },
        status: 'online'
    });
});

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

    // 채팅 채널 연결
    var ttsid = sdata.ttsid;
    if (ttsid == null || ttsid == undefined) {
        ttsid = '0';
    }
    var musicquizid = sdata.channelid;
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
            await command.run(client, message, args);
        } catch(error) {
            if (commandName == '' || commandName == ';' || commandName == undefined || commandName == null) return ;
            console.log(error);
            const embed = new MessageEmbed()
                .setColor('DARK_RED')
                .setDescription(`\` ${commandName} \` 이라는 명령어를 찾을수 없습니다.`)
                .setFooter(` ${prefix}help 를 입력해 명령어를 확인해 주세요.`);
            message.channel.send(embed).then(m => msgdelete(m, deletetime));
        } finally {
            return msgdelete(message, 300);
        }
    } else {
        var args = message.content.trim().split(/ +/g);
        var command;
        if (ttsid == message.channel.id) {
            command = client.commands.get('tts');
        }
        if (musicquizid == message.channel.id) {
            if (sdata.start == true) {
                command = client.commands.get('musicanser');
            } else {
                command = client.commands.get('musicquiz');
                msgdelete(message, 500);
            }
        }
        return command.run(client, message, args);
    }
});

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}

client.on('messageReactionAdd', async (reaction, user) => {
    await creaction(client, reaction, user);
});
