const contract = process.env.token.split(',')
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io")

const tronWeb = new TronWeb(fullNode,solidityNode,eventServer);
tronWeb.setHeader({"TRON-PRO-API-KEY": process.env.key});

exports.initTokenABI = async () => {
  var contractList = []
  for (const c of contract) {
    var result = await tronWeb.trx.getContract(c)
    contractList.push(result.abi.entrys)
  }
  process.env.abi = JSON.stringify(contractList)
}
