
const { Message } = require('discord.js');
const { appendFileSync } = require('fs');
const mds = require('../module/mds');

module.exports = {
    readylog,
    botlog,
    quizlog,
    sitelog,
    errlog,
};

async function readylog(text = '', date = new Date()) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(date);
    text = `${year}년${month}월${day}일 ${week}요일 ${mds.az(hour, 2)}:${mds.az(min, 2)}:${mds.az(sec, 2)}\n${text}\n\n`;
    console.log(text);
    appendFileSync(`log/bot.txt`, text, {encoding: 'utf8'});
}
async function botlog(message = new Message, text = '', date = new Date) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(date);
    text = `${message.guild.name} 서버\n${year}년${month}월${day}일 ${week}요일 ${mds.az(hour)}:${mds.az(min)}:${mds.az(sec)}\n${text}\n\n`;
    console.log(text);
    appendFileSync(`log/bot.txt`, text, {encoding: 'utf8'});
}

async function quizlog(message = new Message, text = '', date = new Date) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(date);
    text = `${message.guild.name} 서버\n${year}년${month}월${day}일 ${week}요일 ${mds.az(hour)}:${mds.az(min)}:${mds.az(sec)}\n${text}\n`;
    console.log(text);
    appendFileSync(`log/quiz.txt`, text, {encoding: 'utf8'});
}

async function sitelog(text = '', date = new Date) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(date);
    text = `${year}년${month}월${day}일 ${week}요일 ${mds.az(hour)}:${mds.az(min)}:${mds.az(sec)}\n${text}\n\n`;
    console.log(text);
    appendFileSync(`log/site.txt`, text, {encoding: 'utf8'});
}

async function selfchecklog(text = '', date = new Date) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(date);
    text = `${year}년${month}월${day}일 ${week}요일 ${mds.az(hour)}:${mds.az(min)}:${mds.az(sec)}\n${text}\n\n`;
    console.log(text);
    appendFileSync(`log/selfcheck.txt`, text, {encoding: 'utf8'});
}

async function errlog(err) {
    var { year, month, day, week, hour, min, sec } = mds.format.nowdate(new Date);
    text = `${year}년${month}월${day}일 ${week}요일 ${mds.az(hour)}:${mds.az(min)}:${mds.az(sec)}\n${err}\n\n`;
    console.log(err);
    appendFileSync(`log/err.txt`, text, {encoding: 'utf8'});
}
