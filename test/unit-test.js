"use strict";

const { expect } = require("chai");
const { ethers } =  require("hardhat");

const fund = ethers.utils.parseEther('0.01')
const threeDays = 3 * 24 * 60 * 60;

describe("Voting", function () {
  let Voting,
    hardhatVoting,
    owner,
    addr1,
    addr2,
    addr3;


  beforeEach(async () => {
    [owner, addr1, addr2, addr3,] = await ethers.getSigners();

    Voting = await ethers.getContractFactory("Voting");

    hardhatVoting = await Voting.deploy();

    await hardhatVoting.deployed();
  //  console.log(hardhatVoting.address)
  });

  describe("Deployment", async () => {
    it("Should set the right owner", async function () {
      expect( await hardhatVoting.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Voting", async () =>{
    
    it("The Voiting should be active", async () => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])      
      expect( await hardhatVoting.checkActive("test")).to.equal(true)
    })
    it("check correct array", async () =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
//      console.log(await hardhatVoting.showCandidates("test"))
//      console.log(addr1.address, addr2.address)      
       expect(await  hardhatVoting.showCandidates("test")).to.eql([addr1.address, addr2.address])
    })

    it("revert if no owner call", async() => {
      await expect( hardhatVoting.connect(addr2).addVoting("test", [addr1.address, addr2.address])).to.be.revertedWith('You are not an owner')
    })
    it("should revert because voting already exist", async()=> {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])  
//      await  console.log(await hardhatVoting.addVoting("test", [addr1.address]) )    
    await expect( hardhatVoting.addVoting("test", [addr1.address])).to.be.revertedWith('Voting is alredy exist')
    })
    it("should revert because voting is ended", async()=>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      await ethers.provider.send('evm_increaseTime', [threeDays])
      await hardhatVoting.finishVote("test")
      await expect(hardhatVoting.addVoting("test", [addr1.address, addr2.address])).to.revertedWith("Voting is Ended")
    })
  })

  describe("testing vote finction", async () => {

    it("should be possible to send funds",async () => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      const tx = await hardhatVoting.connect(addr2).vote("test", addr1.address, { value: fund})
      await expect(() => tx).to.changeEtherBalances([addr2, hardhatVoting] ,[ethers.utils.parseEther('-0.01'), fund])
    } )

    it("check vote", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.connect(addr2).vote("test", addr1.address, { value: fund})    
     console.log(await hardhatVoting.showWinner("test"))      

       expect(await hardhatVoting.showWinner("test")).to.equal(addr1.address)
    })

    it("should be revert if voting does't exist or not active", async() => {
      await expect(hardhatVoting.connect(addr2).vote("test", addr1.address, { value: fund})).to.be.revertedWith('Voting is not active')
    })

    it("should be reverted, because the candidate is not exist", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await expect(hardhatVoting.vote("test", addr3.address, { value: fund})).to.revertedWith("It's not a candidate")

    })

    it("should be reverted, because msg.sender already voted", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      await expect(hardhatVoting.vote("test", addr2.address, { value: fund})).to.revertedWith("Already voted")
    })

    it("should be reverted, because msg.sender didn't send 0.01eth", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await expect(hardhatVoting.vote("test", addr2.address, { value: ethers.utils.parseEther('1')})).to.revertedWith("You have to send 0.01 eth")
    
    })


  })

  describe("testing finish voting", function(){
    it("should revert because it not time yet", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await expect( hardhatVoting.connect(addr2).finishVote("test")).to.be.revertedWith("It's not the time")

    })
    it("Should send comission", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      const comission = await hardhatVoting.showComission()
      await expect( await hardhatVoting.getComission()).to.changeEtherBalance(owner, comission)
//      console.log()
    })
    it("should revert because of incorrect comission", async()=>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      const comission = await hardhatVoting.showComission()
      await hardhatVoting.getComission()
      await expect(hardhatVoting.getComission()).to.be.revertedWith("There is no comission")
    })

    it("should return winner and winner voices", async() =>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      await hardhatVoting.connect(addr2).vote("test", addr2.address, { value: fund})    
      await hardhatVoting.connect(addr3).vote("test", addr2.address, { value: fund})    
      await expect(await hardhatVoting.showWinner("test")).to.equal(addr2.address)
      expect(await hardhatVoting.showCandidateVoices("test", addr2.address)).to.equal(2)

      console.log(await hardhatVoting.showWinner("test"), " has ", await hardhatVoting.showCandidateVoices("test", addr2.address), " voices" )

    })
    it("should show all votes", async() => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("test2", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("test3", [addr1.address, addr2.address])

      console.log(await hardhatVoting.showAllVotes())
      await expect(await hardhatVoting.showAllVotes()).to.eql(["test","test2","test3"])
    })

    it("should end the voting", async() => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      await ethers.provider.send('evm_increaseTime', [threeDays])
 //     console.log(await hardhatVoting.votes["test"].total)
      let winner = await hardhatVoting.showWinner("test")
      await console.log("winner is", winner)
      await console.log("winer balance is", await ethers.provider.getBalance(winner))     
      await expect(await hardhatVoting.finishVote("test")).to.emit(hardhatVoting, "Finish").withArgs("test", winner, 1)
    })

    it("should revert because the voting has no one winner", async() => {
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.vote("test", addr1.address, { value: fund})
      console.log( await hardhatVoting.isDoubleWinner("test"), await hardhatVoting.showWinner("test"),
       await hardhatVoting.showBestVoices("test"), "last winner is", await hardhatVoting.showLastWinner("test"), addr1.address)
      
       await hardhatVoting.connect(addr3).vote("test", addr2.address, { value: fund})
      console.log( await hardhatVoting.isDoubleWinner("test"), await hardhatVoting.showWinner("test"),
       await hardhatVoting.showBestVoices("test"), await hardhatVoting.showLastWinner("test"), addr2.address)    

      await ethers.provider.send('evm_increaseTime', [threeDays])
      console.log(await hardhatVoting.showBestVoices("test"))
      await console.log("check compire", await await hardhatVoting.showLastWinner("test") != addr2.address, "end", 
      await hardhatVoting.showBestVoices("test"), await hardhatVoting.showCandidateVoices("test", addr1.address))
    
      await expect(hardhatVoting.finishVote("test")).to.revertedWith("There is only one winner")

    })
    it("should end with another event", async()=>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await ethers.provider.send('evm_increaseTime', [threeDays])
      await expect(hardhatVoting.finishVote("test")).to.emit(hardhatVoting, "FinishZero").withArgs("test", "No one voted")
    }) 
    it("should show all active votings", async()=>{
      await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("tes2", [addr1.address, addr2.address])
      await hardhatVoting.addVoting("tes3", [addr1.address, addr2.address])
      await ethers.provider.send('evm_increaseTime', [threeDays])
      await hardhatVoting.finishVote("test")
      console.log(await hardhatVoting.showAllActiveVotes())
      expect(await hardhatVoting.showAllActiveVotes()).to.eql([ 'tes2', 'tes3' ])

    })
    
  })
  describe("check pause", async()=>{
    it("should revert because of pause", async()=> {
      let tx = await hardhatVoting.addVoting("test", [addr1.address, addr2.address])
      let receipt = await tx.wait()
      console.log(receipt.gasUsed)
      await hardhatVoting.pause()
      await expect( hardhatVoting.vote("test", addr1.address, { value: fund})).to.revertedWith("Pausable: paused")
    })
  })

  




});
