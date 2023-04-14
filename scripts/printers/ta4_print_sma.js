// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const axios = require('axios');

let test = async(fetchInterval='1d') => {

    let textFile = '../../config/smaList.txt'
    fs.readFile(textFile,(err) => {
        if (err){
            fs.writeFile(textFile,'sdsd','utf8',(err) => {
            if(err) throw err
            })
        }
    ;});await wait(2000)

    // Use fs.readFile() method to read the file
    fs.readFile(textFile, 'utf8', async (err,data) => {
        if(err) throw new Error(err)
        if(data.length < 50){
            // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
            let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=18f3aa8a559cf34c719f177dd22f75df; indicatorsfilters=["Market","Price (USDT)","CLOSE/SMA12 (%)","CLOSE/SMA25 (%)","CLOSE/SMA50 (%)","CLOSE/SMA99 (%)"]'
            let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${fetchInterval}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             
        
            // Find data as [coin, 15mvolume, .....] and sort it 
            let regExpression = 'data:.*'
            let stringNeeded = res.data.match(regExpression)[0]
            stringNeeded = stringNeeded.replace('data: ','')
            stringNeeded = stringNeeded.replace(']],',']]')
            smaData = JSON.parse(stringNeeded)
            smaData.sort(function(a, b){return b[0] - a[0]});  // console.log(smaData);
    
            // Change stucture of Array like [{},{}]
            startCount = 0;
            let smaDataObj = [];
            for(let element of smaData){
                smaDataObj[startCount] = {};
                smaDataObj[startCount].coin = element[0]
                smaDataObj[startCount].price = element[1]
                smaDataObj[startCount].sma12 = element[2]
                smaDataObj[startCount].sma25 = element[3]
                smaDataObj[startCount].sma50 = element[4]
                smaDataObj[startCount].sma99 = element[5]
                startCount++;
            }
            
            
            // JSON.stringify(bullishArray) bullishArray
            listString = `{\n"New" : [`
            let countA = 0;
            for(let element of smaDataObj){
                if(countA !== smaDataObj.length - 1){
                    listString += '\n' + JSON.stringify(element) + ','
                } else {listString += '\n' + JSON.stringify(element) + '\n]\n}'} 
                countA++;
            }

            // Write data in 'Output.txt' .
            await fs.writeFile(textFile, listString, (err) => {
            if (err) throw err;
            })
        }        
        if(data.length >= 50){
            console.log('Listede eski ve yeni değerler değişecek')
            parsedData = JSON.parse(data)
            Old = parsedData.New

            // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
            let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=18f3aa8a559cf34c719f177dd22f75df; indicatorsfilters=["Market","Price (USDT)","CLOSE/SMA12 (%)","CLOSE/SMA25 (%)","CLOSE/SMA50 (%)","CLOSE/SMA99 (%)"]'
            let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${fetchInterval}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             
    
            // Find data as [coin, 15mvolume, .....] and sort it 
            let regExpression = 'data:.*'
            let stringNeeded = res.data.match(regExpression)[0]
            stringNeeded = stringNeeded.replace('data: ','')
            stringNeeded = stringNeeded.replace(']],',']]')
            smaData = JSON.parse(stringNeeded)
            smaData.sort(function(a, b){return b[0] - a[0]});  // console.log(smaData);
    
            // Change stucture of Array like [{},{}]
            startCount = 0;
            let smaDataObj = [];
            for(let element of smaData){
                smaDataObj[startCount] = {};
                smaDataObj[startCount].coin = element[0]
                smaDataObj[startCount].price = element[1]
                smaDataObj[startCount].sma12 = element[2]
                smaDataObj[startCount].sma25 = element[3]
                smaDataObj[startCount].sma50 = element[4]
                smaDataObj[startCount].sma99 = element[5]
                startCount++;
            };

            // Crate string with old elements
            let smaString = `{\n"Old" : [\n`
            let countA = 0
            for(let element of Old){
                if(countA !== Old.length - 1){
                    smaString += '\n' + JSON.stringify(element) + ','
                } else {smaString += '\n' + JSON.stringify(element) + '\n],\n'} 
                countA++;
            } // console.log(smaString)

            // Crate string with new elements
            smaString += `\n"New" : [\n`
            let countB = 0
            for(let element of smaDataObj){
                if(countB !== smaDataObj.length - 1){
                    smaString += '\n' + JSON.stringify(element) + ','
                } else {smaString += '\n' + JSON.stringify(element) + '\n]\n}'} 
                countB++;
            } // console.log(smaString)

            // Write data in 'Output.txt' .
            await fs.writeFile(textFile, smaString, (err) => {
            if (err) throw err;
            })

        } 
    })   
}

test();