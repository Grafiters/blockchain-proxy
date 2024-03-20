'use strict'
const Blockchain = require('../controllers/blockchainController');

const {
  blockSchema,
  balanceSchema,
  balanceERC20Schema,
  sendSchema,
  sendTokenSchema,
  hashSchema,
  blockHeightSchema
} = require('../schema/schema');

module.exports = async function (fastify, opts) {
  fastify.get('/', async function () { return { message: 'TRON RPC API' } })
  fastify.get('/create-account', Blockchain.createAccount)
  fastify.get('/get-height', Blockchain.getHeight)
  fastify.post('/get-tx-info', { schema: hashSchema }, Blockchain.getTxInfo)
  fastify.post('/get-tron-balance', { schema: balanceSchema }, Blockchain.getBalance)
  fastify.post('/get-trc20-balance', { schema: balanceERC20Schema }, Blockchain.getTokenBalance)
  fastify.post('/send-transaction', { schema: sendSchema }, Blockchain.sendEther)
  fastify.post('/send-trc20', { schema: sendTokenSchema }, Blockchain.sendToken)
  fastify.post('/fetch-block', { schema: blockSchema }, Blockchain.fetchBlockSingle)
  fastify.post('/get-block-range', { schema: blockSchema }, Blockchain.fetchBlock)

}
