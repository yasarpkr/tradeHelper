// IMPORTS

const axios = require('axios');
const fs = require('fs');
const dateTime = require('node-datetime');


// _____________________________________________________________________________________________________________________
// VARIABLES DEFINATIONS
let ns = {};

ns.sendPostRequest = async(url, data = {}, config = {}) => {
    config.timeout=30000;
    // console.log(`[Post Request]   ${url}`);
    // console.log(`[Payload Data:]`);
    // console.log(data);
    return axios.post(url, data, config)
        .then(async(res) => {
            return Promise.resolve(res);

        })
        .catch((error) => {
            return Promise.reject(error);
        })
}

ns.now = () => {
    dt = dateTime.create();
    return dt.format('Y-m-d H:M:S');
}

ns.wait = (milleseconds,decsription='',timeVisible=true) => {
    

    let time = timeVisible===true ? 'Wait '+milleseconds/1000+'sec ':''
    let desc = decsription!=='' ? '['+decsription+']':'';

    if(milleseconds>=5000) console.log(time+desc);

    
    return new Promise(resolve => setTimeout(resolve, milleseconds))
}

ns.fetchVolumeArray = async(timeValue) => {

    // Send post reques to ta4crypto.com
    let sessionid = 'filterbycoin=false; coinsfilters=; o2s-chl=ebda447adc6b735ea63eb640ef99795d; indicatorsfilters=["Market","Volume (M USDT)"]'
    let res = await ns.sendPostRequest(`https://ta4crypto.com/market-reports/${timeValue}/?filters=true`,{},{headers: {Cookie: `${sessionid}`}})
    // https://ta4crypto.com/market-reports/1h/?filters=true

    // Find data needed and sort it 
    let regExpression = 'data:.*'
    let stringNeeded = res.data.match(regExpression)[0]
    stringNeeded = stringNeeded.replace('data: ','')
    stringNeeded = stringNeeded.replace(']],',']]')
    stringNeeded = JSON.parse(stringNeeded)
    stringNeeded.sort(function(a, b){return b[1] - a[1]});
    return stringNeeded;
}

// _____________________________________________________________________________________________________________________
// EXPORT
module.exports = ns;