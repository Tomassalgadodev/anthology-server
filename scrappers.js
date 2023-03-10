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


    const [el] = await page.$x('//*[@id="searchPage"]/div/div/div/div[1]/div[1]/div/div[1]/div[1]/div/img');
    const src = await el.getProperty('src');
    const img = await src.jsonValue();

    const [el2] = await page.$x('//*[@id="searchPage"]/div/div/div/div[1]/div[1]/div/div[2]/a');
    const href = await el2.getProperty('href');
    const link = await href.jsonValue();

    const [el3] = await page.$x('//*[@id="searchPage"]/div/div/div/div[1]/div[1]/div/div[2]/a/div');
    const txt = await el3.getProperty('textContent');
    const artistName = await txt.jsonValue();

    console.log(img, link, artistName);
    browser.close();
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

// scrapeSearchArtist('lizzo');
// scrapeGetAlbums('https://open.spotify.com/artist/56oDRnqbIiwx4mymNEv7dS');