const contract = process.env.token.split(',')
const key = process.env.key
const etherurl = process.env.explorer
const rp = require("request-promise");
const fs = require('fs');

exports.initTokenABI = async () => {
  fs.readFile('./abi.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
      var contractList = []
      const contract = JSON.parse(data);
      process.env.abi = contractList.push(contract)
    } catch (err) {
        console.error('Error parsing JSON data:', err);
    }
  });
  // var contractList = []
  // for (const c of contract) {
  //   let sUrl = etherurl + '/api?module=contract&action=getabi&address='+c+'&apikey=' + key
  //   var abi = await rp({url: sUrl,method: 'get'})
  //   var res = JSON.parse(abi).result
  //   contractList.push(res)
  // }
  // process.env.abi = JSON.stringify(contractList)
}
