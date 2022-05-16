//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/security/Pausable.sol";





contract Voting is Pausable{
    address  payable public owner;
    uint public totalComission;
    string[] public allVotes;
    uint activeVotes;
    bool locked;

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

    event CreateVoting(string indexed  _name, uint _time);
    event Voted(address indexed _candidate, uint _voices, address _voter);
    event Finish(string indexed  _name, address indexed  _winner, uint _voices);
    event FinishZero(string indexed _name, string _message);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    modifier NoReentancy() {
        require(!locked, "no reentancy");
        locked = true;
        _;
        locked = false;
    }    

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
        _transferOwnership(msg.sender);
    }

    function _transferOwnership(address _newOwner) internal {
        address oldOwner = owner;
        owner = payable(_newOwner);
        emit OwnershipTransferred(oldOwner, _newOwner);
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(_newOwner);
    }



    function addVoting(string calldata _name, address[] calldata _candidates ) external onlyOwner isNotEnded(_name){
        require(!votes[_name].active, 'Voting is alredy exist');
        votes[_name].startAt = block.timestamp;
        votes[_name].active = true;
        allVotes.push(_name);
        votes[_name].candidates = _candidates;
        for (uint i=0; i < _candidates.length; i++) {
 //          votes[_name].candidates.push(_candidates[i]);
           votes[_name].isCandidate[_candidates[i]] = true;           
        }
        activeVotes++;

        emit CreateVoting(_name, block.timestamp);
        

    
        
    }

    function vote(string calldata _name, address _candidate) external payable isActive(_name) whenNotPaused{
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

    function finishVote(string calldata _name) external isActive(_name) whenNotPaused{
        require(block.timestamp >= votes[_name].startAt + 3 days, "It's not the time");
        require(!votes[_name].doubleWinner, "There is only one winner");
        votes[_name].comission = uint128(votes[_name].total / 10) ;
//        votes[_name].win.transfer(votes[_name].total - votes[_name].comission);        
        votes[_name].end = true;
        votes[_name].active = false;
        activeVotes--;

        if(votes[_name].win == address(0)) {
            emit FinishZero(_name, "No one voted");
        } else{
            uint amount = votes[_name].total - votes[_name].comission;
            _withdrawTo(votes[_name].win, amount);
        
             emit Finish(_name, votes[_name].win, votes[_name].voices[votes[_name].win]);
        }
        
    }
    
    function _withdrawTo(address payable _to, uint _amount) private NoReentancy {
        (bool _success,) = _to.call{value: _amount}("");
            require(_success, "Transfer failed.");
    }


    function getComission() external onlyOwner{
        require(totalComission > 0, "There is no comission");
        uint tempComission = totalComission;
        totalComission = 0;
        _withdrawTo(owner, tempComission);
        
    }

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unPause() external onlyOwner whenPaused {
        _unpause();
    }

    receive()  external payable {
        totalComission += msg.value;
    }

    
    function showComission() public view returns(uint) {
        return totalComission;
    }

    function showCandidates(string calldata _name) external view returns(address[] memory) {
        return votes[_name].candidates;
    }


    function checkActive(string calldata _name) external view returns(bool) {
        require(votes[_name].candidates.length> 0, "The voting isn't exist");
        return !votes[_name].end;
    }

    function showWinner(string calldata _name) external view returns(address payable) {
        return votes[_name].win;
    }

    function showCandidateVoices(string calldata  _name, address _candidate) external view returns(uint) {
        return votes[_name].voices[_candidate];
    }

    function showAllVotes() external view returns(string[]memory) {
        return allVotes;
        
    }
    function isDoubleWinner(string calldata _name) external view returns(bool) {
        return votes[_name].doubleWinner;
    }

    function showBestVoices(string calldata _name) external view returns(uint) {
        return votes[_name].best;
    }

    function showLastWinner(string calldata _name) external view returns(address) {
        return votes[_name].lastWinner;
    }


   function showAllActiveVotes() external view returns(string[] memory) {

        string[] memory allActive = new string[](activeVotes);
        uint b = 0;
        
        for(uint i = 0; i < allVotes.length; i++) {
            if(votes[allVotes[i]].active) {
                allActive[b] = allVotes[i];
                b++;
            }
        }

        return allActive;
    }

    //At our last meeting, someone told me that it is impossible to convert an address to uint
    // so let's check it out
    function getOwnerUint() external view returns(uint) {
        console.log("This is uint" , uint160(address(owner)));
        return uint(uint160(address(owner)));

    }
     




   
}
