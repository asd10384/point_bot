
require('dotenv').config();
const db = require('quick.db');
const { Client } = require('discord.js');

const dfprefix = process.env.prefix;

module.exports = async function (client = new Client) {
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
        
        activity(client, [
            {
                name: `${dfprefix}help`,
                type: 'WATCHING',
                time: 10000,
            },
            {
                name: `${dfprefix}도움말`,
                type: 'WATCHING', // PLAYING
                time: 10000,
            },
        ]);
    });
}

function activity(client = new Client, list = Array) {
    var i = 0;
    setInterval(() => {
        client.user.setPresence({
            activity: {
                name: list[i].name,
                type: list[i].type,
            },
            status: 'online',
        });
        i++;
        if (i >= list.length) i = 0;
    }, list[i].time);
}