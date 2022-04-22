const hre = require("hardhat");
async function main() {
const Voting = await hre.ethers.getContractFactory("Voting");
await hre.storageLayout.export();
const cHelloSol = await Voting.deploy();
await cHelloSol.deployed();
console.log("Voting deployed to:", cHelloSol.address);
}
main()
.then(() => process.exit(0))
.catch((error) => {
console.error(error);
process.exit(1);
});