// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Ballot {
    struct Voter {
        string user; // discord user
    }
    struct Candidate {
        string user; // discord user
        uint votes; // number of votes the user has
    }
    struct Election {
        uint guildID;
        string initiator;
        string role;
        Voter[] voters; //mapping(string user => Voter) voters;
        Candidate[] candidates; //mapping(string user => Candidate) candidates;
    }

    mapping(uint electionID => Election electionObject) public elections;

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

    function addCandidate(uint electionID, string memory user) public {
        Candidate memory newCandidate = Candidate({
            user: user,
            votes: 0
        });

        elections[electionID].candidates.push(newCandidate);

        emit CandidateAdded(electionID, user);
    }

    function vote(uint electionID, string memory user) public {
        // Voting logic
    }

    // Added ----> Return types and had to make public
    function getResults(uint electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }

}