//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Voting {
    address  payable public owner;
    uint public totalComission;
    string[] public allVotes;

    struct Vote {
        address[] candidates;
        bool active;
        uint total;
        uint date;
        uint best;
        uint comission;
        address payable win;
        mapping(address => uint) voices;
        mapping(address => bool) alreadyVoted;
        mapping(address => bool) isCandidate;


    }

    mapping(string => Vote) votes;

    event Winner(address);


    

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not an owner");
        _;
    }

    modifier isActive( string memory _name) {
        require(votes[_name].active, "Voting is not active");
        _;
    }


    constructor() {
    owner = payable(msg.sender);
      }


    function addVoting(string memory _name, address[] calldata _candidates ) external onlyOwner{
 //       Vote storage test = votes[_name];
        votes[_name].date = block.timestamp;
        votes[_name].active = true;
        allVotes.push(_name);
        for (uint i=0; i < _candidates.length; i++) {
           votes[_name].candidates.push(_candidates[i]);
           votes[_name].isCandidate[_candidates[i]] = true;           
        }
        

    
        
    }

    function vote(string memory _name, address  _candidate) external payable isActive(_name) {
        require(!votes[_name].alreadyVoted[msg.sender], "Already voted" );
        require(msg.value == .01 ether, "You have to send 0.01 eth");
        require(votes[_name].isCandidate[_candidate], "It's not a candidate" );
        
        votes[_name].voices[_candidate] ++;
        votes[_name].total += msg.value;
        votes[_name].alreadyVoted[msg.sender] = true;
        totalComission += msg.value /10;

        if(votes[_name].voices[_candidate] > votes[_name].best) {
            votes[_name].win = payable(_candidate);
            votes[_name].best = votes[_name].voices[_candidate];
        }
 //       if(votes[_name].voices[_candidate] == votes[_name].best && )

    }

    function finishVote(string memory _name) external isActive(_name) {
        require(block.timestamp >= votes[_name].date + 3 days, "It's not the time");
        require(checkWiners(_name), "There is only one winner");
        votes[_name].comission = votes[_name].total / 10 ;
        votes[_name].win.transfer(votes[_name].total - votes[_name].comission);
        votes[_name].active = false;
        
    }

    function checkWiners(string memory _name) private returns(bool) {
        for (uint i=0; i < votes[_name].candidates.length; i++) {
            uint temp;
           if (votes[_name].voices[votes[_name].candidates[i]] == votes[_name].best) {
               temp++;
           }
           if(temp > 1) return false;
        }
        return true;
    }

    function getComission() external onlyOwner{
        owner.transfer(totalComission);
        totalComission = 0;
    }
    function showComission() public view returns(uint) {
        return totalComission;
    }

    function showCandidates(string memory _name) external view returns(address[] memory) {
        return votes[_name].candidates;
    }

    function checkActive(string memory _name) external view returns(bool) {
        return votes[_name].active;
    }

    function showWinner(string memory _name) external view returns(address payable) {
        return votes[_name].win;
    }

  //  function startOfVoting(string memory _name) external view returns()


   
}
