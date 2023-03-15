const mysql = require('mysql2');

const database = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'guitar221',
    database: 'no_skips_db'
}).promise();

module.exports = database;