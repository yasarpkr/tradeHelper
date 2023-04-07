// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const avarageList15m = require('../config/15mAvarageList_4hBased.js')


let test = async() => {

    // Define arrays
    let dataListOld = [];
    let watchListAll =  [];

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

        // if(dataListOld.length > 0 && dataListNew[0].fifteenminVPower == dataListOld[0].fifteenminVPower && dataListNew[1].fifteenminVPower == dataListOld[1].fifteenminVPower && dataListNew[2].fifteenminVPower == dataListOld[2].fifteenminVPower ) {
            
        //     console.log('\n\n[INFO] - Getirilen değerler esittir. Mail gönderilmeyecek') ;
        //     triggerMail = false;
        //     maintainCalculation = true 
        //     await wait(1 * 1000 * 10 ) // wait last integer minute} 
         else {
            console.log('\n\n[INFO] - Getirilen değerler değişti. Hesaplama sürdürülüyor') ;
            let upperList = [];

            // Get Upper values of the list
            let neededPercantage = 100;
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
                upperList[x].breakCount = 0;
                countB++;
            };   // console.log(upperList)
    
            // Checks break of ema at last candle
            count = 0;
            for(let elementNew of upperList) {
                for(let elementOld of dataListOld){
                    if(elementNew.coin == elementOld.coin){

                        // Check ema negative of new candle
                        if (elementOld.ema12 < 0 && elementNew.ema12 > 0){
                            upperList[count].breakCount ++

                        }   
                        if (elementOld.ema25 < 0 && elementNew.ema25 > 0){
                            upperList[count].breakCount ++
                        }   
                        if (elementOld.ema50 < 0 && elementNew.ema50 > 0){
                            upperList[count].breakCount ++
                        }
                    break;   
                    }
                }
                count++
            }      
            
            // console.log(upperList)
            dataListOld = dataListNew; // console.log(upperList)

            // mailListOf = [];
            watchList = [];
            count = 0;
            
            upperList = [
                {
                    coin: 'FLOW',
                    rsi6: 53.543,
                    fifteenminVPower: 108.8,
                    breakCount: 3
                  },
                  {
                    coin: 'RIF',
                    rsi6: 52.572,
                    fifteenminVPower: 108.095,
                    breakCount: 2
                  },
                  {
                    coin: 'BNB',
                    rsi6: 45.095,
                    fifteenminVPower: 109.896,
                    breakCount: 0
                  }
            ]
            
            // Time definitions
            const date = new Date();
            currentHour = date.getHours();
            currentMin = date.getMinutes();
            (currentHour < 10) ? currentHour = '0' +currentHour : ''
            dt = dateTime.create(); currentDate = dt.format('Y-m-d')+' '+currentHour+':'+currentMin;
            console.log(currentDate)

            for(let element of upperList){
                if (element.breakCount > 0) { // it will change as 2 or 3 later
                watchList[count] = {};
                watchList[count].coin = element.coin;
                watchList[count].rsi6 = element.rsi6;
                watchList[count].fifteenminVPower = element.fifteenminVPower;
                watchList[count].breakCount = element.breakCount;        
                watchList[count].candleTime = currentDate;        
                count++;
                }
            }


            console.log(watchList)
            // // console.log(watchList)
            // for(let elementNew of watchList){
            //     alreadyExist = false
            //     for(let elementInWatch of watchListAll ){
            //         if(elementNew.coin == elementInWatch.coin){alreadyExist = true;break}
            //     }
            //     if(alreadyExist == false){watchListAll.push(elementNew)}
            // }

            // console.log('Upper list dizi boyutu:' + watchList.length)
            // console.log('Takip listesi dizi boyutu:' + watchListAll.length)
            // console.log(watchListAll)

            // await wait(1 * 1000 * 10 ) // wait last integer minute   
           
        }       

 
    } 

}

test();