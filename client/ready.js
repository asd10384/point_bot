
require('dotenv').config();
const db = require('quick.db');
const { Client } = require('discord.js');

const dfprefix = process.env.prefix;

module.exports = async function (client = new Client) {
    client.on('ready', async () => {
        var db_text = '';
        try {
            var w = db.fetch(`db`);
            for (i in w) {
                db_text += `\n${i}: {\n`;
                for (j in w[i]) {
                    if (String(w[i][j]) === '[object Object]') {
                        db_text += `    ${j}: {\n`;
                    } else {
                        db_text += `    ${j}: ${w[i][j]}\n`;
                    }
                    for (k in w[i][j]) {
                        db_text += `        ${k}: ${w[i][j][k]}\n`;
                    }
                    if (String(w[i][j]) === '[object Object]') db_text += `    }\n`;
                }
                db_text += `}\n`;
            }
        } catch(err) {
            db_text = '\n없음\n';
        }
        console.log(`

===============================
 이름 : ${client.user.username}

 태그 : ${client.user.tag}
===============================

        `);
        console.log('===============================');
        console.log((db_text === '') ? '\n없음\n' : db_text);
        console.log('===============================\n');

        client.user.setPresence({
            activity: {
                name: `${dfprefix}help`,
                type: 'WATCHING'
            },
            status: 'online'
        });
        activity(client);
    });
}

function activity(client = new Client) {
    var i = 0;
    var list = eval(process.env.activity);
    setInterval(function() {
        list = eval(process.env.activity);
        client.user.setPresence({
            activity: {
                name: list[i].name,
                type: list[i].type,
            },
            status: list[i].status,
        });
        i++;
        if (i >= list.length) i = 0;
    }, list[i].time * 1000);
}
