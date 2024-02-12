const contract = process.env.token.split(',')
const key = process.env.key
const etherurl = process.env.explorer
const rp = require("request-promise");

exports.initTokenABI = async () => {
  var contractList = []
  for (const c of contract) {
    let sUrl = etherurl + '/api?module=contract&action=getabi&address='+c+'&apikey=' + key
    var abi = await rp({url: sUrl,method: 'get'})
    var res = JSON.parse(abi).result
    contractList.push(res)
  }
  process.env.abi = JSON.stringify(contractList)
}
