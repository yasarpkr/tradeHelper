const axios = require('axios');
const fs = require('fs');

let test = async () => {

  let getList = async () => {

    let data = {};

    await axios({
      url: 'https://lunarcrush.com/api3/coins?sort=alt_rank&limit=5&desc=1',
      headers: {
        'Authorization': 'Bearer tsu915q0rd8erfn63jc2un606blf9xjzmx7f2m06o',
      },
    })
    .then(function (response) {
      data = response.data.data
      return data
    })

    return data
    
  }
  
  let rsp_getList = await getList()
  console.log(rsp_getList)
  // first10Coins = [];
  // for(let a=rsp_getList.length - 1; a > rsp_getList.length - 3  ;a = a - 1){
  //   first10Coins.push(rsp_getList[a])
  // }
// console.log(first10Coins)
//   rsp_getList = JSON.stringify(rsp_getList)
//   console.log(rsp_getList)

//   // Write data in 'Output.txt' .
//   await fs.writeFile('coinListHam.js', JSON.stringify(rsp_getList), (err) => {
        
//   // In case of a error throw err.
//   if (err) throw err;
// })

}


test()





// console.log(resp)




