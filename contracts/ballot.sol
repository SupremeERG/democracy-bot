// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Ballot {
    struct Voter {
        string username; // discord username
    }
    struct Candidate {
        string username; // discord username
        int votes; // number of votes the user has
    }
    struct Election {
        int guildID;
        string initiator;
        string role;
        Voter[] voters; //mapping(string username => Voter) voters;
        Candidate[] candidates; //mapping(string username => Candidate) candidates;
    }

    mapping(int electionID => Election electionObject) elections;

    // owner = election initiator
    // role = the role the election is held for
    // duration = the amount of time the election is running

    event ElectionInitiated(  
        int electionID,
        int guildID,
        string owner,
        string role,
        uint duration,
        uint endTime
    );
    event ElectionEnded(string winner, string role, uint duration);
    event CandidateAdded(int electionID, string username);

    function startElection(int guildID, string memory initiator, string memory role, uint duration) public {
        // this starts the election where users can join to campaign

        int electionID = int(uint(keccak256(abi.encodePacked(initiator, role, duration))));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic

        elections[electionID].guildID = guildID;
        elections[electionID].initiator = initiator;
        elections[electionID].role = role;

        emit ElectionInitiated(electionID, guildID, initiator, role, duration, endTime);
    }

    function addCandidate(int electionID, string memory username) public {
        Candidate memory newCandidate = Candidate({
            username: username,
            votes: 0
        });

        elections[electionID].candidates.push(newCandidate);

        emit CandidateAdded(electionID, username);
    }

    function vote(int electionID, string memory username) public {
        // Voting logic
    }

    // Added ----> Return types and had to make public
    function getResults(int electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }
}