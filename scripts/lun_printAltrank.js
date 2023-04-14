// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const axios = require('axios');
const list = require('../config/altrankList.js');
const altrankNew = list.altrankNew;

let test = async() => {

    // Get altrank top 150 coins 
    let altrankRange = '1000'
    let getList = async () => {

        let data = {};
    
        await axios({
        url: `https://lunarcrush.com/api3/coins?sort=alt_rank&limit=${altrankRange}&desc=1`,
        headers: {
            'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
        }
        })
        .then(function (response) {
        data = response.data.data
        return data
        })
    
        return data
        
    }

    let rsp_getList = await getList()
    if(!Array.isArray(altrankNew)){
        console.log('altrankNew bir dizi değildir')
        fileString = 'let altrankNew = [\n';
        for(let element of rsp_getList){
        fileString += '   '+JSON.stringify(element) + ',\n'
        }
        fileString += ']\n\nexports.altrankNew = altrankNew; \n';

        // Write data in 'Output.txt' .
        await fs.writeFile('../config/altrankList.js',fileString, (err) => {
        if (err) throw err;
        })
    } 

    if(Array.isArray(altrankNew)){
        console.log('altrankNew bir dizidir eski değerleri ile eşitliği kontrol ediliyor')
        // Control new Array is equal to old or not 
        equalArrays = true
        for(let a = 0 ;a < 50; a++){
            if(rsp_getList[a].s !== altrankNew[a].s){
                equalArrays = false;
                console.log(a)
                console.log(rsp_getList[a].s)
                console.log(altrankNew[a].s)
                break;
            }
        }
        if(equalArrays == true){console.log('Altrank Listesi zaten eşittir')}
        else{
            console.log('Altrank değerleri eskileri ile eşit değildir') 
            // Create old list
            altrankOld = altrankNew 
            fileString = 'let altrankOld = [\n';
            for(let element of altrankOld){
            fileString += '   '+JSON.stringify(element) + ',\n'
            }
            fileString += ']\n\nexports.altrankOld = altrankOld;\n';
            
            // Create new list
            fileString += 'let altrankNew = [\n';
            for(let element of rsp_getList){
                fileString += '   '+JSON.stringify(element) + ',\n'
            }
            fileString += ']\n\nexports.altrankNew = altrankNew;\n';
            
            // Write data in 'Output.txt' .
            await fs.writeFile('../config/altrankList.js',fileString, (err) => {
            if (err) throw err;
            }) 
        }
    }

}

test();