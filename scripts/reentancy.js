const hre = require('hardhat')
const ethers = hre.ethers

async function main() {
  const [user1, user2, hacker] = await ethers.getSigners()

  const Voting = await ethers.getContractFactory("Voting", user1)
  const voting = await Voting.deploy()
  await voting.deployed() 
    

  
}