const axios = require('axios');

axios({
  url: 'https://lunarcrush.com/api3/stocks',
  headers: {
    'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
  },
})
.then(function (response) {
    console.log(response)

}).catch(err => {
    // Handle errors
    console.error(err);
});