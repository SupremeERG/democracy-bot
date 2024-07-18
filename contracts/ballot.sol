// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Ballot {
    struct Voter {
        string username; // discord username
    }
    struct Candidate {
        int electionID;
        string username; // discord username
        string role; // the role they are campaigning for
        int votes; // number of votes the user has
    }
    struct Election {
        string initiator;
        string role;
        Voter[] voters; //mapping(string username => Voter) voters;
        Candidate[] candidates; //mapping(string username => Candidate) candidates;
    }

    mapping(int electionID => Election electionObject) elections;
    // ----> incorrect syntax?
    // Change ----> mapping(int => Election ) public elections;

    // owner = election initiator
    // role = the role the election is held for
    // duration = the amount of time the election is running

    // Change ------> Added capital, lowercase is unconventional
    event ElectionInitiated(  
        int electionID,
        string owner,
        string role,
        uint duration,
        uint endTime
    );
    // Change -------> Another capital
    event ElectionEnded(string winner, string role, uint duration);
    // Added ----> Event added
    event CandidateAdded(int electionID, string username);

    function startElection(string memory initiator, string memory role, uint duration) public {
        // this starts the election where users can join to campaign

        int electionID = int(uint(keccak256(abi.encodePacked(initiator, role, duration))));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic

        // Removed ----> elections[electionID];
        elections[electionID].initiator = initiator;
        elections[electionID].role = role;

        // Changed -----> Added capital
        emit ElectionInitiated(electionID, initiator, role, duration, endTime);
    }

    // Added ----> Changed function name to suit more of the role IMO / Chnage back if you wish
    function addCandidate(int electionID, string memory username, string memory role) public {
        Candidate memory newCandidate = Candidate({
            electionID: electionID,
            username: username,
            role: role,
            votes: 0
        });

        elections[electionID].candidates.push(newCandidate);

        emit CandidateAdded(electionID, username);
    }

    // Added ---> Parameters
    function vote(int electionID, string memory username) public {
        // Voting logic
    }

    // Added ----> Return types and had to make public
    function getResults(int electionID) public view returns (string memory winner, int voteCount) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }
}