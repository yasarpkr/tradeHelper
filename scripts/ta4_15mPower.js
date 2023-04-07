// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const avarageList15m = require('../config/15mAvarageList_4hBased.js')


let test = async() => {

    // Define arrays
    coinAndVolume_addProps = {};
    coinAndVolume_addProps.old = [];

    // while(true){
                // console.log(avarageList15m);
        
        // Send post request and get 15m  volume value , adress: // https://ta4crypto.com/market-reports/1h/?filters=true
        let timeValue = '15m'
        let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)","RSI 6","RSI 14","MACD Divergence/CLOSE (%)"]'
        let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})             

        // Find data as [coin, 15mvolume] and sort it 
        let regExpression = 'data:.*'
        let stringNeeded = res.data.match(regExpression)[0]
        stringNeeded = stringNeeded.replace('data: ','')
        stringNeeded = stringNeeded.replace(']],',']]')
        coinAndVolume = JSON.parse(stringNeeded)
        coinAndVolume.sort(function(a, b){return b[1] - a[1]});
                // console.log(coinAndVolume);

        // Change stucture of Array like [{},{}]
        startCount = 0;
        coinAndVolume_addProps.new = [];
        for(let element of coinAndVolume){
            coinAndVolume_addProps.new[startCount] = {};
            coinAndVolume_addProps.new[startCount].coin = element[0]
            coinAndVolume_addProps.new[startCount].fiftMinV = element[1]
            coinAndVolume_addProps.new[startCount].rsi6 = element[2]
            coinAndVolume_addProps.new[startCount].rsi14 = element[3]
            coinAndVolume_addProps.new[startCount].macdClose = element[4]
            startCount++;
        }

             // console.log(avarageList15m)
             // console.log(coinAndVolume_addProps.new)

        // Compare 2 data , push power value to new array
        startCount = 0;
        for(let element of coinAndVolume_addProps.new){
            for (element_avarage of avarageList15m){
                        // console.log (element.coin)
                        // console.log (element_avarage.coin)
                if(element.coin == element_avarage.coin) {
                            // console.log(element.fiftMinV)
                            // console.log(element_avarage.fifteenMinAvgV)
                    fifteenminVPower = (element.fiftMinV / element_avarage.fifteenMinAvgV * 100)
                    fifteenminVPower = parseFloat(fifteenminVPower.toFixed(3))
                    coinAndVolume_addProps.new[startCount].fifteenminVPower = fifteenminVPower
                    break;
                }
            }
            startCount ++;
        }


                // console.log(coinAndVolume_addProps.new)
        coinAndVolume_addProps.new.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower}); 
        triggerMail = true;
        if(coinAndVolume_addProps.old.length > 0   && coinAndVolume_addProps.new[0].fifteenminVPower == coinAndVolume_addProps.old[0].fifteenminVPower) {
            console.log('\n\n[INFO] - Getirilen değerler esittir') ;
            triggerMail = false;

        }

        coinAndVolume_addProps.old = coinAndVolume_addProps.new;

        // Send e-mail
        if(triggerMail == true){
            console.log('\n\n[INFO] - Getirilen değerlerde farklılık var mail tetiklendi\n')
                    // console.log(coinAndVolume_addProps)

            coinAndVolume_addPropsUpperValue = [];

            // Get Upper values of the list
            let neededPercantage = 400;
            let count = 0;
            for (let element of coinAndVolume_addProps.new){
                if (element.fifteenminVPower > neededPercantage && (element.rsi6 > 50 || element.rsi14 > 50)){
                    coinAndVolume_addPropsUpperValue.push(element)
                    count ++
                }
            
            }
            coinAndVolume_addPropsUpperValue.sort(function(a, b){return b.fifteenminVPower - a.fifteenminVPower});
            // console.log(coinAndVolume_addPropsUpperValue)
            stringforFile = '';
            stringforFile += `[${now()}] - 15 min VolumePowed Coin List \n ------------------------------------------------------\n`
            for(element of coinAndVolume_addPropsUpperValue){
                stringforFile += JSON.stringify(element) + '\n\n'
            }

            // Get list of lunarcrush links
            linkListOfLunar = [];
            count  = 0
            for(let elements of coinAndVolume_addPropsUpperValue){
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
            

        //     var transporter = nodemailer.createTransport({
        //         host: "smtp-mail.outlook.com", // hostname
        //         secureConnection: false, // TLS requires secureConnection to be false
        //         port: 587, // port for secure SMTP
        //         auth: {
        //             user: "lunarboatPi@outlook.com",
        //             pass: "368-93Ya"
        //         },
        //         tls: {
        //             ciphers:'SSLv3'
        //         }
        //     });
                
        //     var mailOptions = {
        //         from: 'lunarboatPi@outlook.com',
        //         to: 'yasarpeker08@gmail.com,ilkernz@gmail.com',
        //         subject: 'Sending Email using Node.js',
        //         text: stringforFile
        //     };
                
        //     transporter.sendMail(mailOptions, function(error, info){
        //         if (error) {
        //             console.log(error);
        //         } else {
        //             console.log('Email sent: ' + info.response);
        //         }
        //     });
        }
        
        await wait(1 * 1000 * 60 * 1) // wait last integer minute

    // }

}

test();