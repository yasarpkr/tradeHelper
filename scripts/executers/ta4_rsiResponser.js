// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../../config/sente.js');
const fs = require('fs');
const fsPromises = require('fs').promises;
const nodemailer = require('nodemailer');
const dateTime = require("node-datetime");
const axios = require('axios');
const TelegramBot = require("node-telegram-bot-api")


let test = async(altTop=150,neededPercantage = 200) => {

    const token = '6688357579:AAFpHoofp4gV6fUublHHi7yfVlTf6QR9FRI'
    const bot = new TelegramBot(token, { polling: true })
    let users = [];

    filePath = {}
    filePath.lst_ta4_4h = '../../config/lst_ta4_4h.out'

    async function readCsv(filePath) {
        const content = await fsPromises.readFile(filePath,'utf-8');
        return content;
    }

    bot.onText(/[r,R]si/, (msg) => {
        const chatId = msg.chat.id
        let makeYourChoiceString = 'Send interval you want ?\n'
        makeYourChoiceString += '-----------------------------------------\n'
        makeYourChoiceString += '[Rsi <= 30]                   , [oversold]\n'
        makeYourChoiceString += '[Rsi > 30 , Rsi <= 40]  , [weak]\n'
        makeYourChoiceString += '[Rsi > 40 , Rsi <= 50]  , [neutral1]\n'
        makeYourChoiceString += '[Rsi > 50 , Rsi <= 60]  , [neutral2]\n'        
        makeYourChoiceString += '[Rsi > 60 , Rsi <= 70]  , [strong]\n'
        makeYourChoiceString += '[Rsi > 70 , Rsi <= 80]  , [overbought]\n'
        makeYourChoiceString += '-----------------------------------------\n'

        bot.sendMessage(chatId,makeYourChoiceString)
        
    })
    bot.onText(/[o,O]versold/, async(msg) => {
        // console.log(rsp_lst_ta4_4h)
        const chatId = msg.chat.id
        lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
        lst_ta4_4h = JSON.parse(lst_ta4_4h)
        lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
        lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
        let lowerRsiList = [];
        // console.log(lst_ta4_4h)
        let count = 0
        for(let element of lst_ta4_4h){
            if(element.rsi6 < 30) {
                lowerRsiList[count] = {};
                lowerRsiList[count].coin = element.coin
                lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                count++;
            }
        }
        let stringMessage = ''
        // console.log(lowerRsiList)
        for(let element of lowerRsiList){
            stringMessage += JSON.stringify(element)+'\n'
        }
        stringMessage = stringMessage.replace(/"/g,'')
        stringMessage = stringMessage.replace(/coin:/g,'c:')
        stringMessage = stringMessage.replace(/,/g,' , ')
        console.log(stringMessage)
        lowerRsiList = JSON.stringify(lowerRsiList)
        console.log('Son durumda gönderilen string:\n')
        // console.log(lst_ta4_4h)
        bot.sendMessage(chatId,stringMessage)
    })
    bot.onText(/[w,W]eak/, async(msg) => {
        // console.log(rsp_lst_ta4_4h)
        const chatId = msg.chat.id
        lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
        lst_ta4_4h = JSON.parse(lst_ta4_4h)
        lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
        lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
        let lowerRsiList = [];
        console.log(`Kırpmadan önceki lowerRsiList listesinin boyutu: `+lowerRsiList.length)
        // console.log(lst_ta4_4h)
        let count = 0
        console.log(`Kırpmadan önceki lst_ta4_4h listesinin boyutu: `+lst_ta4_4h.length)
        for(let element of lst_ta4_4h){
            if(30 < element.rsi6 && element.rsi6 <= 40 ) {
                lowerRsiList[count] = {};
                lowerRsiList[count].coin = element.coin
                lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                // console.log(lowerRsiList.length)
                count++;
            }
        }
        console.log(`Kırptıktan sonraki lowerRsiList listesinin boyutu:  `+lowerRsiList.length)
        let stringMessage = ''
        for(let element of lowerRsiList){
            stringMessage += JSON.stringify(element)+'\n'
        }
        stringMessage = stringMessage.replace(/"/g,'')
        stringMessage = stringMessage.replace(/coin:/g,'c:')
        stringMessage = stringMessage.replace(/,/g,' , ')
        console.log(stringMessage)
        lowerRsiList = JSON.stringify(lowerRsiList)
        console.log('Son durumda gönderilen string:\n')
        // console.log(lst_ta4_4h)
        bot.sendMessage(chatId,stringMessage)
    })
    bot.onText(/[n,N]eutral1/, async(msg) => {
        // console.log(rsp_lst_ta4_4h)
        const chatId = msg.chat.id
        lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
        lst_ta4_4h = JSON.parse(lst_ta4_4h)
        lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
        lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
        let lowerRsiList = [];
        console.log(`Kırpmadan önceki lowerRsiList listesinin boyutu: `+lowerRsiList.length)
        // console.log(lst_ta4_4h)
        let count = 0
        console.log(`Kırpmadan önceki lst_ta4_4h listesinin boyutu: `+lst_ta4_4h.length)
        for(let element of lst_ta4_4h){
            if(40 < element.rsi6 && element.rsi6 <= 50 ) {
                lowerRsiList[count] = {};
                lowerRsiList[count].coin = element.coin
                lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                // console.log(lowerRsiList.length)
                count++;
            }
        }
        console.log(`Kırptıktan sonraki lowerRsiList listesinin boyutu:  `+lowerRsiList.length)
        let stringMessage = ''
        for(let element of lowerRsiList){
            stringMessage += JSON.stringify(element)+'\n'
        }
        stringMessage = stringMessage.replace(/"/g,'')
        stringMessage = stringMessage.replace(/coin:/g,'c:')
        stringMessage = stringMessage.replace(/,/g,' , ')
        console.log(stringMessage)
        lowerRsiList = JSON.stringify(lowerRsiList)
        console.log('Son durumda gönderilen string:\n')
        // console.log(lst_ta4_4h)
        bot.sendMessage(chatId,stringMessage)
    })
    bot.onText(/[n,N]eutral2/, async(msg) => {
         // console.log(rsp_lst_ta4_4h)
         const chatId = msg.chat.id
         lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
         lst_ta4_4h = JSON.parse(lst_ta4_4h)
         lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
         lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
         let lowerRsiList = [];
         console.log(`Kırpmadan önceki lowerRsiList listesinin boyutu: `+lowerRsiList.length)
         // console.log(lst_ta4_4h)
         let count = 0
         console.log(`Kırpmadan önceki lst_ta4_4h listesinin boyutu: `+lst_ta4_4h.length)
         for(let element of lst_ta4_4h){
             if(50 < element.rsi6 && element.rsi6 <= 60 ) {
                 lowerRsiList[count] = {};
                 lowerRsiList[count].coin = element.coin
                 lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                 lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                 // console.log(lowerRsiList.length)
                 count++;
             }
         }
         console.log(`Kırptıktan sonraki lowerRsiList listesinin boyutu:  `+lowerRsiList.length)
         let stringMessage = ''
         for(let element of lowerRsiList){
             stringMessage += JSON.stringify(element)+'\n'
         }
         stringMessage = stringMessage.replace(/"/g,'')
         stringMessage = stringMessage.replace(/coin:/g,'c:')
         stringMessage = stringMessage.replace(/,/g,' , ')
         console.log(stringMessage)
         lowerRsiList = JSON.stringify(lowerRsiList)
         console.log('Son durumda gönderilen string:\n')
         // console.log(lst_ta4_4h)
         bot.sendMessage(chatId,stringMessage)
    }) 
    bot.onText(/[s,S]trong/, async(msg) => {
        // console.log(rsp_lst_ta4_4h)
        const chatId = msg.chat.id
        lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
        lst_ta4_4h = JSON.parse(lst_ta4_4h)
        lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
        lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
        let lowerRsiList = [];
        console.log(`Kırpmadan önceki lowerRsiList listesinin boyutu: `+lowerRsiList.length)
        // console.log(lst_ta4_4h)
        let count = 0
        console.log(`Kırpmadan önceki lst_ta4_4h listesinin boyutu: `+lst_ta4_4h.length)
        for(let element of lst_ta4_4h){
            if(60< element.rsi6 && element.rsi6 <= 70 ) {
                lowerRsiList[count] = {};
                lowerRsiList[count].coin = element.coin
                lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                // console.log(lowerRsiList.length)
                count++;
            }
        }
        console.log(`Kırptıktan sonraki lowerRsiList listesinin boyutu:  `+lowerRsiList.length)
        let stringMessage = ''
        for(let element of lowerRsiList){
            stringMessage += JSON.stringify(element)+'\n'
        }
        stringMessage = stringMessage.replace(/"/g,'')
        stringMessage = stringMessage.replace(/coin:/g,'c:')
        stringMessage = stringMessage.replace(/,/g,' , ')
        console.log(stringMessage)
        lowerRsiList = JSON.stringify(lowerRsiList)
        console.log('Son durumda gönderilen string:\n')
        // console.log(lst_ta4_4h)
        bot.sendMessage(chatId,stringMessage)
    })            
    bot.onText(/[o,O]verbought/, async(msg) => {
        // console.log(rsp_lst_ta4_4h)
        const chatId = msg.chat.id
        lst_ta4_4h = await fsPromises.readFile(filePath.lst_ta4_4h,'utf-8');
        lst_ta4_4h = JSON.parse(lst_ta4_4h)
        lst_ta4_4h = lst_ta4_4h.lst_ta4_4h
        lst_ta4_4h.sort(function(a, b){return a.rsi6 - b.rsi6}); 
        let lowerRsiList = [];
        // console.log(lst_ta4_4h)
        let count = 0
        for(let element of lst_ta4_4h){
            if(element.rsi6 > 70 ) {
                lowerRsiList[count] = {};
                lowerRsiList[count].coin = element.coin
                lowerRsiList[count].rsi6 = parseInt(element.rsi6)
                lowerRsiList[count].rsi14 = parseInt(element.rsi14)
                count++;
            }
        }
        let stringMessage = ''
        // console.log(lowerRsiList)
        for(let element of lowerRsiList){
            stringMessage += JSON.stringify(element)+'\n'
        }
        stringMessage = stringMessage.replace(/"/g,'')
        stringMessage = stringMessage.replace(/coin:/g,'c:')
        stringMessage = stringMessage.replace(/,/g,' , ')
        console.log(stringMessage)
        lowerRsiList = JSON.stringify(lowerRsiList)
        console.log('Son durumda gönderilen string:\n')
        // console.log(lst_ta4_4h)
        bot.sendMessage(chatId,stringMessage)
    })  
}

test();