// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "node_modules/@openzeppelin/contracts/utils/Strings.sol";


contract Ballot {
    struct Voter {
        string user; // discord user
        bool voted;
    }
    struct Candidate {
        string user; // discord user
        uint votes; // number of votes the user has
    }
    struct Election {
        uint guildID;
        string initiator;
        string role;
    }

    mapping(uint electionID => Election electionObject) private elections;
    mapping(uint electionID => Voter[] voters) private voters;
    mapping(uint electionID => Candidate[] candidates) private candidates;

    // owner = election initiator
    // role = the role the election is held for
    // duration = the amount of time the election is running

    event ElectionInitiated(  
        uint electionID,
        uint guildID,
        string owner,
        string role,
        uint duration,
        uint endTime
    );
    event ElectionEnded(string winner, string role, uint duration);
    event CandidateAdded(uint electionID, string user);

    function startElection(uint guildID, string memory initiator, string memory role, uint duration) public {
        // this starts the election where users can join to campaign

        uint electionID = uint(keccak256(abi.encodePacked(initiator, role, duration)));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic


        elections[electionID].guildID = guildID;
        elections[electionID].initiator = initiator;
        elections[electionID].role = role;


        emit ElectionInitiated(electionID, guildID, initiator, role, duration, endTime);
    }

    function addCandidate(uint electionID, string calldata user) public {

        candidates[electionID].push(user, 0);

        emit CandidateAdded(electionID, user);
    }

    function vote(uint electionID, string memory user) public {
        // Voting logic
    }

    function getElection() public returns (Election, Voter[], Candidate[]) {}

    // Added ----> Return types and had to make public
    /*
    function getResults(uint electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }*/

}