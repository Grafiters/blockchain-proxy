const RPC_URL = process.env.RPC_URL
const contractList       = process.env.token.split(',')
const abiList = JSON.parse(process.env.abi)


const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider(RPC_URL);
const solidityNode = new HttpProvider(RPC_URL);
const eventServer = new HttpProvider(RPC_URL)

const { ethers } = require("ethers")
const { utils } = require('ethers')

const AbiCoder = ethers.utils.AbiCoder;
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
// tronWeb.setHeader({"TRON-PRO-API-KEY": process.env.key});
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

async function decodeParams(types, output, ignoreMethodHash) {
  if (!output || typeof output === 'boolean') {
    ignoreMethodHash = output;
    output = types;
  }
  if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
    output = '0x' + output.replace(/^0x/, '').substring(8);

  const abiCoder = new AbiCoder();
  if (output.replace(/^0x/, '').length % 64)
    throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
    if (types[index] == 'address')
      arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
    obj.push(arg);
    return obj;
  }, []);
}

const createAccount = async () => {
  let result = await tronWeb.createAccount()
  return { address: result.address.base58, secret: result.privateKey }
};

const getHeight = async () => {
  var result = await tronWeb.trx.getCurrentBlock()
  return { height: result.block_header.raw_data.number }
};

const getBalance = async (request) => {
  const { address } = request.body
  var result = await tronWeb.trx.getBalance(address)
  return { balance: parseInt(result).toLocaleString('fullwide', { useGrouping: false }) }
};
const getTxInfo = async (request) => {
  const { hash } = request.body
  var result = {}
  result = await tronWeb.trx.getTransactionInfo(hash)
  let response = result.receipt.energy_fee
  return { fee: response }
};

const getTokenBalance = async (request) => {
  const { contractAddress, address } = request.body
  var result = await tronWeb.transactionBuilder.triggerSmartContract(contractAddress, "balanceOf(address)", {}, [{ type: 'address', value: address }], contractAddress);
  let outputs = '0x' + result.constant_result[0]
  let balance = await decodeParams(['uint256'], outputs, false)
  return { balance: parseInt(balance[0]._hex).toLocaleString('fullwide', { useGrouping: false }) }
};

const sendEther = async (request) => {
  const { to, amount, privKey } = request.body
  var result = await tronWeb.trx.sendTransaction(to, amount, privKey);
  return { hash: result.txid }
};

const sendToken = async (request) => {
  const { contractAddress, to, amount, privKey, from, feelimit } = request.body
  const tronWebWithPK = new TronWeb(fullNode, solidityNode, eventServer, privKey);
  const transaction = await tronWebWithPK.transactionBuilder.triggerSmartContract(
    contractAddress, "transfer(address,uint256)", { feeLimit: feelimit, callValue: 0 },
    [
      { type: "address", value: to },
      { type: "uint256", value: amount.toLocaleString('fullwide', { useGrouping: false }) }
    ]
  );
  const signTransaction = await tronWebWithPK.trx.sign(transaction.transaction);
  const result = await tronWebWithPK.trx.sendRawTransaction(signTransaction);
  return { hash: result.txid }
};

const fetchBlockSingle = async (request) => {
  let { from, to } = request.body
  to = to + 1
  var result = await tronWeb.trx.getBlockRange(from, to)
  var BlockTransaction = []
  let count = 1
  for (const block of result) {
    var txs = []
    let transactions = block.transactions
    if (transactions) {
      for (const tx of transactions) {
        try {
          let status = tx.ret[0].contractRet
        if (status === 'SUCCESS') {
          let txID = tx.txID
          let contract = tx.raw_data.contract[0]
          let value = contract.parameter.value
          let type = contract.type
          let from, to, amount, contractAddress, data, resultInput

          switch (type) {
            case 'TransferContract':
              from = tronWeb.address.fromHex(value.owner_address)
              to = tronWeb.address.fromHex(value.to_address)
              amount = value.amount.toLocaleString('fullwide', { useGrouping: false })
              txs.push({ type: 'TRX', txID: txID, from_address: from, to_address: to, amount: amount, contract: '' })
              break

            case 'TriggerSmartContract':
              data = value.data
              contractAddress = tronWeb.address.fromHex(value.contract_address)
              var isListed = contractList.includes(contractAddress)

              if (isListed) {
                var arrayIndex = 0
                resultInput = _extractInfoFromABI(data, abiList[arrayIndex]);
                let method = resultInput ? resultInput.method : null
                let typesInput = resultInput ? resultInput.typesInput : null
                let types = typesInput.map(function (x) { return x.replace('address', 'uint256') });
                let decode
                try {
                  decode = await decodeParams(types, data, true)
                } catch (e) { }
                if (decode && decode.length > 0) {
                  switch (method) {
                    case 'transfer':
                      from = tronWeb.address.fromHex(value.owner_address)
                      let to_address = decode[0]._hex.replace('0x41', '0x')
                      to_address.replace('0x', '41')
                      to = tronWeb.address.fromHex(to_address.replace('0x', '41'))
                      amount = parseInt(decode[1]._hex).toLocaleString('fullwide', { useGrouping: false })
                      txs.push({ type: 'TRC20', txID: txID, from_address: from, to_address: to, amount: amount, contract: contractAddress })
                      break;

                    case 'transferFrom':
                      from = tronWeb.address.fromHex(decode[0]._hex)
                      to = tronWeb.address.fromHex(decode[1]._hex)
                      amount = parseInt(decode[2]._hex).toLocaleString('fullwide', { useGrouping: false })
                      txs.push({ type: 'TRC20', txID: txID, from_address: from, to_address: to, amount: amount, contract: contractAddress })
                      break;
                  }
                }
              }
          }
        }
        } catch (error) {
          console.log(error);
          console.log(tx);
        }
      }
      let data = { height: block.block_header.raw_data.number, txs: txs }
      if (txs.length > 0) { BlockTransaction.push(data) }
    }
  }
  return BlockTransaction
};


