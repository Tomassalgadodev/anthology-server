const { response, request } = require('express');
const express = require('express');
const cors = require('cors');
const scrapers = require('./scrapers');
const db = require('./database');
const uuid = require('uuid').v4;
const app = express();

app.use((req, res, next) => {
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

// OLD

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

// NEW

app.get('/api/v1/artistSearchData/:searchTerm', async (request, response) => {
   
    const artistSearchData = await scrapers.scrapeSearchArtistDirect(request.params.searchTerm);

    response.json(artistSearchData);
});

app.get('/api/v1/artistData/:artistID', async (request, response) => {
    
    const artistData = await scrapers.scrapeGetArtistDirect(request.params.artistID);

    response.json(artistData);
});

app.get('/api/v1/users', async (req, res) => {
    const users = await db.query('SELECT * FROM users');
    res.send(users[0]);
});

app.get('/api/v1/user', async (req, res) => {

    // console.log('cookie:', req.headers.cookie);
    if(req.headers.cookie) {
        const sessionID = req.headers.cookie.substring(8);
        let username = await db.query(
            `SELECT username FROM cookies
            WHERE cookie = ?`,
            [sessionID]
        )
    
        if (username[0].length === 1) {
            username = username[0][0].username;
            const user = await db.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            )
            res.send(user[0][0]); 
        } else {
            res.status(401).send({ msg: 'Not logged in' });
        }
    }  else {
        res.status(401).send({ msg: 'Not logged in' });
    }
});

app.get('/api/v1/userdata', async (req, res) => {

    // console.log('cookie:', req.headers.cookie);
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

app.get('/api/v1/savedAlbums', async (req, res) => {

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
                'SELECT albums FROM user_data WHERE username = ?',
                [username]
            )
            res.status(200).send(userdata[0][0].albums); 
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
            res.status(409).send({ msg: 'That username already exists' });
        }
    } else {
        res.status(422).send({ msg: 'Fill out all fields' });
    }
});

app.post('/api/v1/login', async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {

        const user = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        )

        
        if (user[0].length === 1) {
            
            if (user[0][0].password !== password) {
                res.status(401).send({ msg: 'Wrong password' });
                return;
            }

            const sessionID = uuid();
            const username = user[0][0].username
            res.set('Set-Cookie', `session=${sessionID}`);
            db.query('INSERT INTO cookies(cookie, username) VALUES(?, ?)', [sessionID, username]);
            res.status(201).send({ msg: 'Success', user: user[0][0] });

        } else {

            res.status(404).send({ msg: `User doesn't exist` });

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

app.post('/api/v1/addSavedAlbum', async (req, res) => {

    const { albumArt, albumTitle, artistID, artistName, link, yearReleased } = req.body;

    if (!albumArt || !albumTitle || !artistID || !artistName || !link || !yearReleased) {
        res.status(422).send({ msg: 'Missing album data' })
    }
    
    if(req.headers.cookie) {
        const sessionID = req.headers.cookie.substring(8);
        let username = await db.query(
            `SELECT username FROM cookies
            WHERE cookie = ?`,
            [sessionID]
        )
    
        if (username[0].length === 1) {
            username = username[0][0].username;
            const attemptAddAlbum = await db.query(
                `UPDATE user_data 
                SET albums = JSON_ARRAY_APPEND(albums, '$', JSON_OBJECT('albumArt', ?, 'albumTitle', ?, 'artistID', ?, 'artistName', ?, 'link', ?, 'yearReleased', ?))
                WHERE username = ? AND JSON_SEARCH(albums, 'one', ?, NULL, '$[*]."link"') IS NULL;`,
                [albumArt, albumTitle, artistID, artistName, link, yearReleased, username, link]
            )
            
            if (attemptAddAlbum[0].changedRows > 0) {
                res.status(201).send({ msg: `Success! ${attemptAddAlbum[0].changedRows} row(s) changed` }); 
            } else {
                res.status(201).send({ msg: 'Album already liked' }); 
            }

        } else {
            res.status(401).send({ msg: 'Not logged in' });
        }
    }  else {
        res.status(401).send({ msg: 'Not logged in' });
    }
});

app.post('/api/v1/removeSavedAlbum', async (req, res) => {
    
    const { link } = req.body;

    if (!link) {
        res.status(422).send({ msg: 'Must provide a link' })
    }
    
    if(req.headers.cookie) {
        const sessionID = req.headers.cookie.substring(8);
        let username = await db.query(
            `SELECT username FROM cookies
            WHERE cookie = ?`,
            [sessionID]
        )
    
        if (username[0].length === 1) {
            username = username[0][0].username;
            const attemptDeleteAlbum = await db.query(
                `UPDATE user_data 
                SET albums = JSON_REMOVE(albums, REPLACE(REPLACE(JSON_SEARCH(albums, 'one', ?, NULL, '$[*]."link"'), '"', ''), '.link', ''))
                WHERE username = ? AND JSON_SEARCH(albums, 'one', ?, NULL, '$[*]."link"') IS NOT NULL;`,
                [link, username, link]
            )
            if (attemptDeleteAlbum[0].changedRows > 0) {
                res.status(201).send({ msg: `Success!` }); 
            } else {
                res.status(201).send({ msg: `Album not liked by user` }); 
            }
        } else {
            res.status(401).send({ msg: 'Not logged in' });
        }
    }  else {
        res.status(401).send({ msg: 'Not logged in' });
    }
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
