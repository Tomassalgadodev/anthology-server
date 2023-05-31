const mysql = require('mysql2');

const database = mysql.createConnection({
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'b33f2d4d88e223',
    password: '10bb9e42',
    database: 'heroku_e7210234ae5c71b'
}).promise();

module.exports = database;

// mysql://b33f2d4d88e223:10bb9e42@us-cdbr-east-06.cleardb.net/heroku_e7210234ae5c71b?reconnect=true

// const database = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'guitar221',
//     database: 'no_skips_db'
// }).promise();