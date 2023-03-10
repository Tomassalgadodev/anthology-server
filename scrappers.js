const puppeteer = require('puppeteer');

async function scrapeSearchArtist(artist) {
    const url = `https://open.spotify.com/search/${artist}/artists`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {"waitUntil" : "networkidle0"});
    
    // await page.screenshot({
    //     path: './screenshot.png',
    //     fullPage: true,
    //     });

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
        })
    }

    console.log(artists);
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

    console.log(albumInfo);
    browser.close();
    return albumInfo;
}

scrapeSearchArtist('something very rare');
// scrapeGetAlbums('https://open.spotify.com/artist/56oDRnqbIiwx4mymNEv7dS');