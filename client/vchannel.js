
require('dotenv').config();
const { Client, MessageEmbed, Message, VoiceState } = require('discord.js');
const db = require('quick.db');
const MDB = require('../MDB/data');
const log = require('../log/log');
const sdata = MDB.module.server();

module.exports = {
    vchanneljoin,
    vchannelleave,
};

async function vchanneljoin (client = new Client, vc = new VoiceState) {
    await sdata.findOne({
        serverid: vc.guild.id
    }, async (err, db1) => {
        var sdb = MDB.object.server;
        sdb = db1;
        if (err) log.errlog(err);
        if (!sdb) {
            await MDB.set.server(vc.channel);
            return await vchanneljoin(client, vc);
        } else {
            for (i in sdb.autovch.set) {
                if (sdb.autovch.set[i]['vc'] === vc.channelID) {
                    vc.guild.channels.create(`${vc.member.user.username} - 음성채널`, {
                        type: 'voice',
                        parent: sdb.autovch.set[i]['cart'],
                        userLimit: sdb.autovch.set[i]['lim'],
                        bitrate: 96000,
                    }).catch((err) => {
                        log.errlog(err);
                        vc.member.voice.channel.leave();
                    }).then(async (c) => {
                        sdb.autovch.make.push(c.id);
                        sdb.save().catch((err) => log.errlog(err));
                        vc.member.voice.setChannel(c);
                    });
                }
            }
        }
    });
}
async function vchannelleave (client = new Client, vc = new VoiceState) {
    await sdata.findOne({
        serverid: vc.guild.id
    }, async (err, db1) => {
        var sdb = MDB.object.server;
        sdb = db1;
        if (err) log.errlog(err);
        if (!sdb) {
            await MDB.set.server(vc.channel);
            return await vchanneljoin(client, vc);
        } else {
            if (sdb.autovch.make.includes(vc.channelID)) {
                if (vc.channel.members.size <= 0) {
                    sdb.autovch.make.pop(sdb.autovch.make.indexOf(vc.channelID));
                    sdb.save().catch((err) => log.errlog(err));
                    vc.channel.delete();
                }
            }
        }
    });
}


function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
