// Imports
const {sendPostRequest} = require('../../config/sente.js');
const fs = require('fs');

let test = async(timeValue = '1d') => {

    let textFile = '../../config/bullish.txt'

    // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Price (USDT)","Volume (M USDT)","RSI 6","RSI 14","MACD Divergence/CLOSE (%)","CLOSE/EMA12 (%)","CLOSE/EMA25 (%)","CLOSE/EMA50 (%)"]'
    let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             

    // Find data as [coin, 15mvolume, .....] and sort it 
    let regExpression = 'data:.*'
    let stringNeeded = res.data.match(regExpression)[0]
    stringNeeded = stringNeeded.replace('data: ','')
    stringNeeded = stringNeeded.replace(']],',']]')
    coinAndVolume = JSON.parse(stringNeeded)
    coinAndVolume.sort(function(a, b){return b[2] - a[2]});  // console.log(coinAndVolume);        

    // Change stucture of Array like [{},{}]
    startCount = 0;
    let dataList = [];
    for(let element of coinAndVolume){
        dataList[startCount] = {};
        dataList[startCount].coin = element[0]
        dataList[startCount].ema25 = element[4]
        dataList[startCount].ema50 = element[5]
        dataList[startCount].rsi6 = element[6]
        dataList[startCount].rsi14 = element[7]
        startCount++;
    }

    // console.log(dataList)
    let bullishArray = [];
    for(let element of dataList){
        if(element.ema25 > 0 && element.ema50 > 0 && element.rsi14 > 60){
            bullishArray.push(element);
        }
    }

    // console.log(bullishArray)

    // JSON.stringify(bullishArray) bullishArray
    listString = `{\n"bullishArray" : [`
    let countA = 0;
    for(let element of bullishArray){
        if(countA !== bullishArray.length - 1){
            listString += '\n' + JSON.stringify(element) + ','
        } else {listString += '\n' + JSON.stringify(element) + '\n]\n}'} 
        countA++;
    }
    // console.log(listString)
    
    // Write data in 'Output.txt' .
    await fs.writeFile(textFile, listString, (err) => {       
        if (err) throw err;
    })
}

test();