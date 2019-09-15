var Voting = artifacts.require("./Voting.sol");

contract("Voting", function(accounts) {
  var votingInstance;

  it("initializes with two candidates", function() {
    return Voting.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 3);
    });
  });

  it("it initializes the candidates with the correct values", function() {
    return Voting.deployed().then(function(instance) {
      votingInstance = instance;
      return votingInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Virgil van Dijk", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return votingInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Lionel Messi", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
    });
  });
});

it("allows a voter to cast a vote", function() {
    return Voting.deployed().then(function(instance) {
      votingInstance = instance;
      candidateId = 1;
      return votingInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      return votingInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return votingInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });