
require('dotenv').config();
const { User, Message } = require('discord.js');
const { Schema, model, models, connect } = require('mongoose');
const map = new Map();
connect(process.env.mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const out = {
    module: {
        user: module_user,
        server: module_server,
    },
    set: {
        user: set_user,
        server: set_server,
    },
    object: {
        user: {
            name: String,
            userID: String,
            tts: Boolean,
            selfcheck: {
                area: String,
                school: String,
                name: String,
                birthday: String,
                password: String,
            },
        },
        server: {
            serverid: String,
            quiz: {
                qzchannelid: String,
                vcid: String,
                user: {
                    hint: Array,
                    skip: Array,
                    score: Object,
                },
                anser: {
                    list: Array,
                    anser: Number,
                    time: Number,
                    imgtime: Number,
                },
                msg: {
                    listid: String,
                    npid: String,
                    scoreid: String,
                },
                quiz: {
                    format: String,
                    name: Array,
                    vocal: Array,
                    link: Array,
                    count: Number,
                    skipcount: Number,
                },
                start: {
                    start: Boolean,
                    embed: Boolean,
                    user: Boolean,
                    hint: Boolean,
                },
                page: {
                    click: Number,
                    now: Number,
                    p1: Number,
                    p2: Number,
                    p3: Number,
                    p4: Number,
                    slide: Number,
                },
            },
            tts: {
                ttschannelid: String,
                tts: Boolean,
            },
            selfcheck: {
                channelid: String,
                autocheck: Array,
            },
            role: Array,
        },
    },
};

module.exports = out;

function module_user() {
    var dataSchema = Schema(out.object.user);
    return models.Mandl_user || model('Mandl_user', dataSchema);
}
function module_server() {
    var dataSchema = Schema(out.object.server);
    return models.Mandl_server || model('Mandl_server', dataSchema);
}

async function set_user(user = new User) {
    var data = module_user(); //모듈
    const newdata = new data({
        name: user.username,
        userID: user.id,
        tts: true,
        selfcheck: {
            area: '',
            school: '',
            name: '',
            birthday: '',
            password: '',
        },
    });
    return newdata.save().catch(err => console.log(err));
}
async function set_server(message = new Message) {
    var data = module_server(); //모듈
    const newdata = new data({
        serverid: message.guild.id,
        quiz: {
            qzchannelid: '',
            vcid: '',
            user: {
                hint: [],
                skip: [],
                score: {},
            },
            anser: {
                list: ['제목', '가수', '제목-가수', '가수-제목'],
                anser: 0,
                time: 10,
                imgtime: 60,
            },
            msg: {
                listid: '',
                npid: '',
                scoreid: '',
            },
            quiz: {
                format: '음악퀴즈',
                name: [],
                vocal: [],
                link: [],
                count: 0,
                skipcount: 0,
            },
            start: {
                start: false,
                embed: false,
                user: false,
                hint: false,
            },
            page: {
                click: 0,
                now: 0,
                p1: 0,
                p2: 0,
                p3: 0,
                p4: 0,
                slide: 0,
            },
        },
        selfcheck: {
            channelid: '',
            autocheck: [],
        },
        tts: {
            ttschannelid: '',
            tts: true,
        },
    });
    return newdata.save().catch(err => console.log(err));
}
