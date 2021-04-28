
require('dotenv').config();
const fs = require('fs');

module.exports = {
    getkeyfile,
};
function getkeyfile() {
    var option = {
        "type": process.env.type,
        "project_id": process.env.project_id,
        "private_key_id": process.env.private_key_id,
        "private_key": process.env.private_key.replace(/\\n/gm,'\n'),
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.auth_provider_x509_cert_url
    };
    fs.writeFileSync(`googlettsapi.json`, JSON.stringify(option).replace(/\{/g,'{\n').replace(/\}/g,'\n}').replace(/\,/g, ',\n'));
}