const fetchBlock = async (request) => {
  let { from, to } = request.body
  if (to == from){
    to = to + 1
  }
  
  var result = await tronWeb.trx.getBlockRange(from, to)
  var BlockTransaction = []
  let count = 1
  for (const block of result) {
    var txs = []
    let transactions = block.transactions
    if (transactions) {
      for (const tx of transactions) {
        try {
          let status = tx.ret[0].contractRet
        if (status === 'SUCCESS') {
          let txID = tx.txID
          let contract = tx.raw_data.contract[0]
          let value = contract.parameter.value
          let type = contract.type
          let from, to, amount, contractAddress, data, resultInput
          switch (type) {
            case 'TransferContract':
              from = tronWeb.address.fromHex(value.owner_address)
              to = tronWeb.address.fromHex(value.to_address)
              amount = value.amount.toLocaleString('fullwide', { useGrouping: false })
              txs.push({ type: 'TRX', txID: txID, from_address: from, to_address: to, amount: amount, contract: '' })
              break

            case 'TriggerSmartContract':
              data = value.data
              contractAddress = tronWeb.address.fromHex(value.contract_address)
              var isListed = contractList.includes(contractAddress)

              if (isListed) {
                var arrayIndex = 0
                resultInput = _extractInfoFromABI(data, abiList);
                let method = resultInput ? resultInput.method : null
                let typesInput = resultInput ? resultInput.typesInput : null
                let types = typesInput.map(function (x) { return x.replace('address', 'uint256') });
                let decode
                try {
                  decode = await decodeParams(types, data, true)
                } catch (e) { }
                if (decode && decode.length > 0) {
                  switch (method) {
                    case 'transfer':
                      from = tronWeb.address.fromHex(value.owner_address)
                      let to_address = decode[0]._hex.replace('0x41', '0x')
                      to_address.replace('0x', '41')
                      to = tronWeb.address.fromHex(to_address.replace('0x', '41'))
                      amount = parseInt(decode[1]._hex).toLocaleString('fullwide', { useGrouping: false })
                      txs.push({ type: 'TRC20', txID: txID, from_address: from, to_address: to, amount: amount, contract: contractAddress })
                      break;

                    case 'transferFrom':
                      from = tronWeb.address.fromHex(decode[0]._hex)
                      to = tronWeb.address.fromHex(decode[1]._hex)
                      amount = parseInt(decode[2]._hex).toLocaleString('fullwide', { useGrouping: false })
                      txs.push({ type: 'TRC20', txID: txID, from_address: from, to_address: to, amount: amount, contract: contractAddress })
                      break;
                  }
                }
              }
          }
        }
        } catch (error) {
          console.log(error);
          console.log(tx);
        }
      }
      let data = { height: block.block_header.raw_data.number, txs: txs }
      if (txs.length > 0) { BlockTransaction.push(data) }
    }
  }
  return BlockTransaction
};

function _extractInfoFromABI(data, abi) {
  const dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex');
  const methodId = Array.from(dataBuf.subarray(0, 4), function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
  var inputsBuf = dataBuf.subarray(4);
  return abi.reduce((acc, obj) => {
    if (obj.type === 'constructor') return acc
    if (obj.type === 'event') return acc
    const method = obj.name || null
    let typesInput = obj.inputs ? obj.inputs.map(x => {
      if (x.type === 'tuple[]') {
        return x
      } else {
        return x.type
      }
    }) : [];

    let typesOutput = obj.outputs ? obj.outputs.map(x => {
      if (x.type === 'tuple[]') {
        return x
      } else {
        return x.type
      }
    }) : []

    let namesInput = obj.inputs ? obj.inputs.map(x => {
      if (x.type === 'tuple[]') {
        return ''
      } else {
        return x.name
      }
    }) : [];

    let namesOutput = obj.outputs ? obj.outputs.map(x => {
      if (x.type === 'tuple[]') {
        return ''
      } else {
        return x.name
      }
    }) : []
    const hash = _genMethodId(method, typesInput)
    if (hash === methodId) {
      let inputs = []

      inputs = utils.defaultAbiCoder.decode(typesInput, inputsBuf);

      return {
        method,
        typesInput,
        inputs,
        namesInput,
        typesOutput,
        namesOutput
      }
    }
    return acc;
  }, { method: null, typesInput: [], inputs: [], namesInput: [], typesOutput: [], namesOutput: [] });
}


function _genMethodId(methodName, types) {
  const input = methodName + '(' + (types.reduce((acc, x) => {
    acc.push(_handleInputs(x))
    return acc
  }, []).join(',')) + ')'
  return utils.keccak256(Buffer.from(input)).slice(2, 10)
}

function _handleInputs(input) {
  let tupleArray = false
  if (input instanceof Object && input.components) {
    input = input.components
    tupleArray = true
  }

  if (!Array.isArray(input)) {
    if (input instanceof Object && input.type) {
      return input.type
    }

    return input
  }

  let ret = '(' + input.reduce((acc, x) => {
    if (x.type === 'tuple') {
      acc.push(handleInputs(x.components))
    } else if (x.type === 'tuple[]') {
      acc.push(handleInputs(x.components) + '[]')
    } else {
      acc.push(x.type)
    }
    return acc
  }, []).join(',') + ')'

  if (tupleArray) {
    return ret + '[]'
  }
}

module.exports = {
  createAccount,
  getHeight,
  fetchBlockSingle,
  getBalance,
  getTokenBalance,
  sendEther,
  sendToken,
  fetchBlock,
  getTxInfo
};