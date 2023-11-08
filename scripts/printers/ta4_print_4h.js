// Imports
const {sendPostRequest,wait} = require('../../config/sente.js');
const fs = require('fs');

let test = async() => {

    let outputFile = '../../config/lst_ta4_4h.out'
    let timeValue = '4h'
    let metrics = `"Market","Volume (M USDT)","RSI 6","RSI 14"`        
    let listTag = 'lst_ta4_4h'
    
    // Create file if does not exist
    fs.readFile(outputFile,(err) => {
        if (err){
            fs.writeFile(outputFile,'sdsd','utf8',(err) => {
                if(err) throw err
            })
        };
    });await wait(2000)

    // Send post request and get 1 day volume value adress: ta4crypto.com
    let sessionid = `filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=[${metrics}]`
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
        coinAndVolume_addProps[startCount].rsi6 = element[2]
        coinAndVolume_addProps[startCount].rsi14 = element[3]
        coinAndVolume_addProps[startCount].fourHourV = element[1]
        startCount++;
    } 
    // console.log(coinAndVolume_addProps);

    // // push 15 m avarage value to array 
    // for(let element of coinAndVolume_addProps){
    //     element.fifteenMinAvgV = parseFloat((element.fourHourV / 16).toFixed(3))
    // }

    // console.log(coinAndVolume_addProps);
    let listTagString = `{\n"${listTag}" : [`
    let countA = 0
    for(let element of coinAndVolume_addProps){
        if(countA !== coinAndVolume_addProps.length - 1){
            listTagString += '\n' + JSON.stringify(element) + ','
        } else {listTagString += '\n' + JSON.stringify(element) + '\n]\n}'} 
        countA++;
    };await wait(2000)
    // console.log(listTagString)
    
    // Write data in 'Output.txt' .
    fs.writeFile(outputFile, listTagString, (err) => {       
        if (err) throw err;
    }) 
    // console.log(avarageList15m)

    
}

test();