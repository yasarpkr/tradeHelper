// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const avarageList15m = require('../config/15mAvarageList_dayBased.js')


let test = async() => {

    // Send post request and get 1 day volume value adress: ta4crypto.com
    let timeValue = '4h'
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Price (USDT)","CLOSE/EMA12 (%)","CLOSE/EMA25 (%)","CLOSE/EMA50 (%)"]'
    let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})
    // https://ta4crypto.com/market-reports/1h/?filters=true

    // Find data needed and sort it d
    let regExpression = 'data:.*'
    let stringNeeded = res.data.match(regExpression)[0]
    stringNeeded = stringNeeded.replace('data: ','')
    stringNeeded = stringNeeded.replace(']],',']]')
    emaCloseArrayA = JSON.parse(stringNeeded)
    // console.log(emaCloseArrayA);

    // Change stucture of Array like [{},{}]
    emaCloseArrayB = [];
    let startCount = 0;
    for(let element of emaCloseArrayA){
        emaCloseArrayB[startCount] = {};
        emaCloseArrayB[startCount].coin = element[0]
        emaCloseArrayB[startCount].price = element[1]
        emaCloseArrayB[startCount].ema12 = element[2]
        emaCloseArrayB[startCount].ema25 = element[3]
        emaCloseArrayB[startCount].ema50 = element[4]
        startCount++;
    }

    console.log(emaCloseArrayB);

    // // push 15 m avarage value to array 
    // for(let element of coinAndVolume_addProps){
    //     element.fifteenMinAvgV = parseFloat((element.oneDayV / 96).toFixed(3))
    // }

    // // console.log(coinAndVolume_addProps);
    // let elementListString = ''
    // for(element of coinAndVolume_addProps){
    //     stingWillAdd = JSON.stringify(element)
    //     elementListString += '\n   ' + stingWillAdd + ','
    // }

    // let avarageList15m = `let avarageList15m = [\n${elementListString}\n]\n\nmodule.exports = avarageList15m;`;
    // console.log(avarageList15m)

    // // Write data in 'Output.txt' .
    // await fs.writeFile('../config/15mAvarageList.js', avarageList15m, (err) => {       
    //     // In case of a error throw err.
    //     if (err) throw err;
    // })

    
    // console.log(avarageList15m)
}

test();