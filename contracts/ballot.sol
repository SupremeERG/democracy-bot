// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract Ballot {
    struct Voter {
        uint user;
        bool registered;
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
        uint[2] maxVote; // index 0 is the highest amount of votes in the election (x), index 1 is the user with the highest amount of votes (x)
    }

    mapping(uint electionID => Election electionObject) private elections;
    mapping(uint electionID => mapping(uint user => Voter voter)) private voters;
    mapping(uint electionID => Voter[]) private _voters;
    mapping(uint electionID => mapping(uint user => uint index)) private _votersIndex; // used to be able to tell where data is in an array so I don't have to loop through it
    mapping(uint electionID => mapping(uint user => Candidate candidate)) private candidates;
    mapping(uint electionID => Candidate[]) private _candidates;
    mapping(uint electionID => mapping(uint user => uint index)) private _candidatesIndex; // used to be able to tell where data is in an array so I don't have to loop through it


    // Error declarations
    error InvalidElectionID(uint electionID);
    error ElectionInactive(uint electionID);
    error UserAlreadyVoted(uint electionID, Voter voter);
    error VoterAlreadyExists(uint electionID, Voter existingVoter);
    error VoterNotRegistered(uint electionID, uint user);
    error CandidateAlreadyExists(uint electionID, Candidate existingCandidate);
    error CandidateDoesNotExist(uint electionID, uint user);
    

    // Event declarations
    event ElectionInitiated(uint electionID, uint guildID, uint owner, uint role, uint duration, uint endTime);
    event ElectionEnded(uint electionID, uint guildID, uint winner, uint role, uint duration);
    event CandidateAdded(uint electionID, uint user);
    event VoterRegistered(uint electionID, uint user);


    constructor() {
        voters[0][0] = Voter(0, true, true); // initialize an empty object for return purposes
        _voters[0].push(Voter(0, true, true));
        candidates[0][0] = Candidate(0,0);
        _candidates[0].push(Candidate(0,0)); // initialize an empty object for return purposes
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
        if (election.active != true) revert ElectionInactive(electionID);

        // sets the election inactive
        election.active = false;

        (uint electionWinner, , Candidate[] memory electionCandidates) = getResults(electionID);

        emit ElectionEnded(electionID, election.guildID, electionWinner, election.role, election.duration);
    }

    function addCandidate(uint electionID, uint user) public {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        (bool exists, Candidate storage candidate) = getCandidate(electionID, user);
        if (exists == true) revert CandidateAlreadyExists(electionID, candidate);

        candidates[electionID][user] = Candidate(user, 0);
        _candidates[electionID].push(Candidate(user, 0));
        _candidatesIndex[electionID][user] = _candidates[electionID].length - 1;

        emit CandidateAdded(electionID, user);
    }

    function registerVoter(uint electionID, uint user) public {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        if (verifyVoter(electionID, user) != false) revert VoterAlreadyExists(electionID, voters[electionID][user]);

        Voter memory newVoter = Voter(user, true, false);
        voters[electionID][user] = newVoter;
        _voters[electionID].push(newVoter);
        _votersIndex[electionID][user] = _voters[electionID].length - 1;

        emit VoterRegistered(electionID, user);
    }

    function vote(uint electionID, uint voter, uint candidate) public {
        // Voting logic
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        if (verifyVoter(electionID, voter) != true) revert VoterNotRegistered(electionID, voter);
        (bool candidateFound, Candidate storage pickedCandidate) = getCandidate(electionID, candidate);
        if (candidateFound != true) revert CandidateDoesNotExist(electionID, candidate);

        Voter storage electionVoter = voters[electionID][voter];
        if (electionVoter.voted == true) revert UserAlreadyVoted(electionID, electionVoter);

        pickedCandidate.votes += 1;
        _candidates[electionID][_candidatesIndex[electionID][candidate]].votes += 1;
        electionVoter.voted = true;

        max(electionID, pickedCandidate.votes, pickedCandidate.user);
        

    }

    function verifyElection(uint electionID) internal view returns (bool) {
        Election memory election = elections[electionID];
        if (election.active == false && election.initiator == 0) {
            return false;
        } else {
            return true;
        }
    }
    function verifyVoter(uint electionID, uint user) internal view returns (bool found) {
        Voter memory voter = voters[electionID][user];
        if (voter.registered == false) return false;
        return true;
    }

    function getElection(uint electionID) public view returns (Election memory, Voter[] memory, Candidate[] memory) {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);

        Voter[] memory electionVoters = _voters[electionID];
        Candidate[] memory electionCandidates = _candidates[electionID];

        return (elections[electionID], electionVoters, electionCandidates);
    }

    function getCandidate(uint electionID, uint user)
        internal
        view
        returns (bool found, Candidate storage candidate)
    {
        if (verifyElection(electionID) != true) revert InvalidElectionID(electionID);
        Candidate storage foundCandidate = candidates[electionID][user];

        if (foundCandidate.user == 0) return (false, candidates[0][0]);

        return (true, foundCandidate);
    }

    
    function max(uint electionID, uint newValue, uint candidateVoted) internal { // function for accounting for the highest amount of votes
        /* this function should evaluate the highest value in a mapping 
        by comparing an existing value with a new one and only
         replacing the old variable with the existing value if the comparison (newVal > highestVal)
         according to https://stackoverflow.com/questions/72091082/how-to-get-a-pair-with-the-highest-value-from-a-mapping#:~:text=Solidity%20mapping%20does%20not%20support,a%20new%20entry%20is%20added. 
         I might have to add a max value property to the Election object
         */
        Election storage election = elections[electionID];
        uint currentMaxVal = election.maxVote[0];

        /* PROBLEM WITH THIS ALGORITHM: election.maxVote is an integer. There is no
        inexpensive way to fetch the corresponding user to this maxVote unless I make maxVote
        some type of object that will contain the user with the highest amount of votes as well as
        the amount of votes they have.
        
        Possible solution: array with index 0 being the voter, and index 1 being the amount of votes they have
        */

        if (newValue > currentMaxVal) {
            election.maxVote[0] = newValue;
            election.maxVote[1] = candidateVoted;
        }
    }


    function getResults(uint electionID) public view returns (uint electionWinner, Election memory election, Candidate[] memory electionCandidates) {
        // this function should only return the winning user as well as vote statistics
        (Election memory election, , Candidate[] memory electionCandidates) = getElection(electionID);
        uint winner = election.maxVote[1];

        return (winner, election, electionCandidates);

    }
        


        
}
