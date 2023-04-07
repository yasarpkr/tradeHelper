// Imports
let ns = {};
const {sendPostRequest,now,wait} = require('./sente.js');
const fs = require('fs');

// Main function
let test = async () => {
    let topCoins = {};
    let changedCoins = [];
    topCoins.old = [];

    while (true) {

        // Send post reques to ta4crypto.com
        let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)"]'
        let res = await sendPostRequest(`https://ta4crypto.com/market-reports/15m/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})
    
        // Find data needed and sort it 
        let regExpression = 'data:.*'
        let stringNeeded = res.data.match(regExpression)[0]
        stringNeeded = stringNeeded.replace('data: ','')
        stringNeeded = stringNeeded.replace(']],',']]')
        stringNeeded = JSON.parse(stringNeeded)
        stringNeeded.sort(function(a, b){return b[1] - a[1]});
        
        // Cut first 10 coins from array
        topCoins.new = [];
        for(let i = 0 ; i <= 10 ;i++){ 
            topCoins.new.push(stringNeeded[i])
        }

        // Print list of Coins with sorted volume
        console.log (`\n\n[${now()}] Top 10 Coin Volume List - [Config:15m] \n --------------------------------------------------------------------------------`)
        console.log(topCoins.new)

        // Compare old and new arrays of Coins
        if(topCoins.old.length > 0){
            
            changedCoins = [];
            for(let news of topCoins.new){
    
                coinisExist = false;
                for(let olds of topCoins.old){
                    if(news[0] == olds[0]) {coinisExist = true; break;}
                }

                if(coinisExist == false) {changedCoins.push(news[0])} 
            }
            console.log (`\n\n[${now()}] Changed Coin List \n ----------------------------------------`)
            if (changedCoins.length > 0 ) {console.log(changedCoins+'\n\n')} else {console.log('**** BOS ****\n\n')}
                    
        }
        
        // Change new one as old
        topCoins.old = topCoins.new 
        await wait(10 * 60 * 10)
    }

}

test()