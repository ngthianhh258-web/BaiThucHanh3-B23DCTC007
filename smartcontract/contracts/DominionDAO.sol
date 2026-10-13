// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DominionDAO {
    uint256 public constant STAKEHOLDER_THRESHOLD = 0.01 ether;
    uint256 public constant VOTING_DURATION = 5 minutes;

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address payable beneficiary;
        uint256 amount;
        uint256 upvotes;
        uint256 downvotes;
        bool paid;
        address proposer;
        uint256 deadline;
        address executor;
    }

    uint256 public proposalCount;
    uint256 public daoBalance;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bool) public isStakeholder;

    event Contributed(address indexed contributor, uint256 amount);
    event ProposalCreated(uint256 indexed id, string title, uint256 amount);
    event Voted(uint256 indexed id, address indexed voter, bool support);
    event Paid(uint256 indexed id, address indexed beneficiary, uint256 amount);

    modifier onlyStakeholder() {
        require(isStakeholder[msg.sender], "Not a stakeholder");
        _;
    }

    function contribute() external payable {
        require(msg.value > 0, "Must send ETH");
        contributions[msg.sender] += msg.value;
        daoBalance += msg.value;
        if (contributions[msg.sender] >= STAKEHOLDER_THRESHOLD) {
            isStakeholder[msg.sender] = true;
        }
        emit Contributed(msg.sender, msg.value);
    }

    function createProposal(
        string calldata title,
        string calldata description,
        address payable beneficiary,
        uint256 amount
    ) external onlyStakeholder {
        require(bytes(title).length > 0, "Empty title");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0 && amount <= daoBalance, "Invalid amount");
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: title,
            description: description,
            beneficiary: beneficiary,
            amount: amount,
            upvotes: 0,
            downvotes: 0,
            paid: false,
            proposer: msg.sender,
            deadline: block.timestamp + VOTING_DURATION,
            executor: address(0)
        });
        emit ProposalCreated(proposalCount, title, amount);
    }

    function performVote(uint256 id, bool support) external onlyStakeholder {
        Proposal storage p = proposals[id];
        require(p.id != 0, "Proposal not found");
        require(block.timestamp < p.deadline, "Voting ended");
        require(!hasVoted[id][msg.sender], "Already voted");
        hasVoted[id][msg.sender] = true;
        if (support) p.upvotes++;
        else p.downvotes++;
        emit Voted(id, msg.sender, support);
    }

    function payBeneficiary(uint256 id) external onlyStakeholder {
        Proposal storage p = proposals[id];
        require(p.id != 0, "Proposal not found");
        require(!p.paid, "Already paid");
        require(block.timestamp >= p.deadline, "Voting ongoing");
        require(p.upvotes > p.downvotes, "Not passed");
        require(daoBalance >= p.amount, "Insufficient DAO balance");
        p.paid = true;
        p.executor = msg.sender;
        daoBalance -= p.amount;
        p.beneficiary.transfer(p.amount);
        emit Paid(id, p.beneficiary, p.amount);
    }

    function getProposals() external view returns (Proposal[] memory) {
        Proposal[] memory list = new Proposal[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            list[i] = proposals[i + 1];
        }
        return list;
    }
}