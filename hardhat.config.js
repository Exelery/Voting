require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();
const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-web3");
require ("./tasks/index.js");

const API_KEY = process.env.API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_URL = process.env.INFURA_URL




module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: INFURA_URL,
      accounts: [PRIVATE_KEY],
    }
  }
};
