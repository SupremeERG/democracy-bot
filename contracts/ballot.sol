// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "node_modules/@openzeppelin/contracts/utils/Strings.sol";

error InvalidElectionID(uint electionID);

contract Ballot {
    struct Voter {
        uint user; // discord user
        bool voted;
    }
    struct Candidate {
        uint user; // discord user
        uint votes; // number of votes the user has
    }
    struct Election {
        bool active;
        uint guildID;
        uint initiator;
        uint role;
    }

    mapping(uint electionID => Election electionObject) private elections;
    mapping(uint electionID => Voter[]) private voters;
    mapping(uint electionID => Candidate[]) private candidates;

    // owner = election initiator
    // role = the role the election is held for
    // duration = the amount of time the election is running

    event ElectionInitiated(  
        uint electionID,
        uint guildID,
        uint owner,
        uint role,
        uint duration,
        uint endTime
    );
    event ElectionEnded(uint winner, uint role, uint duration);
    event CandidateAdded(uint electionID, uint user);

    function startElection(uint guildID, uint initiator, uint role, uint duration) public {
        // this starts the election where users can join to campaign

        uint electionID = uint(keccak256(abi.encodePacked(initiator, role, duration)));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic


        elections[electionID] = Election(true, guildID, initiator, role);


        emit ElectionInitiated(electionID, guildID, initiator, role, duration, endTime);
    }

    function addCandidate(uint electionID, uint user) public {

        if(verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        candidates[electionID].push(Candidate(user, 0));

        emit CandidateAdded(electionID, user);
    }

    function vote(uint electionID, string memory user) public {
        // Voting logic
    }

    function verifyElection(uint electionID) internal view returns (bool) {
        Election memory election = elections[electionID];
        if(election.active == false) {
            return false;
        } else {
            return true;
        }
    }

    function getElection(uint electionID) public view returns (Election memory, Voter[] memory, Candidate[] memory) {
        
        if(verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        
        Voter[] memory electionVoters = voters[electionID];
        Candidate[] memory electionCandidates = candidates[electionID];

        return (elections[electionID], electionVoters, electionCandidates);
    }

    // Added ----> Return types and had to make public
    /*
    function getResults(uint electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }*/

}