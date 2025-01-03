/*
* =================================================================================
* 
* Different players strategies for a Pridoner's Dilemma game or tournament
*
* Every player needs to be added to the `players` array to join the game
* The `players` array is in the Pen https://codepen.io/status201/pen/zYQBNRr
* which includes this Pen.
*
* Avaliable methods/variables:
*
* player.getMyLastPick() : this players previous pick
* player.getTheirLastPick() : the opponents previous pick
* 
* iteration : the current iteration of the game
* 
* player.remember(key, value) : remember stuff for later use
* player.recall(key) : recall from remembering
* player.forget(key) : forget and start fresh (otherwise will be remembered throughout games and rounds)
*
*
*/

let players = [
    "alwaysCooperate", // nice
    "alwaysDefect", // nasty
    "friedman", // nice
    "joss", // nasty
    "tester", // nasty
    "titForTat", // nice
    "titForTatForgiving", // nice
    "titForTwoTats", // nice
    "random", // "nicety"
    "randomNasty", // "nasty"
    "randomVeryNasty", // "nasty"
    "randomSuperNasty", // "nasty"
    "randomHyperNasty", // "nasty"
    "randomNice", // "nice"
    "randomVeryNice", // "nice"
    "randomSuperNice", // "nice"
    "randomHyperNice", // "nice"
  ];
  
  /*
  * alwaysCooperate does what you would expect.
  *
  */
  function alwaysCooperate() {
    const name = 'alwaysCooperate';
    const player = new Player(name);
  
    return 1;
  }
  
  /*
  * alwaysDefect does what you would expect.
  *
  */
  function alwaysDefect() {
    const name = 'alwaysDefect';
    const player = new Player(name);
    
    return 0;
  }
  
  /*
  * titForTat is a nice guy, but not a pussy.
  *
  */
  function titForTat() {
    const name = 'titForTat';
    const player = new Player(name);
    
    if (iteration === 0) {return 1;}
    if (player.getTheirLastPick() === 1) {return 1;}
    if (player.getTheirLastPick() === 0) {return 0;}
  }
  
  /*
  * titForTatForgiving; forgives 10% of defections
  *
  */
  function titForTatForgiving() {
    const name = 'titForTatForgiving';
    const player = new Player(name);
    
    if (iteration === 0) {return 1;}
    if (player.getTheirLastPick() === 1) {return 1;}
    if (player.getTheirLastPick() === 0) {
      return player.getRandomBit(10);
    }
  }
  
  /*
  * titForTwoTats; only defects after 2 defections in a row
  *
  */
  function titForTwoTats() {
    const name = 'titForTwoTats';
    const player = new Player(name);
    
    if (iteration === 0) {
      player.forget('defected');
      return 1;
    }
    if (player.getTheirLastPick() === 1) {
      player.forget('defected');
      return 1;
    }
    if (player.getTheirLastPick() === 0) {
      if (player.recall('defected')) {
        return 0;
      } else {
        player.remember('defected', 1);
        return 1;
      }
      
    }
  }
  
  /*
  * friedman can hold a grudge.
  *
  */
  function friedman() {
    const name = 'friedman';
    const player = new Player(name);
    
    if (iteration === 0) {
      player.forget('grudge');
      return 1;
    }
    if (player.recall('grudge')) {
      return 0;
    }
    if (player.getTheirLastPick() === 0) {
      player.remember('grudge', 1);
      return 0;
    }
    if (player.getTheirLastPick() === 1) {
      return 1;
    }  
  }
  
  /*
  * joss is sneaky.
  *
  */
  function joss() {
    const name = 'joss';
    const player = new Player(name);
    
    if (iteration === 0) {return 1;}
    
    // Roughly every 1 out of 10, get sneaky
    let sneaky = player.getRandomBit(10);
    return sneaky ? 0 : player.getTheirLastPick();
  }
  
  /*
  * tester tests if opponent retaliates. 
  * If so apologizes and plays tit for tat, otherwise alernates
  *
  */
  function tester() {
    const name = 'tester';
    const player = new Player(name);
    
    if (iteration === 0) {
      player.forget('retaliated');
      return 0;
    } 
    if (iteration === 2 && player.getTheirLastPick() === 0) {
      player.remember('retaliated', 1);
      return 1;
    }
    if (player.recall('retaliated')) {
      if (player.getTheirLastPick() === 1) {return 1;}
      if (player.getTheirLastPick() === 0) {return 0;}    
    } else {
      return iteration % 2;
    }
  }
  
  function random() {
    const name = 'random';
    const player = new Player(name);
   
    return player.getRandomBit();
  }
  
  /*
  * randomNasty has a 15% bias towards defecting
  *
  */
  function randomNasty() {
    const name = 'randomNasty';
    const player = new Player(name);
    
    return player.getRandomBit(35);
  }
  
  /*
  * randomVeryNasty has a 30% bias towards defecting
  *
  */
  function randomVeryNasty() {
    const name = 'randomVeryNasty';
    const player = new Player(name);
    
    return player.getRandomBit(30);
  }
  
  /*
  * randomSuperNasty has a 45% bias towards defecting
  *
  */
  function randomSuperNasty() {
    const name = 'randomSuperNasty';
    const player = new Player(name);
    
    return player.getRandomBit(5);
  }
  
  /*
  * randomHyperNasty has a 49% bias towards defecting
  *
  */
  function randomHyperNasty() {
    const name = 'randomHyperNasty';
    const player = new Player(name);
    
    return player.getRandomBit(1);
  }
  
  /*
  * randomNice has a 15% bias towards cooperating
  *
  */
  function randomNice() {
    const name = 'randomNice';
    const player = new Player(name);
    
    return player.getRandomBit(65);
  }
  
  /*
  * randomVeryNice has a 30% bias towards cooperating
  *
  */
  function randomVeryNice() {
    const name = 'randomVeryNice';
    const player = new Player(name);
    
    return player.getRandomBit(80);
  }
  
  /*
  * randomSuperNice has a 45% bias towards cooperating
  *
  */
  function randomSuperNice() {
    const name = 'randomSuperNice';
    const player = new Player(name);
    
    return player.getRandomBit(95);
  }
  
  /*
  * randomHyperrNice has a 49% bias towards cooperating
  *
  */
  function randomHyperNice() {
    const name = 'randomHyperNice';
    const player = new Player(name);
    
    return player.getRandomBit(99);
  }
  
  
  /*
  * =================================================================================
  * 
  * Players class, with some methods to play the game
  */
  
  class Player {
    constructor(name) {
      this.name = name;
    }
    
    remember(key, value) {
      return sessionStorage.setItem(this.name + '.' + key, value) ? true : false;
    }
    
    recall(key) {
      return sessionStorage.getItem(this.name + '.' + key);
    }
    
    forget(key) {
      return sessionStorage.removeItem(this.name + '.' + key) ? true : false;
    }
    
    getMyLastPick() {
      if (currentPlayers.val[0] === undefined || previousPick[0] === undefined) return false;
      if (currentPlayers.val[0] === this.name) {
        return previousPick[0]
      }
      return previousPick[1];
    }
    
    getTheirLastPick() {
      if (currentPlayers.val[0] === undefined || previousPick[0] === undefined) return false;
      if (currentPlayers.val[0] === this.name) {
        return previousPick[1]
      }
      return previousPick[0];
    }
    
    getRandomBit(oddsPercentage=50) {
      const int8 = new Uint8Array(1);
      crypto.getRandomValues(int8);
      return int8[0] < (256/100) * oddsPercentage ? 1 : 0;           
    }
  }