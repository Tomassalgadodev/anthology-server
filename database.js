const mysql = require('mysql2');

const database = mysql.createConnection({
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'b8c2ed6a2e4d43',
    password: 'c8f89cdd',
    database: 'heroku_76cbec24ca88224'
}).promise();

module.exports = database;

// mysql://b8c2ed6a2e4d43:c8f89cdd@us-cdbr-east-06.cleardb.net/heroku_76cbec24ca88224?reconnect=true

// const database = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'guitar221',
//     database: 'no_skips_db'
// }).promise();