async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  console.log("Voting address:", voting.address);

  saveFrontendFiles({
    Voting: voting
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


/*
function saveFrontendFiles(contract) {
  const contractDir = path.join(__dirname, '/..', front/contracts)
  if(!fs.exstsSync(contractDir)) {
    fs.mkdirSync(contractDir)
  }
} 
*/
