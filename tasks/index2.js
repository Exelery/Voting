const { ethers } = require('ethers');
const { task } = require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_URL = process.env.INFURA_URL

task("addVoting", "Create new Voting")
    .addParam("name", "Voting name")
    .addParam("candidates", "Add your candidates")
    .setAction(async (taskArgs)=>{
        const candidates = taskArgs.candidates.split(",") 
        const Mycontract = await ethers.getContractFactory("Voting")

        const contract = await Mycontract.attach(
            taskArgs.address
        );

        await contract.addVoting(taskArgs.name, candidates)
    });
