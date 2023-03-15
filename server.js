const { response, request } = require('express');
const express = require('express');
const app = express();
const db = require('./database');

app.use(express.json());

const scrapers = require('./scrapers');
const cors = require('cors');
app.use(cors());

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

app.post('/api/v1/users', async (req, res) => {
    const { username, password } = req.body;

    
    if (username && password) {
        const userExists = await db.query(
            `SELECT *
            FROM users
            WHERE username = ?`,
            [username]
        )
        if (userExists[0].length === 0) {
            try {
                db.query(
                    `INSERT INTO users(username, password) VALUES(?, ?)`,
                    [username, password]
                );
                res.status(201).send({ msg: 'Created User' });
            } catch (err) {
                console.log(1, err);
            }
        } else {
            res.send('That username already exists')
        }
    } else {
        res.send('Input a username and password');
    }
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});

