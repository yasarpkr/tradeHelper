// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const axios = require('axios');

let test = async() => {

    await fs.readFile('../config/smaList.js',(err) => {
        if (err){
            console.log('../config/smaList.js dosyası bulunamadı yenisi oluşturuluyor');
            fs.writeFile('../config/smaList.js','','utf8',(err) => {
            if(err) throw err
            })
            console.log('../config/smaList.js oluşturuldu')
        }
    ;}) ;await wait(2000)

    const smaList = require('../config/smaList.js')
    New = smaList.New

    if(!Array.isArray(New)){
        console.log('MA değerlerini içeren yeni array oluşturulacak...')
        // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
        let timeValue = `${fetchInterval}`
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
        
        // Create new list and write to file
        smaString = `let New = [\n`
        for(let element of smaDataObj){
            smaString += '  '+JSON.stringify(element)+',\n'
        }
        smaString += ']\n\nexports.New = New;'

        // Write data in 'Output.txt' .
        await fs.writeFile('../config/smaList.js',smaString, (err) => {
            if (err) throw err;
            })
        console.log('Liste ../config/smaList.js içerisine yönlendirildi')
        
    } else {
        console.log('Listede eski ve yeni değerler değişecek')
        Old = New;
        // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
        let timeValue = `${fetchInterval}`
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

        // [old] list and write to file
        smaString = `let Old = [\n`
        for(let element of Old){
            smaString += '  '+JSON.stringify(element)+',\n'
        }
        smaString += ']\n\nexports.Old = Old;\n\n'

        // [new] list and write to file
        smaString += `let New = [\n`
        for(let element of smaDataObj){
            smaString += '  '+JSON.stringify(element)+',\n'
        }
        smaString += ']\n\nexports.New = New;'

        // Write data in 'Output.txt' .
        await fs.writeFile('../config/smaList.js',smaString, (err) => {
            if (err) throw err;
            })
    } 
}

test(fetchInterval='15m');