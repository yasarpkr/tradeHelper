// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const avarageList15m = require('../config/15mAvarageList_4hBased.js')


let test = async() => {

    // Define arrays
    let dataListOld = [];

    while(true){

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
            await wait(1 * 1000 * 5 ) // wait last integer minute
            maintainCalculation = false; // console.log(dataListOld)
        }  

        if(dataListOld.length > 0 && dataListNew[0].fifteenminVPower == dataListOld[0].fifteenminVPower && dataListNew[1].fifteenminVPower == dataListOld[1].fifteenminVPower && dataListNew[2].fifteenminVPower == dataListOld[2].fifteenminVPower && dataListNew[3].fifteenminVPower == dataListOld[3].fifteenminVPower && dataListNew[4].fifteenminVPower == dataListOld[4].fifteenminVPower && dataListNew[5].fifteenminVPower == dataListOld[5].fifteenminVPower) {
                
            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler esittir. Mail gönderilmeyecek`) ;
            triggerMail = false;
            maintainCalculation = true 
            await wait(1 * 1000 * 60 ) // wait last integer minute} 

        } else {
            console.log(`\n\n[${now()}] - [INFO] - Getirilen değerler değişti. Hesaplama sürdürülüyor`) ;
            let upperList = [];

            // Get Upper values of the list
            let neededPercantage = 250;
            count = 0;
            for (let element3 of dataListNew){
                if (element3.fifteenminVPower > neededPercantage && (element3.rsi6 > 40 || element3.rsi14 > 40)){
                    upperList.push(element3)
                    count++;
                }
            
            }
            upperList.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower}); // console.log(upperList)

            countB = 0;
            for(let x = 0 ; x < upperList.length ; x++){
                upperList[x].breaks = {};
                countB++;
            };    // console.log(upperList)
    
            // Checks break of ema at last candle
            countP = 0;
            for(let elementNew of upperList) {
                for(let elementOld of dataListOld){
                    if(elementNew.coin == elementOld.coin){

                        // Check ema negative of new candle
                        if (elementOld.ema12 < 0 && elementNew.ema12 > 0){
                            upperList[countP].breaks.ema12 = 'OK'
                        } else {
                            upperList[countP].breaks.ema12  = 'Below'
                        }
                        
                        if (elementOld.ema25 < 0 && elementNew.ema25 > 0){
                            upperList[countP].breaks.ema25 = 'OK'
                        } else {
                            upperList[countP].breaks.ema25 = 'Below'
                        }
                        
                        if (elementOld.ema50 < 0 && elementNew.ema50 > 0){
                            upperList[countP].breaks.ema50 = 'OK'
                        } else {
                            upperList[countP].breaks.ema50= 'Below'
                        }
                    break;   
                    }
                }
                countP++
            }      

            dataListOld = dataListNew; // console.log(upperList)

            // mailListOf = [];
            watchList = [];
            count = 0;
            for(let element of upperList){
                if (element.breaks.ema50 == 'OK') { // it will change as 2 or 3 later
                watchList[count] = {};
                watchList[count].coin = element.coin;
                watchList[count].rsi6 = element.rsi6;
                watchList[count].fifteenminVPower = element.fifteenminVPower;
                watchList[count].breaks = element.breaks;        
                count++;
                }
            }

            // Mail watchlist 
            if(watchList.length > 0){
                stringforFile = '';
                stringforFile += `[${now()}] - 15 min VolumePowed Coin List - With BreakCount \n ------------------------------------------------------\n`
                for(element of watchList){
                    stringforFile += JSON.stringify(element) + '\n\n'
                }
        
                // Get list of lunarcrush links
                linkListOfLunar = [];
                count  = 0
                for(let elements of watchList){
                    // link pattern : https://lunarcrush.com/coins/uma/stafi?metric=close%2Csocial_score%2Calt_rank
                    coinName = elements.coin.toLowerCase()
                    linkListOfLunar[count] = {};
                    linkListOfLunar[count].coin = coinName
                    linkListOfLunar[count].link = `https://lunarcrush.com/coins/${coinName}/stafi?metric=close%2Csocial_score%2Calt_rank`
                    count ++;
                }
        
                stringforFile += `\n\n\n[${now()}] - Coin link list in lunar crush . You can check! \n ------------------------------------------------------\n`
                for(element of linkListOfLunar){
                    stringforFile += JSON.stringify(element) + '\n\n'
                }
                // console.log(linkListOfLunar)
                stringforFile += '\n\n ~~~~ Powered by İlker and Yasar ~~~~'
                console.log(stringforFile)
                
        
                var transporter = nodemailer.createTransport({
                    host: "smtp-mail.outlook.com", // hostname
                    secureConnection: false, // TLS requires secureConnection to be false
                    port: 587, // port for secure SMTP
                    auth: {
                        user: "lunarboatPi@outlook.com",
                        pass: "368-93Ya"
                    },
                    tls: {
                        ciphers:'SSLv3'
                    }
                });
                    
                var mailOptions = {
                    from: 'lunarboatPi@outlook.com',
                    to: 'yasarpeker08@gmail.com,ilkernz@gmail.com',
                    subject: 'Sending Email using Node.js',
                    text: stringforFile
                };
                    
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(`\n\n[${now()}] - [INFO] - Mail gönderildi ${info.response}`) ;
                    }
                });
                console.log('[INFO] - Mail gönderildi')
                await wait(1 * 1000 * 60 )
           } else {
                console.log(`\n\n[${now()}] - [INFO] - Break eden bir candle yok zaten. Mail gönderilmedi`) ;
                await wait(1 * 1000 * 60 ) // wait last integer minute   
              }
        }       
    } 
}

test();