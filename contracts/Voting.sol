//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
//import "hardhat/console.sol";



contract Voting {
    address  payable public owner;
    uint public totalComission;
    string[] public allVotes;

    struct  Vote {
        bool active;
        address[] candidates;
        uint total;
        uint startAt;
        uint128 best;
        uint128 comission;
        address payable win;
        mapping(address => uint) voices;
        mapping(address => bool) alreadyVoted;
        mapping(address => bool) isCandidate;
        address lastWinner;
        bool doubleWinner;
        bool end;


    }

    mapping(string => Vote) public votes;

    event CreateVoting(string _name, uint _time);
    event Voted(address _candidate, uint _voices, address _voter);
    event Finish(string _name, address _winner, uint _voices);
    event FinishZero(string _message);


    

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not an owner");
        _;
    }

    modifier isNotEnded( string memory _name) {
        require(!votes[_name].end, "Voting is Ended");
        _;
    }

    modifier isActive( string memory _name) {
        require(votes[_name].active, "Voting is not active");
        _;
    }


    constructor() {
    owner = payable(msg.sender);
      }


    function addVoting(string memory _name, address[] calldata _candidates ) external onlyOwner isNotEnded(_name){
        require(!votes[_name].active, 'Voting is alredy exist');
        votes[_name].startAt = block.timestamp;
        votes[_name].active = true;
        allVotes.push(_name);
        for (uint i=0; i < _candidates.length; i++) {
           votes[_name].candidates.push(_candidates[i]);
           votes[_name].isCandidate[_candidates[i]] = true;           
        }

        emit CreateVoting(_name, block.timestamp);
        

    
        
    }

    function vote(string memory _name, address  _candidate) external payable isActive(_name) {
        require(!votes[_name].alreadyVoted[msg.sender], "Already voted" );
        require(msg.value == .01 ether, "You have to send 0.01 eth");
        require(votes[_name].isCandidate[_candidate], "It's not a candidate" );
        
        votes[_name].voices[_candidate] ++;
        votes[_name].total += msg.value;
        votes[_name].alreadyVoted[msg.sender] = true;
        totalComission += msg.value /10;

        if(votes[_name].voices[_candidate] >= votes[_name].best) {
            if(votes[_name].lastWinner != _candidate && votes[_name].best == votes[_name].voices[_candidate] ) {
                votes[_name].doubleWinner = true;
            } else {
                votes[_name].win = payable(_candidate);
                votes[_name].doubleWinner = false;
                votes[_name].lastWinner = _candidate;
                votes[_name].best = uint128(votes[_name].voices[_candidate]);
           }
            
        }
        emit Voted(_candidate,votes[_name].voices[_candidate], msg.sender);
    }

    function finishVote(string memory _name) external isActive(_name) {
        require(block.timestamp >= votes[_name].startAt + 3 days, "It's not the time");
        require(!votes[_name].doubleWinner, "There is only one winner");
        votes[_name].comission = uint128(votes[_name].total / 10) ;
//        votes[_name].win.transfer(votes[_name].total - votes[_name].comission);        
        votes[_name].end = true;
        votes[_name].active = false;
        if(votes[_name].win == address(0)) {
            emit FinishZero("No one voted");
        } else{
            (bool _success,) = votes[_name].win.call{value: votes[_name].total - votes[_name].comission}("");
        require(_success, "Transfer failed.");
        emit Finish(_name, votes[_name].win, votes[_name].voices[votes[_name].win]);
        }
        
    }
    


    function getComission() external onlyOwner{
        (bool _success, ) = owner.call{value: totalComission}("");
        require(_success, "Transfer failed.");

        totalComission = 0;
    }

    
    function showComission() public view returns(uint) {
        return totalComission;
    }

    function showCandidates(string memory _name) external view returns(address[] memory) {
        return votes[_name].candidates;
    }


    function checkActive(string memory _name) external view returns(bool) {
        return !votes[_name].end;
    }

    function showWinner(string memory _name) external view returns(address payable) {
        return votes[_name].win;
    }

    function showCandidateVoices(string memory  _name, address _candidate) external view returns(uint) {
        return votes[_name].voices[_candidate];
    }

    function showAllVotes() external view returns(string[]memory) {
        return allVotes;
        
    }
    function isDoubleWinner(string memory _name) external view returns(bool) {
        return votes[_name].doubleWinner;
    }

    function showBestVoices(string memory _name) external view returns(uint) {
        return votes[_name].best;
    }

    function showLastWinner(string memory _name) external view returns(address) {
        return votes[_name].lastWinner;
    }




   
}
