
const snobj = [
    {
        name: [
            'test',
            '테스트'
        ],
        url: '찬구/테스트'
    },
    {
        name: [
            'ㅋㅋ루삥뽕',
            'ㅋㅋ뤀삥뽕',
            '쿠쿠뤀삥뽕',
            '쿠쿠루삥뽕'
        ],
        url: '찬구/ㅋㅋ뤀삥뽕'
    }
];
var sncheckobj = {};
for (i in snobj) {
    var obj = snobj[i];
    for (j in obj.name) {
        sncheckobj[obj.name[j]] = obj.url;
    }
}

module.exports = sncheckobj;
