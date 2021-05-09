
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../MDB/data');
const weeklist = ['일','월','화','수','목','금','토'];

module.exports = {
    format: {
        date: format_date,
        nowdate: now_date,
    },
    az,
};

function now_date(time = new Date) {
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var day = time.getDay();
    var hour = time.getHours()+Number(process.env.addhour)+17;
    var min = time.getMinutes();
    var sec = time.getSeconds();
    var week = weeklist[day];
    if (hour >= 24) {
        hour = hour - 24;
        day++;
        week = (day >= 6) ? weeklist[day-6] : weeklist[day];
    }
    var nowtime = {
        'year': year,
        'month': month,
        'day': day,
        'hour': hour,
        'min': min,
        'sec': sec,
        'week': week,
        'time': {
            '1': `${year}년 ${month}월 ${day}일 ${hour}시 ${min}분 ${sec}초`,
            '2': `${year}년 ${az(month, 2)}월 ${az(day, 2)}일 ${az(hour, 2)}시 ${az(min, 2)}분 ${az(sec, 2)}초`,
        },
    };
    return nowtime;
}
function format_date(date = new Date) {
    return new Intl.DateTimeFormat("ko-KR").format(date).slice(0,-1).split('. ');
}

function az(num = Number, digit = Number) {
    var zero = '';
    for (i=0; i<digit-num.toString().length; i++) {
        zero+='0';
    }
    return zero+num;
}
