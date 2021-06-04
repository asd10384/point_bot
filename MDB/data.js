
require('dotenv').config();
const { User, Message } = require('discord.js');
const { Schema, model, models, connect } = require('mongoose');
connect(process.env.mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const out = {
    module: {
        server: module_server,
    },
    object: {
        server: {
            serverid: String,
            name: String,
            userid: String,
            username: String,
            pointname: String,
            point: Number,
        }
    },
};

module.exports = out;

function module_server() {
    var dataSchema = Schema(out.object.server);
    return models.point_server || model('point_server', dataSchema);
}
