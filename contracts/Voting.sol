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

        if(votes[_name].voices[_candidate] > votes[_name].best) {
            votes[_name].win = payable(_candidate);
            votes[_name].best = votes[_name].voices[_candidate];
        }
 //       votes[_name].

    }

    function finishVote(string calldata _name) external isActive(_name) {
        require(votes[_name].date + 3 days >= block.timestamp);
        votes[_name].comission = votes[_name].total / 10 ;
        votes[_name].win.transfer(votes[_name].total - votes[_name].comission);
        totalComission += votes[_name].comission;
        votes[_name].active = false;
        
    }

    function getComission() external onlyOwner {
        owner.transfer(totalComission);
        totalComission = 0;
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
