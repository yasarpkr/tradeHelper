// Imports
let ns = {};
const marketCapArray = require('../config/marketCap.js');
const {sendPostRequest,now,wait,fetchVolumeArray} = require('../config/sente.js');
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
    while(true){
        // Fetch all coin volume values data
        coinsArray.new = [];
        coinsArray.new = await fetchVolumeArray(timeConfig);
                        // console.log(coinsArray) 
                        
        // Cut coins desired , push to new array 
        topCoins.new = [];
        countofCoin = 39;
        triggerMail = false;

        for(let i = 0 ; i <= countofCoin ;i++){ 
            topCoins.new.push(coinsArray.new[i])
        }
                        // console.log(topCoins.new)
                        // topCoins.new = [
                        //     [ 'BTC', 309.7511 ], [ 'ETH', 95.0621 ],
                        //     [ 'XRP', 11.4657 ],  [ 'SOL', 6.5215 ],
                        //     [ 'BNB', 6.486 ],    [ 'CFX', 6.0802 ],
                        //     [ 'MATIC', 5.5024 ], [ 'DOGE', 5.2062 ],
                        //     [ 'FTM', 4.9271 ],   [ 'LTC', 4.6652 ],
                        //     [ 'APT', 3.8271 ],   [ 'TRX', 3.6806 ],
                        //     [ 'ADA', 3.5406 ],   [ 'MASK', 3.3591 ],
                        //     [ 'OP', 3.0702 ],    [ 'GLMR', 2.7111 ],
                        //     [ 'LINK', 2.5425 ],  [ 'GALA', 2.2928 ],
                        //     [ 'DYDX', 2.2545 ],  [ 'AGIX', 2.081 ]
                        // ]
        
        // Print new list of coins
        topCoinsAddChange = topCoins.new
        // console.log(topCoins.new)

        // Compare old and new arrays 
        if(topCoins.old.length > 0){
            let countCoinsAddChange = 0
            for(let i of topCoins.new){
                        // console.log(i[1])

                // Add percantages
                findValue = false
                let percantage;
                for(let a of topCoins.old){
                    if(i[0] == a[0]) {

                        percantage = ((i[1]-a[1])/a[1]) * 100;
                        percantage = percantage.toFixed(2)
                        topCoinsAddChange[countCoinsAddChange].push(`Changed: %${percantage}`)
                        findValue = true
                        break;
                    }
                }
                // What if it is not in old array, research in general list
                if(findValue == false && coinsArray.old.length > 0 ) {    
                    for(let x of coinsArray.old){
                        if(i[0] == x[0]) {
        
                            percantage = ((i[1]-x[1])/x[1]) * 100;
                            percantage = percantage.toFixed(2)
                            topCoinsAddChange[countCoinsAddChange].push(`Changed: %${percantage} , [New Coin]`)
                            findValue = true
                            break;
                        }
                    }
                }

            countCoinsAddChange++
            }

            // Decide mail will be sent or not ?
            for (a=0 ; a<topCoins.new.length ; a++){
                if(topCoins.new[a][0] !== topCoins.old[a][0]){triggerMail = true;break;}
            }            
        }

        
        // Create results as log , print them all
        console.log (`\n\n[${now()}] Top ${countofCoin+1} Coin Volume Change List - [Config:${timeConfig}] \n --------------------------------------------------------------------------------`)
        stringforFile += `\n\n[${now()}] Top ${countofCoin+1} Coin Volume Change List - [Config:${timeConfig}] \n--------------------------------------------------------------------------------\n`
        console.log(topCoinsAddChange)
        let countofLastList = 1
        for (let a of topCoinsAddChange) {stringforFile += `${countofLastList} - [${a}]\n` ; countofLastList++}
    
        // Revers new arrays as old 
        topCoins.old = topCoins.new;
        coinsArray.old = coinsArray.new;

                        // // Write data in 'Output.txt' .
                        // await fs.writeFile('text.txt', stringforFile, (err) => {       
                        //     // In case of a error throw err.
                        //     if (err) throw err;
                        // })
        console.log('\n\n')

        // Send e-mail
        // console.log(triggerMail)
        if(triggerMail == false) console.log('[INFO] - Tüm değerler eşit mail gönderilmeyecek')
        if(triggerMail == true) console.log('[INFO] - Mail gönderilecek')
        if(triggerMail == true) {
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
                to: 'ilkernz@gmail.com,yasarpeker08@gmail.com',
                subject: 'Sending Email using Node.js',
                text: stringforFile
            };
                
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    // await wait(1 * 1000 * 60  ); // Test wait
    await wait(1 * 1000 * 60 * 30); // Long term wait 
    }
    
}

test()