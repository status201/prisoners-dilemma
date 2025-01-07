/*
* =================================================================================
* 
* Different players strategies for a Pridoner's Dilemma game or tournament
*
* Every player needs to be added to the `players` array to join the game
*
* Avaliable methods/variables:
*
* iteration : the current iteration of the game
* player.getMyLastPick() : current player's previous pick
* player.getTheirLastPick() : the opponent's previous pick
* player.remember(key, value) : remember stuff for later use
* player.recall(key) : recall from remembering
* player.forget(key) : forget and start fresh (otherwise will be remembered throughout games and rounds)
* player.getRandomBit(oddsPercentage) : returns a 0 or 1, with a default oddsPercentage of 50% (chance of a 1)
*
*/

let players = [
  "alwaysCooperate", // nice
  "alwaysDefect", // nasty
  "friedman", // nice
  "joss", // nasty
  "elon", // nasty
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
  return player.getTheirLastPick();
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
    return player.getTheirLastPick();
  } else {
    return iteration % 2;
  }
}

/*
* Elon is so rich that he can afford many lines of code.
* He tries to find out the opponent's strategy and respond accordingly.
* All to maximize his own profit.
*
* TODO: detect more
*/
function elon() {
  const name = 'elon';
  const player = new Player(name);
  
  let score = 0;
  
  //console.log('iteration: ', iteration);
  //todo: detect as many player strategies as possible
  if (iteration === 0) {
    player.forget('type');
    player.forget('score');
    return 1; // Start with cooperating?
  }
  if (iteration > 0) {
    score = parseInt(player.recall('score')) || 0;
    player.remember('score', score + player.getTheirLastPick());
  }
  
  if (iteration === 10) {
    //console.log('score i10:', parseInt(player.recall('score')));
    switch (parseInt(player.recall('score'))) {
      case 10:
        //console.log('Could be alwaysCooperate');
        player.remember('type', 'alwaysCooperate');
        return 0;
      case 0:
        //console.log('Could be alwaysDefect');
        player.remember('type', 'alwaysDefect');
        return 0;
      case 2:
        //console.log('Could be titForTat');
        player.remember('type', 'titForTat');
        return 0;
      case 3:
        //console.log('Could be titForTwoTats');
        player.remember('type', 'titForTwoTats');
        return 0;
    }
  }
  
  if (iteration === 15) {
    //console.log('Score i15: ', parseInt(player.recall('score')));
    switch (parseInt(player.recall('score'))) {
      case 2:
        //console.log('Could be friedman');
        player.remember('type', 'friedman');
        return 0;
      case 3:
      case 4:
        //console.log('could be joss');
        player.remember('type', 'joss');
        return 0;
      case 6:
        //console.log('Could be me!');
        player.remember('type', 'elon');
        return 1;
    }
  }
  
  if (iteration > 10) {
    switch(player.recall('type')){
      case 'alwaysCooperate':
        return 0;
      case 'alwaysDefect':
        return 0;
      case 'titForTat':
        return iteration % 2; // alternate
      case 'titForTwoTats':
        return ((iteration % 3 === 0) ? 1 : 0);// alternate every third?
      case 'friedman':
        return 0;
      case 'joss':
        return  player.getRandomBit(30) ? 0 : player.getTheirLastPick();
      case 'elon':
        return 1;
      default:
        return player.getRandomBit(2); // otherwise return most evil random bool
    }
  }
  
  return 0;
}
/*
* random has a 50% chance of cooperating
*
*/
function random() {
  const name = 'random';
  const player = new Player(name);
 
  return player.getRandomBit();
}

/*
* randomNasty has a 35% chance of cooperating
*
*/
function randomNasty() {
  const name = 'randomNasty';
  const player = new Player(name);
  
  return player.getRandomBit(35);
}

/*
* randomVeryNasty has a 30% chance of cooperating
*
*/
function randomVeryNasty() {
  const name = 'randomVeryNasty';
  const player = new Player(name);
  
  return player.getRandomBit(30);
}

/*
* randomSuperNasty has a 5% chance of cooperating
*
*/
function randomSuperNasty() {
  const name = 'randomSuperNasty';
  const player = new Player(name);
  
  return player.getRandomBit(5);
}

/*
* randomHyperNasty has a 1% chance of cooperating
*
*/
function randomHyperNasty() {
  const name = 'randomHyperNasty';
  const player = new Player(name);
  
  return player.getRandomBit(1);
}

/*
* randomNice has a 65% chance of cooperating
*
*/
function randomNice() {
  const name = 'randomNice';
  const player = new Player(name);
  
  return player.getRandomBit(65);
}

/*
* randomVeryNice has a 80% chance of cooperating
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
* randomHyperNice has a 49% bias towards cooperating
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
      return parseInt(previousPick[0]);
    }
    return parseInt(previousPick[1]);
  }
  
  getTheirLastPick() {
    if (currentPlayers.val[0] === undefined || previousPick[0] === undefined) return false;
    if (currentPlayers.val[0] === this.name) {
      return parseInt(previousPick[1]);
    }
    return parseInt(previousPick[0]);
  }
  
  getRandomBit(oddsPercentage=50) {
    const int8 = new Uint8Array(1);
    crypto.getRandomValues(int8);
    return int8[0] < (256/100) * oddsPercentage ? 1 : 0;           
  }
}