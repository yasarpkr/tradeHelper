// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');

let test = async() => {

    // Send post request and get 1 day volume value adress: ta4crypto.com
    let timeValue = '1d'
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)"]'
    let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})
    // https://ta4crypto.com/market-reports/1h/?filters=true

    // Find data needed and sort it 
    let regExpression = 'data:.*'
    let stringNeeded = res.data.match(regExpression)[0]
    stringNeeded = stringNeeded.replace('data: ','')
    stringNeeded = stringNeeded.replace(']],',']]')
    coinAndVolume = JSON.parse(stringNeeded)
    coinAndVolume.sort(function(a, b){return b[1] - a[1]});
    // console.log(coinAndVolume);

    // Change stucture of Array like [{},{}]
    coinAndVolume_addProps = [];
    let startCount = 0;
    for(let element of coinAndVolume){
        coinAndVolume_addProps[startCount] = {};
        coinAndVolume_addProps[startCount].coin = element[0]
        coinAndVolume_addProps[startCount].oneDayV = element[1]
        startCount++;
    }

    // console.log(coinAndVolume_addProps);

    // push 15 m avarage value to array 
    for(let element of coinAndVolume_addProps){
        element.fifteenMinAvgV = parseFloat((element.oneDayV / 96).toFixed(3))
    }

    // console.log(coinAndVolume_addProps);
    let elementListString = ''
    for(element of coinAndVolume_addProps){
        stingWillAdd = JSON.stringify(element)
        elementListString += '\n   ' + stingWillAdd + ','
    }

    let avarageList15m = `let avarageList15m = [\n${elementListString}\n]\n\nmodule.exports = avarageList15m;`;
    console.log(avarageList15m)

    // Write data in 'Output.txt' .
    await fs.writeFile('../config/15mAvarageList_dayBased.js', avarageList15m, (err) => {       
        // In case of a error throw err.
        if (err) throw err;
    })

    
    console.log(avarageList15m)
}

test();