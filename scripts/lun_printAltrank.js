// Imports
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
const fs = require('fs');
const axios = require('axios');
const altrankNew = require('../config/altrankList.js')

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
        fileString = 'let altrankListNew = [\n';
        for(let element of rsp_getList){
        fileString += '   '+JSON.stringify(element) + ',\n'
        }
        fileString += ']\n\nmodule.exports = altrankListNew;';

        // Write data in 'Output.txt' .
        await fs.writeFile('../config/altrankList.js',fileString, (err) => {
        if (err) throw err;
        })
    } 

    if(Array.isArray(altrankNew)){
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
            // Create old list
            altrankOld = altrankNew 
            fileString = 'let altrankListOld = [\n';
            for(let element of altrankOld){
            fileString += '   '+JSON.stringify(element) + ',\n'
            }
            fileString += ']\n\nmodule.exports = altrankListOld;\n';
            
            // Create new list
            fileString += 'let altrankListNew = [\n';
            for(let element of rsp_getList){
                fileString += '   '+JSON.stringify(element) + ',\n'
            }
            fileString += ']\n\nmodule.exports = altrankListNew;\n';
            
            // Write data in 'Output.txt' .
            await fs.writeFile('../config/altrankList.js',fileString, (err) => {
            if (err) throw err;
            }) 
        }
    }

}

test();