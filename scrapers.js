const puppeteer = require('puppeteer');

// Screen cap webpage:

    // await page.screenshot({
    //     path: './screenshot.png',
    //     fullPage: true,
    //     });

// Scraping Functions:

async function scrapeSearchArtist(artist) {

    const start = Date.now();

    const url = `https://open.spotify.com/search/${artist}/artists`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {"waitUntil" : "networkidle0"});

    const searchResults = await page.$$('.LunqxlFIupJw_Dkx6mNx');

    if (!searchResults.length) {
        browser.close();
        console.log('This search is too specific');
        return;
    }
    
    let numberToDisplay;
    searchResults.length < 10 ? numberToDisplay = searchResults.length + 1 : numberToDisplay = 11;
    const artists = []

    for (i = 1; i < numberToDisplay; i++) {
        let [el] = await page.$x(`//*[@id="searchPage"]/div/div/div/div[1]/div[${i}]/div/div[1]/div[1]/div/img`);
        let src;
        let img;

        if (el) {
            src = await el.getProperty('src');
            img = await src.jsonValue();
        } else {
            img = 'No Image';
        }
        
        let [el2] = await page.$x(`//*[@id="searchPage"]/div/div/div/div[1]/div[${i}]/div/div[2]/a/div`);
        let txt = await el2.getProperty('textContent');
        let artistName = await txt.jsonValue();
    
        let [el3] = await page.$x(`//*[@id="searchPage"]/div/div/div/div[1]/div[${i}]/div/div[2]/a`);
        let href = await el3.getProperty('href');
        let link = await href.jsonValue();

        artists.push({
            artistImage: img,
            artistName: artistName,
            artistLink: link
        });
    }

    // console.log(artists);
    console.log(`Total time: ${Date.now() - start} milliseconds`);
    browser.close();
    return artists;
}

async function scrapeGetAlbums(url) {
    url = `${url}/discography`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {"waitUntil" : "networkidle0"});

    const albums = await page.$$('.fEvxx8vl3zTNWsuC8lpx');
    const albumInfo = [];

    for(let i = 0; i < albums.length; i++) {
        let [el] = await page.$x(`//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[${(i + 1) * 2}]/div[1]/img`);
        let src = await el.getProperty('src');
        let img = await src.jsonValue();

        let [el2] = await page.$x(`//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[${(i + 1) * 2}]/div[2]/span/a`);
        let txt = await el2.getProperty('textContent');
        let albumTitle = await txt.jsonValue();
        let href = await el2.getProperty('href');
        let link = await href.jsonValue();

        let [el3] = await page.$x(`//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[${(i + 1) * 2}]/div[2]/div[2]/span[2]`);
        let txt2 = await el3.getProperty('textContent');
        let yearReleased = await txt2.jsonValue();

        albumInfo.push({
            albumTitle: albumTitle,
            albumArt: img,
            yearReleased: yearReleased,
            link: link
        });
    }

    browser.close();
    return albumInfo;
}

async function scrapeGetArtist(artistID) {
    const url = `https://open.spotify.com/artist/${artistID}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {"waitUntil" : "networkidle0"});

    let [errEl] = await page.$x('/html/body/div/div[2]/h1');

    if (errEl) {
        let errorMessageTxt = await errEl.getProperty('textContent');
        let errorMessage = await errorMessageTxt.jsonValue();
        if (errorMessage === 'Page not found') {
            return { errorMsg: `Artist doesn't exist` }
        }
    }

    let [el] = await page.$x('//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[1]/div[2]/span[2]/h1');
    let artistImage;
    let el2;
    
    if (!el) {
        [el] = await page.$x('//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[1]/div[5]/span[2]/h1');
        [el2] = await page.$x('//*[@id="main"]/div/div[2]/div[3]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[1]/div[4]/div/img');
        // if (!el2) {
        //     artistImage = 'No Image';
        // } else {
            const src = await el2.getProperty('src');
            artistImage = await src.jsonValue();
        // }
    } else {
        artistImage = await page.evaluate('document.querySelector(".MyW8tKEekj9lKQsviDdP").getAttribute("style")');
    }

    if (!el) {
        return { errorMsg: `Not verified` }
    }

    const txt = await el.getProperty('textContent');
    const artistName = await txt.jsonValue();

    const albumURL = `https://open.spotify.com/artist/${artistID}`;

    const albums = await scrapeGetAlbums(albumURL);

    const artistInfo = { artistName: artistName, artistImage: artistImage, albums: albums }
    // console.log(artistInfo);
    browser.close();
    return artistInfo;

}

async function scrapeSearchArtist2(artist) {
    const url = `https://www.allmusic.com/search/artists/${artist}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    const [el] = await page.$x('//*[@id="cmn_wrap"]/div/div[2]/div/ul/li[1]/div[2]/div[1]/a');
    const txt = await el.getProperty('textContent');
    const artistName = await txt.jsonValue();

    console.log(artistName);

    browser.close();
}

async function scrapeSearchArtist3(artist) {

    const start = Date.now();

    const artistUrl = `https://open.spotify.com/search/${artist}/artists`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    // let i = 0;
    // let j = 0;
    // let k = 0;

    page.on('request', async (request) => {
        const url = request.url();
    
        if (
            url.includes('https://open.spotifycdn.com/cdn/build/web-player/web-player.713d3e01.css') ||
            url.includes('https://open.spotifycdn.com/cdn/build/web-player/vendor~web-player.65779e3d.css') ||
            url.includes('https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchPlaylistMetadata&variables')
            ) {
            // console.log(i);
            // i++;
            // console.log(url);
            request.abort();
        } else {
            if (url.includes(artist) || url.includes('https://open.spotifycdn.com/cdn/build/web-player')) {
                // console.log('BINGO ' + j);
                // j++;
                // console.log(url);
                request.continue();
            } else {
                // console.log(i);
                // i++;
                // console.log(url);
                request.abort();
            }
        }
    

    });

    page.on('response', async(response) => {
        const request = response.request();
        
        if (request.url().includes('https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchArtists') && request.method() === 'GET') {
            const data = await response.json();
            console.log(data.data.searchV2.artists.items);
            return data;
        }
    })

    await page.goto(artistUrl, {"waitUntil" : "networkidle0"});

    console.log(`Total time: ${Date.now() - start} milliseconds`);
    browser.close();
}

// Function Calls:

    // scrapeSearchArtist('kublai');
    scrapeSearchArtist3('kublai');
    // scrapeGetAlbums('https://open.spotify.com/artist/5BIOo2mCAokFcLHXO2Llb4');
    // scrapeGetArtist('3LZZPxNDGDFVSIPqf4JuEf');
    // scrapeSearchArtist2('joker');

    module.exports = {
        scrapeSearchArtist,
        scrapeGetAlbums,
        scrapeGetArtist
    }