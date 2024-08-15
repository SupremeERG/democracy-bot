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
        uint[2] maxVoteCount;
    }

    mapping(uint electionID => Election electionObject) private elections;
    mapping(uint electionID => Voter[]) private voters;
    mapping(uint electionID => Candidate[]) private candidates;

    // Error declarations
    error InvalidElectionID(uint electionID);
    error VoterAlreadyExists(uint electionID, Voter existingVoter);
    error CandidateAlreadyExists(uint electionID, Candidate existingCandidate);
    error electionInactive(uint electionID);

    // Event declarations
    event ElectionInitiated(
        uint electionID, uint guildID, uint owner, uint role, uint duration, uint endTime
    );
    event ElectionEnded(uint electionID, uint guildID, uint winner, uint role, uint duration);
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
        uint emptyVal = 0; // necessary to add zeros into array on line below because compiler recognizes undeclared 0 as uint8 instead of uint256

        elections[electionID] = Election(true, guildID, initiator, role, duration, endTime, [emptyVal, emptyVal ]);

        emit ElectionInitiated(electionID, guildID, initiator, role, duration, endTime);
    }

    function endElection(uint electionID) public {
        Election storage election = elections[electionID];

        // check if election is initially active
        if (election.active == true) revert electionInactive(electionID);

        // sets the election inactive
        election.active = false;

        emit ElectionEnded(electionID, election.guildID, 0, 0, 0); // filler data
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
    /*
    function vote(uint electionID, uint user) public {
        // Voting logic
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        

    }*/

    function verifyElection(uint electionID) internal view returns (bool) {
        Election memory election = elections[electionID];
        if (election.active == false && election.initiator == 0) {
            return false;
        } else {
            return true;
        }
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

    
    function max(uint electionID, uint8 newValue, uint candidateVoted) internal view {
        /* this function should evaluate the highest value in a mapping 
        by comparing an existing value with a new one and only
         replacing the old variable with the existing value if the comparison (newVal > highestVal)
         according to https://stackoverflow.com/questions/72091082/how-to-get-a-pair-with-the-highest-value-from-a-mapping#:~:text=Solidity%20mapping%20does%20not%20support,a%20new%20entry%20is%20added. 
         I might have to add a max value property to the Election object
         */
        (Election memory election, Voter[] memory voter, Candidate[] memory candidate) = getElection(electionID);
        uint currentMaxVal = election.maxVoteCount[0];

        /* PROBLEM WITH THIS ALGORITHM: election.maxVoteCount is an integer. There is no
        inexpensive way to fetch the corresponding user to this maxVoteCount unless I make maxVoteCount
        some type of object that will contain the user with the highest amount of votes as well as
        the amount of votes they have.
        
        Possible solution: array with index 0 being the voter, and index 1 being the amount of votes they have
        */

        if (newValue > currentMaxVal) {
            election.maxVoteCount[0] = newValue;
            election.maxVoteCount[1] = candidateVoted;
        }
    }

        /*
    function getResults(uint electionID) public view returns (string memory winner, Election memory electionTurnout) {
        // this function should only return the winning user as well as vote statistics
        (Election memory election, Voter[] memory voters, Candidate[] memory candidate) = getElection(electionID);
        uint winner;*/
        


        
}
