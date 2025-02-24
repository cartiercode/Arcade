// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArcadeLeaderboard {
    address public owner;
    address public automationAddress;
    uint256 public day;
    uint256 public prizePool;
    mapping(uint256 => mapping(address => uint256)) public scores;
    mapping(address => bool) public hasPaid;

    uint256 public ownerCut = 1000; // 10%
    uint256 public firstPlace = 4000; // 40%
    uint256 public secondPlace = 2500; // 25%
    uint256 public thirdPlace = 1500; // 15%
    uint256 public fourthPlace = 1000; // 10%
    uint256 public fifthPlace = 500; // 5%

    constructor(address _automationAddress) {
        owner = msg.sender;
        automationAddress = _automationAddress;
        day = block.timestamp / 86400;
    }

    function payToPlay() external payable {
        require(msg.value == 1e18, "Send 1 TRX");
        require(!hasPaid[msg.sender], "Already paid today");
        hasPaid[msg.sender] = true;
        prizePool += msg.value;
    }

    function submitScore(uint256 score, bytes32 gameStateHash) external {
        require(hasPaid[msg.sender], "Pay first");
        require(scores[day][msg.sender] == 0, "Score already set");
        scores[day][msg.sender] = score;
        hasPaid[msg.sender] = false;
    }

    function reset() external onlyAutomation {
        uint256 ownerAmount = prizePool * ownerCut / 10000;
        uint256 winnersPool = prizePool - ownerAmount;
        payable(owner).transfer(ownerAmount);
        prizePool = 0;
        day++;
    }

    function setPercentages(
        uint256 _ownerCut,
        uint256 _firstPlace,
        uint256 _secondPlace,
        uint256 _thirdPlace,
        uint256 _fourthPlace,
        uint256 _fifthPlace
    ) external onlyOwner {
        require(_ownerCut + _firstPlace + _secondPlace + _thirdPlace + _fourthPlace + _fifthPlace == 10000, "Must sum to 100%");
        ownerCut = _ownerCut;
        firstPlace = _firstPlace;
        secondPlace = _secondPlace;
        thirdPlace = _thirdPlace;
        fourthPlace = _fourthPlace;
        fifthPlace = _fifthPlace;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAutomation() {
        require(msg.sender == automationAddress, "Only Chainlink");
        _;
    }
}
