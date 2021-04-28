
require('dotenv').config();
const { User, Message } = require('discord.js');
const { Schema, model, connect } = require('mongoose');

connect(process.env.mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = {
    module: {
        user: module_user,
        server: module_server,
    },
    set: {
        user: set_user,
        server: set_server,
    },
    get: {
        server: get_server,
    },
};

function module_user() {
    const dataSchema = Schema({
        name: String,
        userID: String,
        tts: Boolean
    });
    return model('Mandl_user', dataSchema);
}
function module_server() {
    const dataSchema = Schema({
        serverid: String,
        channelid: String,
        voicechannelid: String,
        listid: String,
        npid: String,
        scoreid: String,
        ttsid: String,
        name: Array,
        vocal: Array,
        link: Array,
        count: Number,
        skip: Number,
        start: Boolean,
        tts: Boolean,
        role: Array,
        anser_list: Array,
        anser_time: Number,
        anser: Number
    });
    return model('Mandl_server', dataSchema);
}

async function set_user(user = new User) {
    const data = userdata(); //모듈
    const newdata = new data({
        name: user.username,
        userID: user.id,
        tts: true,
    });
    return newdata.save().catch(err => console.log(err));
}
async function set_server(message = new Message) {
    const data = serverdata(); //모듈
    const newdata = new data({
        serverid: message.guild.id,
        channelid: '',
        voicechannelid: '',
        listid: '',
        npid: '',
        scoreid: '',
        ttsid: '',
        name: [],
        vocal: [],
        link: [],
        count: 0,
        skip: 0,
        start: false,
        sthas: false,
        tts: true,
        role: [],
        anser_list: ['제목', '가수', '제목-가수', '가수-제목'],
        anser_time: 10,
        anser: 0
    });
    return newdata.save().catch(err => console.log(err));
}

async function get_server(message = new Message) {
    const data = serverdata(); //모듈
    data.findOne({
        serverid: message.guild.id
    }, async function (err, data) {
        if (err) console.log(err);
        if (!data) {
            await set.serverdata(message);
        }
        return true;
    });
}