const { response, request } = require('express');
const express = require('express');
const cors = require('cors');
const scrapers = require('./scrapers');
const db = require('./database');
const uuid = require('uuid').v4;
const app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    next();
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.set('port', process.env.PORT || 8000);
app.locals.title = 'No Skips';

app.get('/', (request, response) => {
  response.send('Oh hey No Skips');
});

app.get('/api/v1/artistSearch/:searchTerm', async (request, response) => {
   
    const artists = await scrapers.scrapeSearchArtist(request.params.searchTerm);

    response.json({
        artists: artists
    });
});

app.get('/api/v1/artist/:artistID', async (request, response) => {

    const artistInfo = await scrapers.scrapeGetArtist(request.params.artistID);

    response.json({
        artistInfo: artistInfo
    });
});

app.get('/api/v1/users', async (req, res) => {
    const users = await db.query('SELECT * FROM users');
    res.send(users[0]);
});

app.get('/api/v1/userdata', async (req, res) => {

    console.log('cookie:', req.headers.cookie);
    if(req.headers.cookie) {
        const sessionID = req.headers.cookie.substring(8);
        let username = await db.query(
            `SELECT username FROM cookies
            WHERE cookie = ?`,
            [sessionID]
        )
    
        if (username[0].length === 1) {
            username = username[0][0].username;
            const userdata = await db.query(
                'SELECT * FROM user_data WHERE username = ?',
                [username]
            )
            res.send(userdata[0][0]); 
        } else {
            res.status(401).send({ msg: 'Not logged in' });
        }
    }  else {
        res.status(401).send({ msg: 'Not logged in' });
    }

});

app.post('/api/v1/users', async (req, res) => {
    const { username, password, firstname, lastname, email } = req.body;
    
    if (username && password && firstname && lastname && email) {

        const userWithUsername = await db.query(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        )

        if (userWithUsername[0].length === 0) {
            try {
                db.query(
                    'INSERT INTO users(username, password, first_name, last_name, email) VALUES(?, ?, ?, ?, ?)',
                    [username, password, firstname, lastname, email]
                );
                res.status(201).send({ msg: 'Created User' });
            } catch (err) {
                console.log(err);
            }
        } else {
            res.send({ msg: 'That username already exists' });
        }
    } else {
        res.send({ msg: 'Fill out all fields' });
    }
});

app.post('/api/v1/login', async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {

        const user = await db.query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        )

        if (user[0].length === 1) {

            const sessionID = uuid();
            const username = user[0][0].username
            res.set('Set-Cookie', `session=${sessionID}`);
            db.query('INSERT INTO cookies(cookie, username) VALUES(?, ?)', [sessionID, username]);
            res.status(201).send({ msg: 'Success', user: user[0][0] });

        } else {

            res.status(401).send({ msg: 'Wrong combination' });

        }

    } else {

        res.send({ msg: 'Input a username and password' });

    }
});

app.post('/api/v1/logout', async (req, res) => {
    
    if (req.headers.cookie) {
        // const sessionID = req.headers.cookie.substring(8);

        // const deleted = await db.query(
        //     'DELETE FROM cookies WHERE cookie = ?', 
        //     [sessionID],
        // );

        res.set('Set-Cookie', 'session=; expires=Thu, 01 Jan 1970 00:00:00 GMT');
        
        res.send({ msg: 'success' });
    } else {
        res.send({ msg: 'No ones logged in' });
    }

});



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
