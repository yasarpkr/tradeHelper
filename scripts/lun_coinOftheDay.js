const axios = require('axios');

axios({
  url: 'https://lunarcrush.com/api3/coinoftheday',
  headers: {
    'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
  },
})
.then(function (response) {
console.log(response)

console.log('\nCOİN İSMİ' +'\n----------------------------\n' + response.data.name )

}).catch(err => {
  // Handle errors
  console.error(err);
});