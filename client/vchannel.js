
require('dotenv').config();
const { Client, MessageEmbed, Message, VoiceState, Channel } = require('discord.js');
const db = require('quick.db');
const MDB = require('../MDB/data');
const log = require('../log/log');
const sdata = MDB.module.server();
const mandl = MDB.module.mandl();

module.exports = {
    vchanneljoin,
    vchannelleave,
    vchanneldelete,
};

async function vchanneljoin (client = new Client, vc = new VoiceState) {
    await mandl.find({type: 'vchannel', guildid: vc.guild.id}).then(async (obj) => {
        for (i in obj) {
            var mdb = MDB.object.mandl;
            mdb = obj[i];
            
            if (mdb.vc[0].type === 'set' && mdb.id === vc.channelID) {
                vc.guild.channels.create(eval(process.env.AUTOVCHANNELNAME), {
                    type: 'voice',
                    parent: mdb.vc[0].cart,
                    userLimit: Number(mdb.vc[0].lim),
                    bitrate: 96000,
                }).catch((err) => {
                    log.errlog(err);
                    vc.member.voice.channel.leave();
                }).then(async (c) => {
                    new mandl({
                        type: 'vchannel',
                        id: c.id,
                        guildid: vc.guild.id,
                        vc: [{
                            type: 'make'
                        }]
                    }).save();
                    vc.member.voice.setChannel(c);
                });
                break;
            }
        }
    });
}
async function vchannelleave (client = new Client, vc = new VoiceState) {
    await mandl.find({type: 'vchannel', guildid: vc.guild.id}).then(async (obj) => {
        for (i in obj) {
            var mdb = MDB.object.mandl;
            mdb = obj[i];
            console.log(mdb);
            if (mdb.vc[0].type === 'make' && mdb.id === vc.channelID) {
                if (vc.channel.members.size <= 0) {
                    await mandl.findOneAndDelete({type: 'vchannel', guildid: vc.guild.id, id: vc.channelID});
                    vc.channel.delete();
                }
            }
        }
    });
}

async function vchanneldelete (client = new Client, ch = new Channel) {
    await mandl.find({type: 'vchannel', guildid: ch.guild.id}).then(async (obj) => {
        for (i in obj) {
            var mdb = MDB.object.mandl;
            mdb = obj[i];

            if (mdb.id === ch.id) {
                await mandl.findOneAndDelete({type: 'vchannel', guildid: ch.guild.id, id: ch.id});
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
