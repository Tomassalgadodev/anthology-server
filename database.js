const mysql = require('mysql2');

const dbConfig = {
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'b33f2d4d88e223',
    password: '10bb9e42',
    database: 'heroku_e7210234ae5c71b'
};

let connection;

const handleDisconnect = () => {
    connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          setTimeout(handleDisconnect, 2000);
        } else {
          console.log('Connected to database successfully!');
        }
    });
    
    connection.on('error', (err) => {
        console.error('Database connection error:', err);
    
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          handleDisconnect();
        } else {
          throw err;
        }
    });
}

const db = connection.promise();

module.exports = {
    db,    
    handleDisconnect
} 

// mysql://b33f2d4d88e223:10bb9e42@us-cdbr-east-06.cleardb.net/heroku_e7210234ae5c71b?reconnect=true

// const database = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'guitar221',
//     database: 'no_skips_db'
// }).promise();