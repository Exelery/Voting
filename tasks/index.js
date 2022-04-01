const { ethers } = require('ethers');
const { task } = require('hardhat/config');

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

task("vote", "choice your candidate")
    .addParam("name", "Voting name")
    .addParam("candidate", "Your choise")
    .setAction(async (taskArgs)=>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await MyContract.attach(taskArgs.address)
        await contract.vote(taskArgs.name, taskArgs.candidate)
        console.log(taskArgs.candidate, ' has ', await contract.showCandidateVoices(taskArgs.name, taskArgs.candidate), ' voices' )
    })

task("finish Voting", "You want to end voting?")
    .addParam("name", "Voting name")
    .setAction(async (taskArgs) =>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await MyContract.attach(taskArgs.address)
        await contract.finishVote(taskArgs.name)
        console.log("The voting ", taskArgs.name, " ends")
        console.log('The winner is ', await contract.showWinner(taskArgs.name))
    })
