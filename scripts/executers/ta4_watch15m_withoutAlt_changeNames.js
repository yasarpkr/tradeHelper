// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../../config/sente.js');
const fs = require('fs');
const fsPromises = require('fs').promises;
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const axios = require('axios');
const TelegramBot = require("node-telegram-bot-api")


let test = async(altTop=150,neededPercantage = 200) => {

    const token = '5900164551:AAGxhA_Oii1p40OQ34dVxOW7V8pkRKpK7C4'
    const bot = new TelegramBot(token, { polling: true })
    let users = [];

    bot.onText(/\/register/, (msg, match) => {
    const chatId = msg.chat.id
    users.push(chatId)
    console.log('user registered')
    bot.sendMessage(chatId, 'Done.')
    })

    // Define arrays
    let rawData = {}
    rawData.old = [];
    // let  = [];
    let watchList = [];

    filePath = {}
    filePath.bullish = '../../config/bullish.txt'
    filePath.altrankList = '../../config/altrankList.txt'
    filePath.blackList = '../../config/ta4_blacklist.txt'
    filePath.avarageList15m = '../../config/15mAvarage.txt'

    async function readCsv(filePath) {
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content;
    }

    let whileCount = 0
    while(true){
        try{
        whileCount++
        console.log(`[${now()}] - [WhileCount: ${whileCount}]`)
        rsp_blacklist = await readCsv(filePath.blackList)
        rsp_avarageList15m = await readCsv(filePath.avarageList15m)
        let avarageList15m = JSON.parse(rsp_avarageList15m).avarageList15m
        let blacklist = rsp_blacklist

        // Send post request and get 15m  volume value , [adress: // https://ta4crypto.com/market-reports]
        let timeValue = '15m'
        let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Price (USDT)","Volume (M USDT)","RSI 6","RSI 14","MACD Divergence/CLOSE (%)","CLOSE/EMA12 (%)","CLOSE/EMA26 (%)","CLOSE/EMA50 (%)"]'
        let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             

        // -------- Array Lines -------- 
        // 0 "Market",
        // 1 "Price (USDT)",
        // 2 "Volume (M USDT)"
        // 3 "RSI 6"
        // 4 "RSI 14"
        // 5 "MACD Divergence/CLOSE (%)"
        // 6 "CLOSE/EMA12 (%)"
        // 7 "CLOSE/EMA26 (%)"
        // 8 "CLOSE/EMA50 (%)"

        // Find data as [coin, 15mvolume, .....] and sort it 
        let regExpression = 'data:.*'
        let stringNeeded = res.data.match(regExpression)[0]
        stringNeeded = stringNeeded.replace('data: ','')
        stringNeeded = stringNeeded.replace(']],',']]')
        taCryptoList = JSON.parse(stringNeeded)
        taCryptoList.sort(function(a, b){return b[2] - a[2]}); 
        
        console.log('Örnek bir taCryptoList elemanı:\n-------------------------------------------');
        console.log(taCryptoList[0]);
        console.log('\n[taCryptoList length: '+taCryptoList.length+']\n-------------------------------------------');

        // Change stucture of Array like [{},{}]
        console.log(`\n[${now()}] - Structure değiştiriliyor dizi elemanları property haline getirilecek...`)
        startCount = 0;
        rawData.new = [];
        for(let element of taCryptoList){
            rawData.new[startCount] = {};
            rawData.new[startCount].coin = element[0]
            rawData.new[startCount].price = element[1]
            rawData.new[startCount].fiftMinV = element[2]
            rawData.new[startCount].ema12 = element[3]
            rawData.new[startCount].ema25 = element[4]
            rawData.new[startCount].ema50 = element[5]
            rawData.new[startCount].rsi6 = element[6]
            rawData.new[startCount].rsi14 = element[7]
            rawData.new[startCount].macdClose = element[8]
            startCount++;
        }
        await wait(1000);
        console.log('\nÖrnek bir rawData.new elemanı:\n-------------------------------------------');
        console.log(rawData.new[0]);
        console.log('\n[rawData.new length: '+rawData.new.length+']\n-------------------------------------------\n');


        // Compare 2 data , push power value to new array
        console.log(`\n[${now()}] - Dizi elemanlarına fifteenMinPower değeri hesaplanıp ekleniyor...`)
        for(let rdn of rawData.new){
            for (al15 of avarageList15m){
                if(rdn.coin == al15.coin) {
                    fifteenminVPower = (rdn.fiftMinV / al15.fifteenMinAvgV * 100)
                    fifteenminVPower = parseFloat(fifteenminVPower.toFixed(3))
                    rdn.fifteenminVPower = fifteenminVPower // Datalist new including fifteenMinPow now
                    break;
                }
            }
        }
        await wait(1000);
        console.log('\nÖrnek bir fifteenMinPow eklenmiş rawData.new elemanı:\n-------------------------------------------');
        console.log(rawData.new[0]);
        console.log(rawData.new[1]);
        console.log('\n[rawData.new length: '+rawData.new.length+']\n-------------------------------------------\n');

        console.log(`\n[${now()}] - Dizi elemanları fifteenMinPower değerine göre rawData.new sıralanıyor..`)
        rawData.new.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower});  // console.log(rawData.new)
        triggerMail = true;
        maintainCalculation = true;
        console.log(`[${now()}] - Dizi elemanları fifteenMinPower değerine göre rawData.new sıralandı [OK]`)

        if(rawData.old.length == 0) {
            console.log(`[${now()}] - Henüz sadece ilk değerler çekildi mail gönderilmeyecek`)
            rawData.old = rawData.new;
            await wait(1 * 1000 * 1 ) // wait last integer minute
        }  
        if(rawData.old.length > 0 && rawData.new[0].fifteenminVPower == rawData.old[0].fifteenminVPower && rawData.new[1].fifteenminVPower == rawData.old[1].fifteenminVPower && rawData.new[2].fifteenminVPower == rawData.old[2].fifteenminVPower && rawData.new[3].fifteenminVPower == rawData.old[3].fifteenminVPower && rawData.new[4].fifteenminVPower == rawData.old[4].fifteenminVPower && rawData.new[5].fifteenminVPower == rawData.old[5].fifteenminVPower) {
            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler esittir. Mail gönderilmeyecek`) ;
            await wait(1 * 1000 * 60 ) // wait last integer minute} 

        } else {

            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler değişti. Hesaplama sürdürülüyor`) ;
            // Some definitions
            const date = new Date();
            currentHour = date.getHours();
            currentMin = date.getMinutes();
            (currentHour < 10) ? currentHour = '0' +currentHour : ''
            dt = dateTime.create(); currentDate = dt.format('Y-m-d')+' '+currentHour+':'+currentMin;
            
            let upperList = [];

            // Get Upper values of the rawData.new
            countF = 0;
            for (let rdn of rawData.new){
                if (rdn.fifteenminVPower > neededPercantage && (rdn.rsi6 > 50 || rdn.rsi14 > 50)){
                    upperList.push(rdn)
                    countF++;
                }
            
            }            

            // Sort upper list according to Power
            upperList.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower}); 
            console.log(`[${now()}] - fifteenMinPower değerleri en yüksek olanlar upperListe bastırılıyor ...`)
            console.log('\nÖrnek UpperList elemanı:\n-------------------------------------------');
            console.log(upperList[0]);
            console.log(upperList[1]);
            console.log('\n[upperList length: '+upperList.length+']\n-------------------------------------------\n')

            // Add breaks to element of upper list 
            for(let ul of upperList){
                ul.breaks = {};
            };     
            console.log(`[${now()}] - UpperListe break property bastırılıyor ...`)
            console.log('\nÖrnek UpperList break eklenmiş elemanları:\n-------------------------------------------');
            console.log(upperList[0]);
            console.log(upperList[1]);
            console.log('\n[upperList length: '+upperList.length+']\n-------------------------------------------\n')
    
            for(let ul of upperList) {
                for(let rdo of rawData.old){
                    if(ul.coin == rdo.coin){

                        // Check ema negative of new candle
                        if (rdo.ema12 < 0 && ul.ema12 > 0){
                            ul.breaks.ema12 = 'Yes'
                        } else {
                            ul.breaks.ema12  = 'No'
                        }
                        
                        if (rdo.ema25 < 0 && ul.ema25 > 0){
                            ul.breaks.ema25 = 'Yes'
                        } else {
                            ul.breaks.ema25 = 'No'
                        }
                        
                        if (rdo.ema50 < 0 && ul.ema50 > 0){
                            ul.breaks.ema50 = 'Yes'
                        } else {
                            ul.breaks.ema50= 'No'
                        }
                    break;   
                    }
                }
            }  
            console.log('\nÖrnek UpperList break hesaplanmış elemanı:\n-------------------------------------------');
            console.log(upperList[0])
            console.log(upperList[1])
            console.log(`-------------------------------------------`)
            
            // Crop upper list for mail outline 
            break50EmaList = [];
            countA = 0;
            for(let ul of upperList){
                if (ul.breaks.ema50 == 'Yes' && blacklist.indexOf(`"${ul.coin}"`) < 0) { 
                                                      
                    break50EmaList[countA] = {};
                    break50EmaList[countA].coin = ul.coin;
                    break50EmaList[countA].rsi6 = ul.rsi6;
                    break50EmaList[countA].fifteenminVPower = ul.fifteenminVPower;
                    break50EmaList[countA].breaks = ul.breaks; 
                    countA++;

                }
            }
            console.log('Blaclistte olmayan Break ema 50 List : \n')
            console.log(break50EmaList)


            // Find coins will be delete from observeList
            if(watchList.length > 0){
                console.log(`[${now()}] WatchListteki gerekli elemanlar silinecek...`)
                console.log(`Watchlist length : ${watchList.length}`)
                for(let rdn of rawData.new){
                    for(let rdo of rawData.old){
                        if(rdn.coin == rdo.coin && (rdn.ema50 < 0  && rdo.ema50 < 0)){
                            deleteNeeded = false
                            deleteIndex = 0;
                                for(let wl of watchList){
                                    if(rdn.coin == wl.coin){
                                        deleteNeeded = true;       
                                        break;
                                    }
                                deleteIndex++;
                                }
                                if(deleteNeeded == true) {
                                    console.log(`[INFO] - Watchlistten silinen coin:${rdn.coin}`)
                                    watchList.splice(deleteIndex,1)
                                };
                        }
                    }
                }

                for(let wl of watchList){
                    wl.consistency++
                    wl.state = 'Stable'
                }
            }
            console.log(`[${now()}] - WatchListe gerekli elemanlar silindi . Diğerleri stable edildi [OK]`)
            console.log(`Örnek watchlist elemanları: \n-------------------------------`)
            console.log(watchList[0])
            console.log(watchList[1])
            console.log(`[Watchlist new length : ${watchList.length}]\n-------------------------------`)

            // Create new elements of observerList
            countC = 0;
            console.log(`[${now()}] WatchListe yeni elemanlar ekleniyor...`)
            let tempList = {};
            for(let rdn of rawData.new){
                for (let rdo of rawData.old){
                                                                                            // if(rdn.coin == rdo.coin && (rdo.ema50 < 0  && rdn.ema50 > 0) && JSON.stringify(watchList).indexOf(`"${rdn.coin}"`) < 0){
                    if(rdn.coin == rdo.coin && rdn.ema50 > 0 && JSON.stringify(watchList).indexOf(`"${rdn.coin}"`) < 0){
                            tempList[countC] = {};
                            tempList[countC].coin = rdn.coin;
                            tempList[countC].candleTime = currentDate;
                            tempList[countC].powerCount = 0;
                            tempList[countC].consistency = 0;
                            tempList[countC].state = 'Stable'
                            watchList.push(tempList[countC])
                            countC ++
                        break;
                    };
                };
            };
            console.log(`[${now()}] WatchListe yeni elemanlar eklendi [OK]`)
            console.log(`Watchlist new length : ${watchList.length}`)

            // Push upperList Power items to observeds
            console.log(`[${now()}] - Watchlist içerisinde power atan coinler sayılacak...`)
            for(let ul of upperList){
                if (ul.breaks.ema50 == 'No') {
                    countS = 0;
                    for(let wl of watchList){
                        if(ul.coin == wl.coin){
                            wl.powerCount++
                            wl.state = 'Changed'
                            wl.power = ul.fifteenminVPower
                            break;
                        }
                        countS++;
                    }
                }
            }

            console.log(`[${now()}] - WatchListe power atan elemanlar eklendi [OK]`)
            console.log(`Örnek watchlist powered elemanları: \n-------------------------------`)
            console.log(watchList[0])
            console.log(watchList[1])
            console.log(`[Watchlist new length : ${watchList.length}]\n-------------------------------`)


            // Change new data as old , beacuse it used 
            rawData.old = rawData.new; // console.log(upperList)
            console.log(`Alınan [Rawdata.new] artık [Rawdata.old] olarak değiştirildi`)
         
            // Crop observeList for mail
            watchList.sort(function(a, b){return b.state - a.state});  // console.log(rawData.new)
            let watchListChanged = []
            for(let wl of watchList){
                if(wl.state == 'Changed' && wl.powerCount >= 1 && blacklist.indexOf(`"${wl.coin}"`) < 0 ){
                    watchListChanged.push(wl)
                }
            }
            console.log(`Örnek watchList changed elemanı : \n`)
            console.log(watchListChanged[0])
            console.log(`[Watchlist changed dizi boyutu: ${watchListChanged.length}]`)
      
            stringforFile = '';
            stringforFile += `\n\n[${now()}] - Break Ema50 With Volume \n ------------------------------------------------------\n`
            for(bel of break50EmaList){
                stringforFile += JSON.stringify(bel) + '\n\n'
            }
            stringforFile += `\n[${now()}] - Watch List , [listLengthAll: ${watchList.length}] , [croppedLength: ${watchListChanged.length}] \n ------------------------------------------------------\n`
            for(wlch of watchListChanged){
                stringforFile += JSON.stringify(wlch) + '\n\n'
            }

            stringforFile += '\n\n ~~~~ Powered by İlker and Yasar ~~~~'
            console.log(stringforFile)
            for (let i = 0; i < users.length; i++) {
                bot.sendMessage(users[i], stringforFile)
            }  
            await wait(1 * 1000 * 60  ) // wait last integer minute 
       
        } 
        } catch(e) {console.log(e)}
    }
}

test();