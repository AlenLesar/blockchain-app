  App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      //Web3 instanca postavljena od strane Meta Maska
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      //Zadana instanca ukoliko web3 instanca nije pruzena
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Voting.json", function(voting) {
      // Instanciranje novog truffle ugovora 
      App.contracts.Voting = TruffleContract(voting);
      // Povezivanje providera za interakciju sa ugovorom
      App.contracts.Voting.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // azuriranje klijetske strane aplikacije za "voted" event i refresh stranice
  listenForEvents: function() {
    App.contracts.Voting.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Ponovno ucitavanje kad je zaprimljen novi glas
        App.render();
      });
    });
  },

  render: function() {
    var votingInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    content.show();

    // Ucitavanje podataka racuna
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Adresa računa: " + account);
      }
    });

    // Ucitavanje podataka ugovora
    App.contracts.Voting.deployed().then(function(instance) {
      votingInstance = instance;
      return votingInstance.noPlayers();
    }).then(function(noPlayers) {
      var playerResults = $("#playerResults");
      playerResults.empty();

      var playersSelect = $('#playersSelect');
      playersSelect.empty();

      for (var i = 1; i <= noPlayers; i++) {
        votingInstance.players(i).then(function(player) {
          var id = player[0];
          var name = player[1];
          var voteCount = player[2];
          var nationalTeam = player[3];
          var club = player[4];
          var position = player[5];

          // Generiranje podataka igraca
          var playerTemplate = "<tr><th>" + id + "</th><td>"+ position + "</td><td>" + name + "</td><td>" + nationalTeam +  "</th><td>" + club + "</th><td>"  + voteCount + "</td></tr>"
          playerResults.append(playerTemplate);

          var playerOption = "<option value='" + id  + "' >" +  name  + "</ option>"
          playersSelect.append(playerOption);
        });
      }
      return votingInstance.voters(App.account);
   }).then(function(hasVoted) {
     //ako je glasao, sakrij formu
     if(hasVoted) {
       $('form').hide();
     }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var playerId = $('#playersSelect').val();
    App.contracts.Voting.deployed().then(function(instance) {
      return instance.vote(playerId, { from: App.account });
    }).then(function(result) {
      // sacekaj da se glasovi azuriraju
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});