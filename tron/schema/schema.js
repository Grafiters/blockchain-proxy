exports.blockHeightSchema = {
  body: {
    type: 'object',
    required: ['height'],
    properties: {
      height: { type: 'number' }
    },
  },
};

exports.blockSchema = {
  body: {
    type: 'object',
    required: ['from', 'to'],
    properties: {
      from: { type: 'number' },
      to: { type: 'number' }
    },
  },
};

exports.balanceSchema = {
  body: {
    type: 'object',
    required: ['address'],
    properties: {
      address: { type: 'string' },
    },
  },
};
exports.txSchema = {
  body: {
    type: 'object',
    required: ['hash'],
    properties: {
      hash: { type: 'string' },
    },
  },
};

exports.balanceERC20Schema = {
  body: {
    type: 'object',
    required: ['address', 'contractAddress'],
    properties: {
      address: { type: 'string' },
      contractAddress: { type: 'string' },
    },
  },
};

exports.sendSchema = {
  body: {
    type: 'object',
    required: ['to', 'privKey', "amount"],
    properties: {
      to: { type: 'string' },
      privKey: { type: 'string' },
      amount: { type: 'number' },
    },
  },
};

exports.sendTokenSchema = {
  body: {
    type: 'object',
    required: ['to', 'privKey', "amount", "contractAddress"],
    properties: {
      to: { type: 'string' },
      privKey: { type: 'string' },
      amount: { type: 'number' },
      contractAddress: { type: 'string' },
    },
  },
};
