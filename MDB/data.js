
require('dotenv').config();
const { User, Message } = require('discord.js');
const { Schema, model, models, connect } = require('mongoose');
const map = new Map();
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
};

function module_user() {
    var dataSchema = Schema({
        name: String,
        userID: String,
        tts: Boolean
    });
    return models.Mandl_user || model('Mandl_user', dataSchema);
}
function module_server() {
    var dataSchema = Schema({
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
    return models.Mandl_server || model('Mandl_server', dataSchema);
}

async function set_user(user = new User) {
    var data = module_user(); //모듈
    const newdata = new data({
        name: user.username,
        userID: user.id,
        tts: true,
    });
    return newdata.save().catch(err => console.log(err));
}
async function set_server(message = new Message) {
    var data = module_server(); //모듈
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
