// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../../config/sente.js');
const fs = require('fs');
const axios = require('axios');

let test = async(altrankRange=1000) => {


    let altTextFile = '../../config/altrankList.txt'
    // Get altrank top 150 coins 
    let getList = async () => {
        let data = {};
        await axios({
        url: `https://lunarcrush.com/api3/coins?sort=alt_rank&limit=${altrankRange}&desc=1`,
        headers: {'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',}
        })
        .then(function (response) {
        data = response.data.data
        return data
        })
        return data
    }
    
    // Create file if does not exist
    fs.readFile(altTextFile,(err) => {
        if (err){
            fs.writeFile(altTextFile,'sdsd','utf8',(err) => {
            if(err) throw err
            })
        }
    ;});await wait(2000)
    
    // Create new and olt items - two different if clause
    fs.readFile(altTextFile,async(err,data) => {
        if(err) throw new Error(err)
        if(data.indexOf('New') < 0){
            console.log('Yeni altrank değerlerini içeren yeni array oluşturulacak...') 
            console.log(data.length)
            let rsp_getList = await getList()
            // Crate string with new elements
            let altString = `{\n"New" : [\n`
            let countA = 0
            for(let element of rsp_getList){
                if(countA !== rsp_getList.length - 1){
                    altString += '\n' + JSON.stringify(element) + ','
                } else {altString += '\n' + JSON.stringify(element) + '\n]\n}'} 
                countA++;
            }; //console.log(altString)
            
            // Write data in 'Output.txt' .
            fs.writeFile(altTextFile, altString, (err) => {
                if (err) throw err;
            })
        }
        if(data.indexOf('New') > 0){
            // Create string for old elements
            console.log('Eski değerler de txt ye eklenecek')
            parsedData = JSON.parse(data)
            Old = parsedData.New
            let altString = `{\n"Old" : [\n`
            let countB = 0
            for(let element of Old){
                if(countB !== Old.length - 1){
                    altString += '\n' + JSON.stringify(element) + ','
                } else {altString += '\n' + JSON.stringify(element) + '\n],\n'} 
                countB++;
            }; //console.log(altString)
            
            let rsp_getList = await getList()
            // Crate string for New elements
            altString += `\n"New" : [\n`
            let countC = 0
            for(let element of rsp_getList){
                if(countC !== rsp_getList.length - 1){
                    altString += '\n' + JSON.stringify(element) + ','
                } else {altString += '\n' + JSON.stringify(element) + '\n]\n}'} 
                countC++;
            } 

            // Write data in 'Output.txt' .
            fs.writeFile(altTextFile, altString, (err) => {
                if (err) throw err;
            })
        }
    })

}

test();