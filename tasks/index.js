// const { ethers } = require('ethers');
const { task } = require('hardhat/config');
require("@nomiclabs/hardhat-ethers");


//const [deployer] = await ethers.getSigners();


require('dotenv').config();


const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_URL = process.env.INFURA_URL
const ADDRESS = process.env.ADDRESS

task("addVoting", "Create new Voting")
    .addParam("name", "Voting name")
    .addParam("candidates", "Add your candidates")
    .setAction(async (taskArgs)=>{

        const [singer ] = await ethers.getSigners();
        console.log("Account balance:", (await singer.getBalance()).toString());

        const candidates = taskArgs.candidates.split(",") 
        const Mycontract = await ethers.getContractFactory("Voting")

        const contract = await Mycontract.attach(ADDRESS);

        await contract.addVoting(taskArgs.name, candidates)
        console.log( await contract.checkActive(taskArgs.name))
    });

task("vote", "choice your candidate")
    .addParam("name", "Voting name")
    .addParam("candidate", "Your choise")
    .setAction(async (taskArgs)=>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await Mycontract.attach(ADDRESS)
        await contract.vote(taskArgs.name, taskArgs.candidate, {value: ethers.utils.parseEther("0.01"), gasLimit: 250000} )
        console.log(taskArgs.candidate, ' has ', await contract.showCandidateVoices(taskArgs.name, taskArgs.candidate), ' voices' )
    })

task("finishVoting", "You want to end voting?")
    .addParam("name", "Voting name")
    .setAction(async (taskArgs) =>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await Mycontract.attach(ADDRESS)
        
        await contract.finishVote(taskArgs.name , { gasLimit: 250000})       
        console.log("The voting ", taskArgs.name, " ends")
        console.log('The winner is ', await contract.showWinner(taskArgs.name))
     //   } catch (error) {
     ///       console.error(error.message)
     //   }

    })

task("getComission", "This can withdraw all comission on owner wallet")
    .setAction(async () =>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await Mycontract.attach(ADDRESS)
        console.log(ethers.utils.formatEther(await contract.showComission()), " was send to owner")
        await contract.getComission()
    })

task("checkActive", "This show voting status")
    .addParam("name", "Voting name")
    .setAction(async(taskArgs) =>{
        const Mycontract = await ethers.getContractFactory("Voting")
        const contract = await Mycontract.attach(ADDRESS)
        if(await contract.checkActive(taskArgs.name)) {
            console.log("Voting ", taskArgs.name, " is active")
        }
        else{
            console.log("Voting ", taskArgs.name, " is inactive")
        }

    })