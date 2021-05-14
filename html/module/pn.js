
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const request = require('request');
const sdata = MDB.module.server();
const pdata = MDB.module.patchnote();

const mdl = require('./mdl');

module.exports = {
    patchnote,
    patchnote_get,
    patchnote_write,
    patchnote_check,
};

async function patchnote(req, res, note = '', notetext = '', login = false) {
    var pdb = MDB.object.patchnote;
    if (note) {
        pdata.find(async function(err, pdblist) {
            var text = '';
            for (db1 of pdblist) {
                pdb = db1;
                if (pdb.type === note) {
                    var date = `${pdb.year}-${pdb.month}-${pdb.day}`;
                    text += `<button class="btn" onclick="location.href='/patchnote/${note}/${date}'">${date}</button><br/>`;
                }
            }
            return mdl.render(req, res, `patchnote`, {
                title: `패치노트 - ${notetext}`,
                note: note,
                notetext: notetext,
                text: text,
                file: null,
                login: login
            });
        });
        return;
    }
    return res.send(`
        <script 'type=text/javascript'>
            alert('패치노트를 찾을수 없습니다.');
            window.location='/patchnote';
        </script>
    `);
}
async function patchnote_get(req, res, note = '', notetext = '', date = '', login = false) {
    var pdb = MDB.object.patchnote;
    if (note) {
        pdata.find(async function(err, pdblist) {
            var text = null;
            for (db1 of pdblist) {
                pdb = db1;
                if (pdb.type === note && `${pdb.year}-${pdb.month}-${pdb.day}` === date) {
                    text = pdb.text.toString().replace(/\,/g, '<br/>');
                }
            }
            if (text) return mdl.render(req, res, `patchnote`, {
                title: `패치노트 - ${notetext}`,
                note: note,
                notetext: notetext,
                text: text,
                file: date
            });
        });
    }
}
async function patchnote_write(req, res, note = '', notelist = [], date, text = '') {
    if (notelist[note]) {
        var sdate = date.split('-');
        new pdata({
            type: note,
            year: sdate[0],
            month: sdate[1],
            day: sdate[2],
            text: text
        }).save().catch(err => console.log(err));
    }
    return res.send(`
        <script 'type=text/javascript'>
            alert('글쓰기 성공');
            window.location='/patchnote/${note}/${date}';
        </script>
    `);
}
async function patchnote_check(req, res, note = '', notelist = [], date, text, edit) {
    var pdb = MDB.object.patchnote;
    pdata.find(async function(err, pdblist) {
        for (db1 of pdblist) {
            pdb = db1;
            if (pdb.type === note && `${pdb.year}-${pdb.month}-${pdb.day}` === date) {
                if (edit) {
                    pdb.text = text;
                    pdb.save().catch(err => console.log(err));
                    return res.send(`
                        <script 'type=text/javascript'>
                            alert('수정 성공');
                            window.location='/patchnote/${note}/${date}';
                        </script>
                    `);
                }
                return res.send(`
                    <script 'type=text/javascript'>
                        alert('이미 패치노트가 있습니다.');
                        window.location='/patchnote/${note}';
                    </script>
                `);
            }
        }
        return patchnote_write(req, res, note, notelist, date, text);
    });
}
