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
    let dataListOld = [];
    let observedListAll = [];

    filePath = {}
    filePath.bullish = '../../config/bullish.txt'
    filePath.altrankList = '../../config/altrankList.txt'
    filePath.blackList = '../../config/ta4_blacklist.txt'
    filePath.avarageList15m = '../../config/15mAvarage.txt'

    async function readCsv(filePath) {
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content;
    }

    
    while(true){
        try{
    
        rsp_Bullish = await readCsv(filePath.bullish)
        rsp_altranklist = await readCsv(filePath.altrankList)
        rsp_blacklist = await readCsv(filePath.blackList)
        rsp_avarageList15m = await readCsv(filePath.avarageList15m)

        bullishArray = JSON.parse(rsp_Bullish).bullishArray
        avarageList15m = JSON.parse(rsp_avarageList15m).avarageList15m
        blacklist = rsp_blacklist
        altrankNew = JSON.parse(rsp_altranklist).New
        altrankOld = JSON.parse(rsp_altranklist).Old
        

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
            dataListNew[startCount].price = element[1]
            dataListNew[startCount].fiftMinV = element[2]
            dataListNew[startCount].ema12 = element[3]
            dataListNew[startCount].ema25 = element[4]
            dataListNew[startCount].ema50 = element[5]
            dataListNew[startCount].rsi6 = element[6]
            dataListNew[startCount].rsi14 = element[7]
            dataListNew[startCount].macdClose = element[8]
            startCount++;
        }

        // Compare 2 data , push power value to new array
        startCount = 0;
        for(let element2 of dataListNew){
            for (element_avarage of avarageList15m){
                if(element2.coin == element_avarage.coin) {
                    fifteenminVPower = (element2.fiftMinV / element_avarage.fifteenMinAvgV * 100)
                    fifteenminVPower = parseFloat(fifteenminVPower.toFixed(3))
                    dataListNew[startCount].fifteenminVPower = fifteenminVPower
                    break;
                }
            }
            startCount ++;
        }

        dataListNew.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower});  // console.log(dataListNew)
        triggerMail = true;
        maintainCalculation = true;

        if(dataListOld.length == 0) {
            triggerMail = false ; 
            console.log('[INFO] - Henüz sadece ilk değerler çekildi mail gönderilmeyecek')
            dataListOld = dataListNew;
            await wait(1 * 1000 * 1 ) // wait last integer minute
            maintainCalculation = false; // console.log(dataListOld)
        }  
        if(dataListOld.length > 0 && dataListNew[0].fifteenminVPower == dataListOld[0].fifteenminVPower && dataListNew[1].fifteenminVPower == dataListOld[1].fifteenminVPower && dataListNew[2].fifteenminVPower == dataListOld[2].fifteenminVPower && dataListNew[3].fifteenminVPower == dataListOld[3].fifteenminVPower && dataListNew[4].fifteenminVPower == dataListOld[4].fifteenminVPower && dataListNew[5].fifteenminVPower == dataListOld[5].fifteenminVPower) {
            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler esittir. Mail gönderilmeyecek`) ;
            triggerMail = false;
            maintainCalculation = true 
            await wait(1 * 1000 * 60 ) // wait last integer minute} 

        } else {
            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler değişti. Hesaplama sürdürülüyor`) ;

            // Some emptyness definitions
            const date = new Date();
            currentHour = date.getHours();
            currentMin = date.getMinutes();
            (currentHour < 10) ? currentHour = '0' +currentHour : ''
            dt = dateTime.create(); currentDate = dt.format('Y-m-d')+' '+currentHour+':'+currentMin;
            
            let upperList = [];
            let observedListNew = [];

            // Get Upper values of the dataListNew
            countF = 0;
            for (let element3 of dataListNew){
                if (element3.fifteenminVPower > neededPercantage && (element3.rsi6 > 50 || element3.rsi14 > 50)){
                    upperList.push(element3)
                    countF++;
                }
            
            }            

            // Sort upper list according to Power
            upperList.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower});  // console.log(upperList)

            // Add breaks to element of upper list 
            for(let x = 0 ; x < upperList.length ; x++){
                upperList[x].breaks = {};
            };     // console.log(upperList)
    
            // Checks break of ema at last candle
            countP = 0;
            for(let elementNew of upperList) {
                for(let elementOld of dataListOld){
                    if(elementNew.coin == elementOld.coin){

                        // Check ema negative of new candle
                        if (elementOld.ema12 < 0 && elementNew.ema12 > 0){
                            upperList[countP].breaks.ema12 = 'Yes'
                        } else {
                            upperList[countP].breaks.ema12  = 'No'
                        }
                        
                        if (elementOld.ema25 < 0 && elementNew.ema25 > 0){
                            upperList[countP].breaks.ema25 = 'Yes'
                        } else {
                            upperList[countP].breaks.ema25 = 'No'
                        }
                        
                        if (elementOld.ema50 < 0 && elementNew.ema50 > 0){
                            upperList[countP].breaks.ema50 = 'Yes'
                        } else {
                            upperList[countP].breaks.ema50= 'No'
                        }
                    break;   
                    }
                }
                countP++
            }  
            
            // Get Altrank Top Coins
            altrankNewFirst150 = [];
            for(let a = 0 ; a < altTop ; a++){
                altrankNewFirst150.push(altrankNew[a])
            }

            // Crop upper list for mail outline 
            break50EmaList = [];
            countA = 0;
            for(let element of upperList){
                if (element.breaks.ema50 == 'Yes' && blacklist.indexOf(element.coin) < 0) { 
                // if (blacklist.indexOf(element.coin) < 0) { 
                    for(let element2 of altrankNewFirst150){
                        if(element.coin == element2.s){
                            for(let element3 of altrankOld){
                                if(element.coin == element3.s){
                                    break50EmaList[countA] = {};
                                    break50EmaList[countA].coin = element.coin;
                                    break50EmaList[countA].rsi6 = element.rsi6;
                                    break50EmaList[countA].fifteenminVPower = element.fifteenminVPower;
                                    break50EmaList[countA].breaks = element.breaks; 
                                    break50EmaList[countA].altrank = element2.acr;
                                    break50EmaList[countA].alt_old = element3.acr;
                                    break50EmaList[countA].alt_24p = element2.acr_p;
                                    countA++;
                                    break;
                                }
                            }
                        break;
                        }
                    }
                
                }
            }


            // Find coins will be delete from observeList
            if(observedListAll.length > 0){
                for(let element of dataListNew){
                    for(let elementOld of dataListOld){
                        if(element.coin == elementOld.coin && (element.ema50 < 0  && elementOld.ema50 < 0)){
                            deleteNeeded = false
                            deleteIndex = 0;
                                for(let elementObserved of observedListAll){
                                    if(element.coin == elementObserved.coin){
                                        deleteNeeded = true;       
                                        break;
                                    }
                                deleteIndex++;
                                }
                                if(deleteNeeded == true) {
                                    // console.log(`[INFO] - Watchlistten silinen coin:${element.coin}`)
                                    observedListAll.splice(deleteIndex,1)
                                };
                        }
                    }
                }

                for(let element of observedListAll){
                    element.consistency++
                    element.state = 'Stable'
                }
            }

            // Create new elements of observerList
            countC = 0;
            for(let elementNew of dataListNew){
                for (let elementOld of dataListOld){
                    // if(elementNew.coin == elementOld.coin && (elementOld.ema50 < 0  && elementNew.ema50 > 0) && JSON.stringify(observedListAll).indexOf(`"${elementNew.coin}"`) < 0){
                    if(elementNew.coin == elementOld.coin && elementNew.ema50 > 0 && JSON.stringify(observedListAll).indexOf(`"${elementNew.coin}"`) < 0){
                            observedListNew[countC] = {};
                            observedListNew[countC].coin = elementNew.coin;
                            observedListNew[countC].candleTime = currentDate;
                            observedListNew[countC].powerCount = 0;
                            observedListNew[countC].consistency = 0;
                            observedListNew[countC].state = 'Stable'
                            observedListAll.push(observedListNew[countC])
                            countC ++
                        break;
                    };
                };
            };
            // console.log(`Watchlist new length : ${observedListAll.length}`)

            // Push upperList Power items to observeds
            newPowerItem = false
            for(let element of upperList){
                if (element.breaks.ema50 == 'No') {
                    countS = 0;
                    for(let observeds of observedListAll){
                        if(element.coin == observeds.coin){
                            observedListAll[countS].powerCount++
                            observedListAll[countS].state = 'Changed'
                            observedListAll[countS].power = element.fifteenminVPower
                            newPowerItem = true
                            break;
                        }
                        countS++;
                    }
                }
            }

            // Change new data as old , beacuse it used 
            dataListOld = dataListNew; // console.log(upperList)
         
            // Crop observeList for mail
            observedListAll.sort(function(a, b){return b.state - a.state});  // console.log(dataListNew)
            let observedListMail = [];
            for(element of observedListAll){
                if(element.state == 'Changed' && element.powerCount >= 1 && blacklist.indexOf(element.coin) < 0 ){
                    for(let element2 of altrankNewFirst150){
                        if(element.coin == element2.s){
                            for(let element3 of altrankOld){
                                if(element.coin == element3.s){
                                    element.altrank = element2.acr
                                    element.alt_old = element3.acr
                                    element.alt_24p = element2.acr_p
                                    element.powe
                                    observedListMail.push(element)
                                    break;
                                }
                            }
                        break;
                        }
                    }
                }
            }

            // console.log(upperList)

            bullishDetector = [];
            // console.log(bullishArray)
            countB = 0;
            for(let element of bullishArray){
                if(JSON.stringify(upperList).indexOf(element.coin) > -1  && blacklist.indexOf(element.coin) < 0){
                    for(let element2 of upperList){
                        if(element.coin == element2.coin){
                            for(let element3 of altrankNewFirst150){
                                if(element.coin == element3.s){
                                    for(let element4 of altrankOld)
                                        if(element.coin == element4.s){
                                            bullishDetector[countB] = {};
                                            bullishDetector[countB].coin = element.coin
                                            bullishDetector[countB].power = element2.fifteenminVPower
                                            bullishDetector[countB].altrank = element3.acr
                                            bullishDetector[countB].alt_old = element4.acr
                                            bullishDetector[countB].alt_24p = element3.acr_p
                                            countB++
                                            break;
                                        }
                                break;   
                                }
                            }
                        break;
                        } 
                    }
                }
            }

            stringforFile = '';
            if(bullishDetector.length > 0){
                stringforFile += `\n[${now()}] - Bullish Trend Coin Volume Up Detector \n ------------------------------------------------------\n`
                for(element of bullishDetector){
                    stringforFile += JSON.stringify(element) + '\n'
                }
            }

            stringforFile += `\n\n[${now()}] - Break Ema50 With Volume \n ------------------------------------------------------\n`
            for(element of break50EmaList){
                stringforFile += JSON.stringify(element) + '\n\n'
            }
            stringforFile += `\n[${now()}] - Watch List - [listLengthAll: ${observedListAll.length}] - [croppedLength: ${observedListMail.length}] \n ------------------------------------------------------\n`
            for(element of observedListMail){
                stringforFile += JSON.stringify(element) + '\n\n'
            // }
            // stringforFile += `\n[${now()}] - Watch List - [listLengthAll: ${observedListAll.length}] - [croppedLength: ${observedListMail.length}] \n ------------------------------------------------------\n`
            // for(element of observedListAll){
            //     stringforFile += JSON.stringify(element) + '\n\n'
            // }
        
        //     // // Get list of lunarcrush links
        //     // linkListOfLunar = [];
        //     // countL  = 0
        //     // for(let elements of break50EmaList){
        //     //     // link pattern : https://lunarcrush.com/coins/uma/stafi?metric=close%2Csocial_score%2Calt_rank
        //     //     coinName = elements.coin.toLowerCase()
        //     //     linkListOfLunar[countL] = {};
        //     //     linkListOfLunar[countL].coin = coinName
        //     //     linkListOfLunar[countL].link = `https://lunarcrush.com/coins/${coinName}/stafi?metric=close%2Csocial_score%2Calt_rank`
        //     //     countL ++;
        //     // }
    
        //     // stringforFile += `\n\n\n[${now()}] - Coin link list in lunar crush . You can check! \n ------------------------------------------------------\n`
        //     // for(element of linkListOfLunar){
        //     //     stringforFile += JSON.stringify(element) + '\n\n'
        //     // }
        //     // console.log(linkListOfLunar)

            stringforFile += '\n\n ~~~~ Powered by İlker and Yasar ~~~~'
            console.log(stringforFile)
    
            if (break50EmaList.length > 0 || bullishDetector.length > 0 || observedListMail.length > 0 && users.length > 0 ){
                for (let i = 0; i < users.length; i++) {
                    bot.sendMessage(users[i], stringforFile)
                }    
                // var transporter = nodemailer.createTransport({
                //     host: "smtp-mail.outlook.com", // hostname
                //     secureConnection: false, // TLS requires secureConnection to be false
                //     port: 587, // port for secure SMTP
                //     auth: {
                //         user: mailaddress,
                //         pass: "368-93Ya."
                //     },
                //     tls: {
                //         ciphers:'SSLv3'
                //     }
                // });
                    
                // var mailOptions = {
                //     from: mailaddress,
                //     to: 'yasarpeker08@gmail.com',
                //     // subject: `[Yas,ikr] - Validate Sma 1D - [like coin:${observedListMail[0].coin}] - [${now()}]`,
                //     subject: `[Yas,ikr] - Validate Sma 1D - [like coin:] - [${now()}]`,
                //     // text: stringforFile
                //     text: 'SELAM'
                // };
                    
                // transporter.sendMail(mailOptions, function(error, info){
                //     if (error) {
                //         console.log(error);
                //     } else {
                //         console.log('Email sent: ' + info.response);
                //     }
                //     });
                await wait(1 * 1000 * 60  ) // wait last integer minute 

            } else {
                console.log('Listeler boş olduğundan dolayı mail gönderilmeye gerek duyulmadı') 
                console.log('Requester list length: ' + users.length)
                await wait(1 * 1000 * 60) // wait last integer minute 
            }
        } 
       
        } catch(e) {console.log(e)}
    } 
}

test();