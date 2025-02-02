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

const players = [
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
  const debug = false;
  const player = new Player(name, debug);
  
  //player.log(player.recall('defected'), player.getTheirLastPick());
  
  if (iteration === 0) {
    player.forget('defected');
    return 1;
  }
  if (player.getTheirLastPick() === 1) {
    player.forget('defected');
    player.log('lastPick === 1');
    return 1;
  }
  if (player.getTheirLastPick() === 0) {
    if (player.recall('defected')) {
      return 0;
    } else {
      player.remember('defected', 1);
      player.log('First time defected, return 1');
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
    return (iteration % 2 === 0) ? 0 : 1;
  }
}

/*
* Elon is so rich that he can afford many lines of code.
* He tries to find out the opponent's strategy and respond accordingly.
* All to maximize his own profit.
*
* TODO: Fix Elon (easier said than done) and detect more opponents
*/
function elon() {
  const name = 'elon';
  let debug = false;
  const player = new Player(name, debug);
  
  let score = 0;

  //todo: detect as many player strategies as possible
  if (iteration === 0) {
    player.forget('type');
    player.forget('score');
    return 1; // Start with cooperating?
  } else {
    score = player.recall('score');
    score = (score === null || score === false || score === 'false') ? 0 : parseInt(score);
    player.remember('score', score + player.getTheirLastPick());
  }

  if (iteration === 5) {
    player.log(score);
    switch (score) {
      case 0:
        player.log('Could be alwaysDefect');
        player.remember('type', 'alwaysDefect');
        return 0;
      case 2:
        player.log('Could be titForTat');
        player.remember('type', 'titForTat');
        //return (iteration % 2 === 0) ? 0 : 1; // alternate
        return 1; // always cooperate for max results
      case 3:
        player.log('Could be titForTwoTats');
        player.remember('type', 'titForTwoTats');
        return (iteration % 3 === 0) ? 1 : 0;// alternate every third?
        //return (iteration % 2 === 0) ? 0 : 1; // alternate every second
      case 4:
        player.log('Could be alwaysCooperate');
        player.remember('type', 'alwaysCooperate');
        return 0;
    }
  }
  
  if (iteration === 10) {
    player.log(score);
    switch (score) {
      case 2:
        player.log('Could be friedman');
        player.remember('type', 'friedman');
        return 0;
      case 3:
      case 4:
        player.log('could be titForTat');
        player.remember('type', 'titForTat');
        //return (iteration % 2 === 0) ? 0 : 1; // alternate
        return 1; // always cooperate for max results
      case 5:
        if (player.recall('type') !== 'titForTwoTats') {
          player.log('could be elon');
          player.remember('type', 'elon');
          return 1;
        }
        return (iteration % 3 === 0) ? 1 : 0;// alternate every third?
      case 6:
      case 7:
          player.log('could be elon');
          player.remember('type', 'elon');
          return 1;        
    }
  }
  
  if (iteration === 15) {
    player.log(score);
    switch (score) {
      case 4:
      case 5:
        player.log('Could be joss');
        player.remember('type', 'joss');
        return 0;
      case 6:
        player.log('Still titFotTat?');
        //return (iteration % 2 === 0) ? 0 : 1; // alternate
        return 1; // always cooperate for max results
      case 8:
        player.log('Still titForTwoTats');
        return (iteration % 3 === 0) ? 1 : 0;// alternate every third?
      case 9:
      case 10:
        player.log('titForTatForgiving maybe?');
        player.remember('type', 'titForTatForgiving');
        return (iteration % 2 === 0) ? 0 : 1; // alternate
      case 16:
      case 17:
        player.log('Still Elon?');
        return 1;
    }
  }
  
  if (iteration === 25) {
    player.log(score);
    switch (score) {
      case 9:
        player.log('Could be joss');
        player.remember('type', 'joss');
        return 0;
    }
  }
  
  if (iteration > 5) {
    switch(player.recall('type')){
      case 'alwaysCooperate':
      case 'alwaysDefect':
        return 0;
      case 'titForTat':
        return 1; // always cooperate for max results
      case 'titForTatForgiving':
        return (iteration % 2 === 0) ? 0 : 1; // alternate
      case 'titForTwoTats':
        return (iteration % 3 === 0) ? 1 : 0;// alternate every third?
      case 'friedman':
        return 0;
      case 'joss':
        return  player.getRandomBit(30) ? 0 : player.getTheirLastPick();
      case 'elon':
        return 1;
      default:
        return player.getRandomBit(2);
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
  constructor(name, debug=false) {
    this.name = name;
    this.debug = debug;
  }
  
  remember(key, value) {
    return sessionStorage.setItem(this.name + '.' + key, value) ? true : false;
  }
  
  recall(key) {
    return sessionStorage.getItem(this.name + '.' + key); // returns null when empty
  }
  
  forget(key) {
    return sessionStorage.removeItem(this.name + '.' + key) ? true : false;
  }
  
  getMyLastPick() {
    if (playerA === undefined || playerB === undefined || previousPick[0] === undefined) return false;
    if (playerA === this.name) {
      return parseInt(previousPick[0]);
    } 
    return parseInt(previousPick[1]);
  }
  
  getTheirLastPick() {
    if (playerA === undefined || playerB === undefined || previousPick[0] === undefined) return false;
    if (playerA === this.name) {
      return parseInt(previousPick[1]);
    } 
    return parseInt(previousPick[0]);
  }
  
  getRandomBit(oddsPercentage=50) {
    const int8 = new Uint8Array(1);
    crypto.getRandomValues(int8);
    return int8[0] < (256/100) * oddsPercentage ? 1 : 0;           
  }
  
  log(message, message2=false) {
    if (this.debug) {
      message = message2 !== false ? `${message}\n${message2}` : message;
      console.log(`${iteration}. ${this.name}:`, message);
    }
  }
}