exports.blockSchema = {
    body: {
      type: 'object',
      required: ['height'],
      properties: {
        height: {type: 'number'}
      },
    },
  };
  
  exports.balanceSchema = {
    body: {
      type: 'object',
      required: ['address'],
      properties: {
        address: {type: 'string'},
      },
    },
  };
  
  exports.balanceERC20Schema = {
    body: {
      type: 'object',
      required: ['address','contractAddress'],
      properties: {
        address: {type: 'string'},
        contractAddress: {type: 'string'},
      },
    },
  };
  
  exports.sendSchema = {
    body: {
      type: 'object',
      required: ['to','privKey','gasPrice','gasLimit',"amount"],
      properties: {
        to: {type: 'string'},
        privKey: {type: 'string'},
        gasPrice: {type: 'string'},
        gasLimit: {type: 'string'},
        amount: {type: 'number'},
      },
    },
  };
  
  exports.sendTokenSchema = {
    body: {
      type: 'object',
      required: ['to','privKey','gasPrice','gasLimit',"amount","contractAddress"],
      properties: {
        to: {type: 'string'},
        privKey: {type: 'string'},
        gasPrice: {type: 'string'},
        gasLimit: {type: 'string'},
        amount: {type: 'number'},
        contractAddress: {type: 'string'},
      },
    },
  };
  