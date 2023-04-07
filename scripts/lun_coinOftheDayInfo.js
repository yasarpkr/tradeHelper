const axios = require('axios');

let resp = axios({
  url: 'https://lunarcrush.com/api3/coinoftheday/info',
  headers: {
    'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
  },
})
.then(function (response) {
  for(let i = 0 ; i<response.data.history.length ; i++){
    if (response.data.history[i].symbol == 'MATIC') {
      console.log(response.data.history[i]);
      return response.data.history[i];
    }
  }
})

console.log(resp)




