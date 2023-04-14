// Imports
const {sendPostRequest,wait} = require('../../config/sente.js');
const fs = require('fs');

let test = async(timeValue='4h') => {

    let textFile = '../../config/15mAvarage.txt'
    // Create file if does not exist
    fs.readFile(textFile,(err) => {
        if (err){
            fs.writeFile(textFile,'sdsd','utf8',(err) => {
            if(err) throw err
            })
        }
    ;});await wait(2000)

    // Send post request and get 1 day volume value adress: ta4crypto.com
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)"]'
    let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})

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
        coinAndVolume_addProps[startCount].fourHourV = element[1]
        startCount++;
    } // console.log(coinAndVolume_addProps);

    // push 15 m avarage value to array 
    for(let element of coinAndVolume_addProps){
        element.fifteenMinAvgV = parseFloat((element.fourHourV / 16).toFixed(3))
    }

    // console.log(coinAndVolume_addProps);
    let string15mAvarage = `{\n"avarageList15m" : [`
    let countA = 0
    for(let element of coinAndVolume_addProps){
        if(countA !== coinAndVolume_addProps.length - 1){
            string15mAvarage += '\n' + JSON.stringify(element) + ','
        } else {string15mAvarage += '\n' + JSON.stringify(element) + '\n]\n}'} 
        countA++;
    } // console.log(string15mAvarage)

    // Write data in 'Output.txt' .
    await fs.writeFile(textFile, string15mAvarage, (err) => {       
        if (err) throw err;
    }) // console.log(avarageList15m)
}

test();