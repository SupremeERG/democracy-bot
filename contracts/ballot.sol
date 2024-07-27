// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "node_modules/@openzeppelin/contracts/utils/Strings.sol";

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
        uint initiator; // election initiator
        uint role; // role = the position the election is held for
        uint duration;
        uint endTime;
    }

    mapping(uint electionID => Election electionObject) private elections;
    mapping(uint electionID => Voter[]) private voters;
    mapping(uint electionID => Candidate[]) private candidates;

    // Error declarations
    error InvalidElectionID(uint electionID);
    error VoterAlreadyExists(uint electionID, Voter existingVoter);
    error CandidateAlreadyExists(uint electionID, Candidate existingCandidate);

    // Event declarations
    event ElectionInitiated(
        uint electionID, uint guildID, uint owner, uint role, uint duration, uint endTime
    );
    event ElectionEnded(uint winner, uint role, uint duration);
    event CandidateAdded(uint electionID, uint user);
    event VoterRegistered(uint electionID, uint user);


    constructor() {
        voters[0].push(Voter(0, true)); // initialize an empty object for return purposes
        candidates[0].push(Candidate(0,0)); // initialize an empty object for return purposes

    }






    function startElection(uint guildID, uint initiator, uint role, uint duration) public {
        // this starts the election where users can join to campaign

        uint electionID = uint(keccak256(abi.encodePacked(initiator, role, duration, block.timestamp)));

        uint startTime = block.timestamp;
        uint endTime = startTime + duration; // the discord bot can handle time logic

        elections[electionID] = Election(true, guildID, initiator, role);

        emit ElectionInitiated(electionID, guildID, initiator, role, duration, endTime);
    }

    function addCandidate(uint electionID, uint user) public {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        (bool exists, Candidate storage candidate) = getCandidate(electionID, user);
        if (exists != false) revert CandidateAlreadyExists(electionID, candidate);

        candidates[electionID].push(Candidate(user, 0));

        emit CandidateAdded(electionID, user);
    }

    function registerVoter(uint electionID, uint user) public {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        Voter memory newVoter = Voter(user, false);
        voters[electionID].push(newVoter);

        emit VoterRegistered(electionID, user);
    }

    function vote(uint electionID, string memory user) public {
        // Voting logic
    }

    function getElection(uint electionID)
        public
        view
        returns (Election memory, Voter[] memory, Candidate[] memory)
    {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        Voter[] memory electionVoters = voters[electionID];
        Candidate[] memory electionCandidates = candidates[electionID];

        return (elections[electionID], electionVoters, electionCandidates);
    }

    function verifyElection(uint electionID) internal view returns (bool) {
        Election memory election = elections[electionID];
        if (election.active == false) {
            return false;
        } else {
            return true;
        }
    }

    function getVoter(uint electionID, uint user) internal view returns (bool found, Voter memory voter) {}

    function getCandidate(uint electionID, uint user)
        internal
        view
        returns (bool found, Candidate storage candidate)
    {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        Candidate[] storage foundCandidates = candidates[electionID];

        for (uint i = 0; i < foundCandidates.length; i++) {
            if (foundCandidates[i].user == user) return (true, foundCandidates[i]);
        }

        return (false, candidates[0][0]);
    }

    function watch(uint electionID) internal {
        // watches an election until it ends
        election = elections[electionID];
        endTime = election.endTime;

        while (block.timestamp < endTime) {}
        // now end the election here
        
    }

    // Added ----> Return types and had to make public
    /*
    function getResults(uint electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        // the discord bot should handle all roles and administration
    }*/
}
