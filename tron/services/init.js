const contract = process.env.token.split(',')
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
// const fullNode = new HttpProvider("https://api.trongrid.io");
// const solidityNode = new HttpProvider("https://api.trongrid.io");
// const eventServer = new HttpProvider("https://api.trongrid.io");
const fs = require('fs');

// const tronWeb = new TronWeb(fullNode,solidityNode,eventServer);
// tronWeb.setHeader({"TRON-PRO-API-KEY": process.env.key});

exports.initTokenABI = async () => {
  fs.readFile('./abi.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        const contractList = JSON.parse(data);
        const contract = JSON.stringify(contractList)

        process.env.abi = contract
    } catch (err) {
        console.error('Error parsing JSON data:', err);
    }
  });
  // var contractList = []
  // for (const c of contract) {
  //   var result = await tronWeb.trx.getContract(c)
  //   contractList.push(result.abi.entrys)
  // }
}
