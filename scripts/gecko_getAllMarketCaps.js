// https://www.npmjs.com/package/coingecko-api 

// Imports
const axios = require('axios');
const fs = require('fs');
const CoinGecko = require('coingecko-api');


let test = async () => {

    const CoinGeckoClient = new CoinGecko();

    let params = {};
    // params.ids = 'thorchain';
    params.vs_currency = 'usd';
    params.per_page = 250;

    let totalData = [];
    let totalPage = 3;

    for(let i=0; i<totalPage ;i++){
        params.page = i+1;
        respCoinsMeta = await CoinGeckoClient.coins.markets(params);
        for(let a of respCoinsMeta.data) {totalData.push(a)}
    }

    let marketCapArrayOfCoins = [];

    let arrayCount = 0
    for(let y of totalData){
        marketCapArrayOfCoins[arrayCount] = {};
        marketCapArrayOfCoins[arrayCount].sybol = y.symbol
        marketCapArrayOfCoins[arrayCount].name = y.name
        marketCapArrayOfCoins[arrayCount].market_cap = y.market_cap
        arrayCount++
    }
    
    console.log(marketCapArrayOfCoins.length)
    
    let jsonStringOfMarketCaps = JSON.stringify(marketCapArrayOfCoins)
    
    // Write data in 'Output.txt' .
    await fs.writeFile('marketCapArray.js', jsonStringOfMarketCaps, (err) => {       
        // In case of a error throw err.
        if (err) throw err;
    })

}

test()

