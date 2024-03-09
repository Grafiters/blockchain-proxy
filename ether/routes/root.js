'use strict'
const Blockchain = require('../controllers/blockchainController');

const {
  blockSchema,
  balanceSchema,
  balanceERC20Schema,
  sendSchema,
  sendTokenSchema,
} = require('../schema/schema');

module.exports = async function (fastify, opts) {
  fastify.get('/', async function () {return { message: 'Ethereum RPC API' }})
  fastify.get('/create-account', Blockchain.createAccount)
  fastify.get('/get-height', Blockchain.getHeight)
  fastify.get('/gas-price', Blockchain.getGasPrice)
  fastify.post('/get-ether-balance',{schema: balanceSchema }, Blockchain.getBalance)
  fastify.post('/get-smart-contract-balance',{schema: balanceERC20Schema }, Blockchain.getTokenBalance)
  fastify.post('/send-transaction',{schema: sendSchema }, Blockchain.sendEther)
  fastify.post('/send-ERC20-transaction',{schema: sendTokenSchema }, Blockchain.sendToken)
  fastify.post('/fetch-block',{schema: blockSchema }, Blockchain.fetchBlock)
}
