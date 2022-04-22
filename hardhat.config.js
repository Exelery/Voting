require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();
require("@nomiclabs/hardhat-web3");
require ("./tasks/index.js");
require("hardhat-gas-reporter");

const API_KEY = process.env.API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_URL = process.env.INFURA_URL
const CMP_API = process.env.CMP_API



module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    rinkeby: {
      url: INFURA_URL,
      accounts: [PRIVATE_KEY],
    }
  },

  
  

  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
   // noColors: true,
    showTimeSpent: true,
    showMethodSig: true,
    currency: 'USD',
    coinmarketcap: CMP_API,
    },
}

