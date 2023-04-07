// Imports
let ns = {};
const marketCapArray = require('./marketCap.js');
const {sendPostRequest,now,wait,fetchVolumeArray} = require('./sente.js');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Main function
let test = async () => {
    
    timeConfig = '1h' 

    // Some definitions before job start
    stringforFile = '';
    let topCoins = {};
    topCoins.old = [
        // [ 'BTC', 309.7511 ], [ 'ETH', 95.0621 ], 
        // [ 'XRP', 11.4657 ],  [ 'SOL', 6.5215 ],  
        // [ 'BNB', 6.486 ],    [ 'CFX', 6.0802 ],  
        // [ 'MATIC', 5.5024 ], [ 'DOGS', 5.2062 ], 
        // [ 'FTM', 4.9271 ],   [ 'LTC', 4.6652 ],  
        // [ 'APT', 3.8271 ],   [ 'TRX', 3.6806 ],  
        // [ 'ADA', 3.5406 ],   [ 'MASK', 3.3591 ], 
        // [ 'OP', 3.0702 ],    [ 'MAGIC', 2.7111 ],
        // [ 'LINK', 2.5425 ],  [ 'GALA', 2.2928 ], 
        // [ 'DYDX', 2.2545 ],  [ 'AGIX', 2.081 ] 
    ]
    let coinsArray = {};
    coinsArray.old = [];

    // Start job constantly with while (true)
        // Fetch all coin volume values data
        coinsArray.new = [];
        let timeValue = '1h'
        // Send post reques to ta4crypto.com
        let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)"]'
        let res = await sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})

        // Find data needed and sort it 
        let regExpression = 'data:.*'
        let stringNeeded = res.data.match(regExpression)[0]
        stringNeeded = stringNeeded.replace('data: ','')
        stringNeeded = stringNeeded.replace(']],',']]')
        arrayVolumeOfCoins = JSON.parse(stringNeeded)


        arrayVolumeOfCoins = [
            [ 'BTC', 130.9425],
            [ 'ETH', 75.1021 ],
            [ 'BNB', 4.0401 ],
            [ 'NEO', 0.3979 ],
            [ 'LTC', 3.8776 ],
            [ 'QTUM', 0.0885 ],
        ]

        addedVolumeIndex = arrayVolumeOfCoins;

        let count = 0
        for(let u_arrayVolumeOfCoins of arrayVolumeOfCoins){
            queFinded = false;
            for(let u_marketCapArray of marketCapArray){
                // if(coinsArray[0] == namesOfCoins.symbol){addedVolumeIndex[count].push(namesOfCoins.market_cap)}
                if(u_arrayVolumeOfCoins[0] == u_marketCapArray.symbol.toUpperCase()){
                    queFinded=true; 
                    indexOfVolumeDivededBy = u_arrayVolumeOfCoins[1] * 1000000 / u_marketCapArray.market_cap * 100 * 1000
                    indexOfVolumeDivededBy = indexOfVolumeDivededBy.toFixed(3)
                    console.log(indexOfVolumeDivededBy)
                    indexOfVolumeDivededBy = parseFloat(indexOfVolumeDivededBy)
                    addedVolumeIndex[count].push(indexOfVolumeDivededBy)
                    count ++
                    break;
                }                
            }
        }
        console.log(addedVolumeIndex)

            
    // Our sorting function
    addedVolumeIndex.sort(
        (p1, p2) => 
        (p1[2] < p2[2]) ? 1 : (p1[2] > p2[2]) ? -1 : 0);

    console.log(addedVolumeIndex)

    


    
}

test()