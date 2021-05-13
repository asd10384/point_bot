
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const request = require('request');
const sdata = MDB.module.server();

module.exports = {
    render,
    patchnote,
};

async function render(req, res, ejs = '', data = {}) {
    return res.status(200).render(ejs, {
        domain: process.env.DOMAIN,
        ejs: ejs,
        data: data
    });
}

async function patchnote(req, res) {
    const p = req.query;
    request(`${process.env.DOMAIN}/patchnote.js`, async function(err, resjs, body) {
        if (err) return render(req, res, `err`);
        var note = eval(body)[0];
        var nl_y = Object.keys(note);
        var text = '';
        if (nl_y.includes(p.year)) {
            var nl_m = Object.keys(note[p.year]);
            if (nl_m.includes(p.month)) {
                var nl_d = Object.keys(note[p.year][p.month]);
                if (p.day) {
                    text = (note[p.year][p.month][p.day]) ? note[p.year][p.month][p.day].join('<br/>') : `찾을수 없음`;
                    return render(req, res, `patchnote`, {
                        title: `패치노트 - ${p.year}.${p.month}.${p.day}`,
                        text: text
                    });
                }
                for (i of nl_d) {
                    text += `<button class="btn" onclick="location.href='/patchnote?year=${p.year}&month=${p.month}&day=${i}'">${i}일</button>`;
                }
                return render(req, res, `patchnote`, {
                    title: `패치노트 - ${p.year}.${p.month}`,
                    text: text
                });
            }
            for (i of nl_m) {
                text += `<button class="btn" onclick="location.href='/patchnote?year=${p.year}&month=${i}'">${i}월</button>`;
            }
            return render(req, res, `patchnote`, {
                title: `패치노트 - ${p.year}`,
                text: text
            });
        }
        for (i of nl_y) {
            text += `<button class="btn" onclick="location.href='/patchnote?year=${i}'">${i}년</button>`;
        }
        return render(req, res, `patchnote`, {
            title: `패치노트`,
            text: text
        });
    });
    return;
}
