// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../../config/sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const axios = require('axios');

let test = async(mailaddress="yasillunar@outlook.com") => {
   
    let textFile = '../../config/smaList.txt'
    fs.readFile(textFile,'utf8',async(err,data) => {
        if(err) throw new Error(err)
        if(data.indexOf(`"New"`) > 0 && data.indexOf(`"Old"`)){
            parsedData = JSON.parse(data)
            Old = parsedData.Old
            New = parsedData.New
            // // Create break values of new list
            let breakList = {};
            breakList.new = [];
            countA = 0;
            for(let element of New){
                breakList.new[countA] = {};
                breakList.new[countA].coin = element.coin
                breakList.new[countA].price = element.price
                breakList.new[countA].breaks = {};
                if(element.sma12 <= element.sma25) {breakList.new[countA].breaks.sma25 = 'OK'} else {breakList.new[countA].breaks.sma25 = 'Below'}
                if(element.sma12 <= element.sma50) {breakList.new[countA].breaks.sma50 = 'OK'} else {breakList.new[countA].breaks.sma50 = 'Below'}
                if(element.sma12 <= element.sma99) {breakList.new[countA].breaks.sma99 = 'OK'} else {breakList.new[countA].breaks.sma99 = 'Below'}
                countA++;
            } 

            // Create break values of old list
            breakList.old = [];
            countB = 0;
            for(let element of Old){
                breakList.old[countB] = {};
                breakList.old[countB].coin = element.coin
                breakList.old[countB].price = element.price
                breakList.old[countB].breaks = {};
                if(element.sma12 <= element.sma25) {breakList.old[countB].breaks.sma25 = 'OK'} else {breakList.old[countB].breaks.sma25 = 'Below'}
                if(element.sma12 <= element.sma50) {breakList.old[countB].breaks.sma50 = 'OK'} else {breakList.old[countB].breaks.sma50 = 'Below'}
                if(element.sma12 <= element.sma99) {breakList.old[countB].breaks.sma99 = 'OK'} else {breakList.old[countB].breaks.sma99 = 'Below'}
                countB++;
            }

            // Compare elements of two different array
            let breaksChanged = [];
            let countC = 0;
            for(let element of breakList.old){
                if(element.breaks.sma25 == 'Below' || element.breaks.sma50 == 'Below' || element.breaks.sma99 == 'Below' ){
                    findInNewList = false;
                    for(let element2 of breakList.new){
                        if(element.coin == element2.coin){
                            findInNewList = true;
                            if((element.breaks.sma25 == 'Below' && element2.breaks.sma25 == 'OK') || (element.breaks.sma50 == 'Below' && element2.breaks.sma50 == 'OK') || (element.breaks.sma99 == 'Below' && element2.breaks.sma99 == 'OK') ){
                                breaksChanged[countC] = {};
                                breaksChanged[countC].coin = element.coin
                                breaksChanged[countC].price = element.price
                                breaksChanged[countC].sma25 = element2.breaks.sma25;
                                breaksChanged[countC].sma50 = element2.breaks.sma50;
                                breaksChanged[countC].sma99 = element2.breaks.sma99;
                                breaksChanged[countC].changes = '';                            
                                if(element.breaks.sma25 == 'Below' && element2.breaks.sma25 == 'OK') {breaksChanged[countC].changes += 'Broke-[25]~'}
                                if(element.breaks.sma50 == 'Below' && element2.breaks.sma50 == 'OK') {breaksChanged[countC].changes += 'Broke-[50]~'}
                                if(element.breaks.sma99 == 'Below' && element2.breaks.sma99 == 'OK') {breaksChanged[countC].changes += 'Broke-[99]~'}
                                countC++;
                            }
                        break;
                        }
                    }
                    if (findInNewList == false){
                        breaksChanged[countC] = {};
                        breaksChanged[countC].coin = element.coin
                        breaksChanged[countC].state = 'Not found in new list'
                        countC++;
                    }
                }
            }

            if(breaksChanged.length > 0){
                stringMail = ''
                stringMail += `\n[${now()}] - (1D) M Avarage Cross List \n ------------------------------------------------------\n`
                for(let element of breaksChanged){
                    stringMail += JSON.stringify(element) + '\n'
                }  

                stringMail += '\n\n ~~~~ Powered by İlker and Yasar ~~~~'
                console.log(stringMail)

                var transporter = nodemailer.createTransport({
                    host: "smtp-mail.outlook.com", // hostname
                    secureConnection: false, // TLS requires secureConnection to be false
                    port: 587, // port for secure SMTP
                    auth: {
                        user: mailaddress,
                        pass: "368-93Ya"
                    },
                    tls: {
                        ciphers:'SSLv3'
                    }
                });
                    
                var mailOptions = {
                    from: mailaddress,
                    to: 'yasarpeker08@gmail.com,ilkernz@gmail.com',
                    subject: `[Yas,ikr] - Validate Sma 1D - [like coin:${breaksChanged[0].coin}] - [${now()}]`,
                    text: stringMail
                };
                    
                await transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });

            } else {
                console.log(`[${now()}] - Bugün getirilen değerlerde M Avarage broked görülmemektedir`)
               }

    } else {
        throw new Error(`[${now()}} - ${textFile} de gerekli datalar bulunmamaktadır`)
        }
    
    })

}

test();