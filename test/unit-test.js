const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let hardhatVoting;
  let owner;
  let addr1;
  let addr2;
  let addr3;


  this.beforeEach(async function() {
    [owner, addr1, addr2, addr3,] = await ethers.getSigners();

    Voting = await ethers.getContractFactory("Voting");

    hardhatVoting = await Voting.deploy();

    await hardhatVoting.deployed();
  });

  describe("Deployment", function() {
    it("Should set the right owner", async function () {
      expect( await hardhatVoting.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Voting", function() {
    
    it("The Voiting should be active", async () => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])      
      expect( await hardhatVoting.checkActive("test")).to.equal(true)
    })
    it("check correct array", async () =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
//      console.log(await hardhatVoting.showCandidates("test"))
//      console.log(addr1.address, addr2.address)      
       expect(await  hardhatVoting.showCandidates("test") + " ").to.equal([addr1.address, addr2.address] + " ")
    })

    it("revert if no owner call", async() => {
      await expect( hardhatVoting.connect(addr2).addVoting("test", [addr1.address, addr2.address])).to.be.revertedWith('You are not an owner')
    })
  })

  describe("testing vote finction", function() {

    it("check vote", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.connect(addr2).vote("test", addr1.address, { value: ethers.utils.parseEther('0.01')})    
     console.log(await hardhatVoting.showWinner("test"))      

       expect(await hardhatVoting.showWinner("test")).to.equal(addr1.address)
    })

    it("should be revert if voting does't exist or not active", async() => {
      await expect(hardhatVoting.connect(addr2).vote("test", addr1.address, { value: ethers.utils.parseEther('0.01')})).to.be.revertedWith('Voting is not active')
    })
    

  })

  describe("testing finish voting", function(){
    it("should revert because it not time yet", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await expect( hardhatVoting.connect(addr2).finishVote("test")).to.be.revertedWith("It's not the time")

    })
    it("Should send comission", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: ethers.utils.parseEther('0.01')})
      const comission = await hardhatVoting.showComission()
      await expect( await hardhatVoting.getComission()).to.changeEtherBalance(owner, comission)
//      console.log()
    })

    it("should return winner and winner voices", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: ethers.utils.parseEther('0.01')})
      await hardhatVoting.connect(addr2).vote("test", addr2.address, { value: ethers.utils.parseEther('0.01')})    
      await hardhatVoting.connect(addr3).vote("test", addr2.address, { value: ethers.utils.parseEther('0.01')})    
      expect(await hardhatVoting.showWinner("test")).to.equal(addr2.address)
      expect(await hardhatVoting.showCandidateVoices("test", addr2.address)).to.equal(2)

      console.log(await hardhatVoting.showWinner("test"), " has ", await hardhatVoting.showCandidateVoices("test", addr2.address), " voices" )

    })
    it("should show all votes", async() => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("test2", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("test3", [addr1.address, addr2.address])

      console.log(await hardhatVoting.showAllVotes())
      await expect(await hardhatVoting.showAllVotes()+ " ").to.equal(["test","test2","test3"]+ " ")
    })
  })

  




});
