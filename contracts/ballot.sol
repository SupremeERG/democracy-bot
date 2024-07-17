// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

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
        Voter[] voters;
        Candidate[] candidates;

    }

    mapping(int electionID => Election electionObject) elections;
    Voter[] voters;
    Candidate[] candidates;



    // owner = election initiator
    // role = the role the election is held for
    // duration = the amount of time the election is running
    event electionInitiated(
        int electionID,
        string owner,
        string role,
        uint duration,
        uint endTime
    );
    event electionEnded(string winner, string role, uint duration);

    function startElection(string memory initiator, string memory role, uint duration) public {
        // this starts the election where users can join to campaign

        int electionID = int(uint(keccak256(abi.encodePacked(initiator, role, duration))));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic

        elections[electionID] = Election(initiator, role, voters, candidates);

        emit electionInitiated(electionID, initiator, role, duration, endTime);
    }

    function addCandidate(int electionID, string memory username) public {
        // adds candidate to election

    }

    function vote() public {}

    function getResults() private {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }
}