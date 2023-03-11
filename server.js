const { response } = require('express');
const express = require('express');
const app = express();

// import {scrapeSearchArtist} from './scrapers';

app.set('port', process.env.PORT || 3000);
app.locals.title = 'No Skips';

app.get('/', (request, response) => {
  response.send('Oh hey No Skips');
});

app.get('/api/v1/artists/:searchTerm', (request, response) => {
    // const artists = scrapeSearchArtist(request.params.searchTerm);

    // console.log(artists);

    response.json({
        searchTerm: request.params.searchTerm
    })
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});