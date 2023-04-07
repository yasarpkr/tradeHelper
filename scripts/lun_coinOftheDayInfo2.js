const axios = require('axios');

let test = async () => {

  let getList = async () => {

    let data = {};

    await axios({
      url: 'https://lunarcrush.com/api3/coinoftheday/info',
      headers: {
        'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
      },
    })
    .then(function (response) {
      for(let i = 0 ; i<response.data.history.length ; i++){
        if (response.data.history[i].symbol == 'MATIC') {
          // console.log(response.data.history[i]);
          data = response.data.history[i];
        }
      }
    })
    return data
    
  }
  
  let resp = await getList()
  console.log(resp)

}


test()





// console.log(resp)




