pragma solidity ^0.5.0;

contract Voting {

    struct Player {
    	uint id;
    	string name;
    	uint noVotes;
      string nationalTeam;
      string club;
      string position;
    }

    //spremanje igraca
    mapping(uint => Player) public players;

    //spremanje adresa sa kojih je glasano 
    mapping(address => bool) public voters;

    //broj igraca
    uint public noPlayers;


    //funkcija za dodavanje igraca
    function addPlayer (string memory _name, string memory _nationalTeam, string memory _club, string memory _position ) private {
      noPlayers++;
      players[noPlayers] = Player(noPlayers, _name, 0, _nationalTeam, _club, _position);
    }

    //konstruktor u kojem se dodaju igraci
    constructor() public {
      addPlayer("Virgil van Dijk", "Nizozemska", "Liverpool", "CB");
      addPlayer("Lionel Messi", "Argentina", "Barcelona", "RW");
      addPlayer("Cristiano Ronaldo", "Portugal", "Juventus", "LW");
      }

    //azuriranje klijentske strane aplikacije kad dode do glasanja
    event votedEvent(
      uint indexed _playerId
    );

    function vote (uint _playerId) public {
     //provjera da nije glasano sa adrese
     require(!voters[msg.sender]);

     //provjera 
     require(_playerId > 0 && _playerId <= noPlayers);
      
      // record that voter has voted
      voters[msg.sender] = true;

      // update candidate vote count
      players[_playerId].noVotes ++;

      //okidanje voted eventa
      emit votedEvent(_playerId);
    }

  
}
