// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const avarageList15m = require('../config/15mAvarageList_4hBased.js')
const dateTime = require("node-datetime");

let test = async() => {

    // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
    let timeValue = '15m'
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Price (USDT)","Volume (M USDT)","RSI 6","RSI 14","MACD Divergence/CLOSE (%)","CLOSE/EMA12 (%)","CLOSE/EMA25 (%)","CLOSE/EMA50 (%)"]'
    let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             

    // Find data as [coin, 15mvolume, .....] and sort it 
    let regExpression = 'data:.*'
    let stringNeeded = res.data.match(regExpression)[0]
    stringNeeded = stringNeeded.replace('data: ','')
    stringNeeded = stringNeeded.replace(']],',']]')
    coinAndVolume = JSON.parse(stringNeeded)
    coinAndVolume.sort(function(a, b){return b[2] - a[2]}); // console.log(coinAndVolume);

    // Change stucture of Array like [{},{}]
    startCount = 0;
    let dataListNew = [];
    for(let element of coinAndVolume){
        dataListNew[startCount] = {};
        dataListNew[startCount].coin = element[0]
        startCount++;
    }

    console.log(JSON.stringify(dataListNew))

    // Write data in 'Output.txt' .
    await fs.writeFile('../config/ta4_coinlist.js', JSON.stringify(dataListNew), (err) => {       
        // In case of a error throw err.
        if (err) throw err;
    })

}

test();