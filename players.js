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
  "friedman", // nice (but unforgiving once crossed)
  "joss", // nasty
  "elon", // nasty
  "tester", // nasty
  "adaptiveCooperator", // nice
  "smartCooperator", // nice
  "grandmaster", // nice (but retaliatory)
  "grandmaster2", // nice (but retaliatory)
  "titForTat", // nice (but retaliatory)
  "titForTatForgiving", // nice
  "titForTatForgivingR", // nice
  "titForTwoTats", // nice
  "random", // neutral
  "randomNasty", // nasty
  "randomVeryNasty", // nasty
  "randomSuperNasty", // nasty
  "randomHyperNasty", // nasty
  "randomNice", // nice
  "randomVeryNice", // nice
  "randomSuperNice", // nice
  "randomHyperNice", // nice
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
* titForTatForgiving - Classic winning strategy with smart forgiveness
*/
function titForTatForgiving() {
  const name = 'titForTatForgiving';
  const player = new Player(name);
  
  if (iteration === 0) {
    player.forget('theirCoopCount');
    return 1;
  }
  
  // Track their cooperation
  let theirCoopCount = parseInt(player.recall('theirCoopCount')) || 0;
  if (player.getTheirLastPick() === 1) {
    theirCoopCount++;
    player.remember('theirCoopCount', theirCoopCount);
  }
  
  const theirCoopRate = theirCoopCount / iteration;
  
  // If they defected last round
  if (player.getTheirLastPick() === 0) {
    // But they're generally cooperative (>75%), forgive with 20% probability
    if (theirCoopRate > 0.75) {
      return player.getRandomBit(20) ? 1 : 0;
    }
    // Otherwise retaliate
    return 0;
  }
  
  // They cooperated, so cooperate back
  return 1;
}

/*
* titForTatForgivingR; forgives 10% of defections
*
*/
function titForTatForgivingR() {
  const name = 'titForTatForgivingR';
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
* TODO: Fix Elon (easier said than done) and detect more and newly added opponents:
* "adaptiveCooperator", "smartCooperator", "grandmaster", "titForTatForgiving"
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
      case 10:
      case 11:
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
      case 7:
        player.log('Could be random?');
        player.remember('type', 'random');
        return 0;
      case 8:
        player.log('Still titForTwoTats');
        return (iteration % 3 === 0) ? 1 : 0;// alternate every third?
      case 9:
      case 10:
        player.log('titForTatForgiving maybe?');
        player.remember('type', 'titForTatForgiving');
        return (iteration % 2 === 0) ? 0 : 1; // alternate
      case 20:
      case 21:
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
      case 10:
      case 12:
      case 13:
      case 14:
        if (player.recall('type') === 'titForTat' || player.recall('type') === 'titForTwoTats' ) {
          player.log('Not a titForTat, Random or Joss?');
          player.remember('type', 'random');
        }
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
      case 'random':
        return 0;
      default:
        return player.getRandomBit(2);
    }
  }
  
  return 0;
}

/*
* adaptiveCooperator - A strategic player that balances cooperation and exploitation
* by Claude Sonnet 4.5
* 
* This strategy:
* 1. Starts cooperatively to build trust
* 2. Tracks opponent patterns to identify their strategy
* 3. Adapts behavior based on opponent type
* 4. Exploits pure cooperators while cooperating with reciprocators
* 5. Defends against defectors without getting stuck in mutual defection
*/
function adaptiveCooperator() {
  const name = 'adaptiveCooperator';
  const player = new Player(name);
  
  // First move: always cooperate
  if (iteration === 0) {
    player.forget('cooperations');
    player.forget('defections');
    player.forget('pattern');
    player.forget('exploitMode');
    return 1;
  }
  
  // Track opponent's behavior
  let cooperations = parseInt(player.recall('cooperations')) || 0;
  let defections = parseInt(player.recall('defections')) || 0;
  
  if (player.getTheirLastPick() === 1) {
    cooperations++;
    player.remember('cooperations', cooperations);
  } else {
    defections++;
    player.remember('defections', defections);
  }
  
  const total = cooperations + defections;
  const coopRate = cooperations / total;
  
  // Early game (first 5 rounds): probe opponent
  if (iteration <= 5) {
    // Mirror opponent to see if they reciprocate
    return player.getTheirLastPick();
  }
  
  // Mid-game strategy classification (rounds 6-15)
  if (iteration <= 15) {
    // Against pure cooperators (>90% cooperation): exploit cautiously
    if (coopRate > 0.9) {
      player.remember('pattern', 'cooperator');
      // Defect every 3rd round to maximize points while maintaining relationship
      return (iteration % 3 === 0) ? 0 : 1;
    }
    
    // Against pure defectors (>90% defection): punish but offer olive branch
    if (coopRate < 0.1) {
      player.remember('pattern', 'defector');
      // Mostly defect but occasionally cooperate to test if they'll change
      return (iteration % 7 === 0) ? 1 : 0;
    }
    
    // Against reciprocators (balanced): cooperate fully
    if (coopRate >= 0.4 && coopRate <= 0.9) {
      player.remember('pattern', 'reciprocator');
      return player.getTheirLastPick();
    }
    
    // Default: tit-for-tat
    return player.getTheirLastPick();
  }
  
  // Late game: execute optimal strategy based on identified pattern
  const pattern = player.recall('pattern');
  
  switch(pattern) {
    case 'cooperator':
      // Against pure cooperators: defect 40% of the time for maximum exploitation
      return player.getRandomBit(60);
      
    case 'defector':
      // Against defectors: mostly defect, rare cooperation attempts
      return (iteration % 8 === 0) ? 1 : 0;
      
    case 'reciprocator':
      // Against reciprocators (tit-for-tat, etc.): pure cooperation for mutual benefit
      return 1;
      
    default:
      // Against unknown/random: slightly favor cooperation but be cautious
      if (player.getTheirLastPick() === 0) {
        // If they just defected, defect back
        return 0;
      }
      // If they cooperated, cooperate with 80% probability
      return player.getRandomBit(80);
  }
}


/*
* smartCooperator - A winning strategy that cooperates intelligently
* Second try by Claude Sonnet 4.5
* Key principles:
* 1. Never defect first - avoid triggering grudge-holders like Friedman
* 2. Retaliate immediately to defection - pass Tester's check
* 3. Forgive occasional defections - handle Joss and random players well
* 4. Build long-term cooperation - maximize mutual gains
*/
function smartCooperator() {
  const name = 'smartCooperator';
  const player = new Player(name);
  
  // First move: always cooperate
  if (iteration === 0) {
    player.forget('theirDefections');
    player.forget('consecutiveDefections');
    player.forget('myLastMove');
    return 1;
  }
  
  // Track their behavior
  let theirDefections = parseInt(player.recall('theirDefections')) || 0;
  let consecutiveDefections = parseInt(player.recall('consecutiveDefections')) || 0;
  let myLastMove = parseInt(player.recall('myLastMove')) || 1;
  
  if (player.getTheirLastPick() === 0) {
    theirDefections++;
    consecutiveDefections++;
    player.remember('theirDefections', theirDefections);
    player.remember('consecutiveDefections', consecutiveDefections);
  } else {
    consecutiveDefections = 0;
    player.remember('consecutiveDefections', 0);
  }
  
  // Calculate cooperation rate
  const theirCoopRate = 1 - (theirDefections / iteration);
  
  // RULE 1: If they defected last round, retaliate once
  if (player.getTheirLastPick() === 0) {
    player.remember('myLastMove', 0);
    
    // But if they're showing mostly cooperative behavior (>70%), forgive occasional slips
    // This handles Joss (90% cooperative) and random nice players well
    if (theirCoopRate > 0.7 && consecutiveDefections === 1) {
      // Forgive single defections from generally cooperative players
      if (player.getRandomBit(30)) { // 30% chance to forgive
        player.remember('myLastMove', 1);
        return 1;
      }
    }
    
    return 0;
  }
  
  // RULE 2: If they're cooperating now, cooperate back
  // This works well against:
  // - titForTat (mutual cooperation)
  // - titForTwoTats (we retaliated, they forgave)
  // - Tester (we retaliated to their test, now they play nice)
  // - Elon (we appear cooperative but firm)
  player.remember('myLastMove', 1);
  return 1;
}


/*
* grandmaster - A tournament-optimized strategy
* Third try Claude Sonnet 4.5
* 
* Designed specifically to win tournaments by:
* 1. Maximizing cooperation with cooperators
* 2. Defending firmly against defectors
* 3. Passing all "tests" from sneaky strategies
*/
function grandmaster() {
  const name = 'grandmaster';
  const player = new Player(name);
  
  // Always cooperate first
  if (iteration === 0) {
    player.forget('defectCount');
    player.forget('lastDefect');
    return 1;
  }
  
  // Track defections
  let defectCount = parseInt(player.recall('defectCount')) || 0;
  let lastDefect = parseInt(player.recall('lastDefect')) || -10;
  
  if (player.getTheirLastPick() === 0) {
    defectCount++;
    lastDefect = iteration - 1;
    player.remember('defectCount', defectCount);
    player.remember('lastDefect', lastDefect);
  }
  
  const defectRate = defectCount / iteration;
  const sinceLast = iteration - 1 - lastDefect;
  
  // If they JUST defected, retaliate immediately
  if (player.getTheirLastPick() === 0) {
    return 0;
  }
  
  // They're cooperating now - decide whether to cooperate back
  
  // If they're mostly cooperative (< 30% defection), cooperate
  if (defectRate < 0.3) {
    return 1;
  }
  
  // If they defect a lot but it's been a while, give them one more chance
  if (sinceLast > 5) {
    return 1;
  }
  
  // Otherwise defect
  return 0;
}

/*
* grandmaster2 - Enhanced tournament strategy with random player adaptation
* Improved version by Claude Sonnet 4.5
* 
* Builds on grandmaster with key improvements:
* 1. Detects random players (30-70% defection rate, non-responsive behavior)
* 2. Adapts against random by cooperating 55% to maximize expected value
* 3. Strategic forgiveness (20%) against random-like opponents
* 4. Maintains strong performance vs Friedman and other strategic players
* 5. Periodic testing of defectors to detect strategy changes
*/
function grandmaster2() {
  const name = 'grandmaster2';
  const player = new Player(name);
  
  // Helper function to calculate defection rate from history
  const getDefectionRate = (history) => {
    if (history.length === 0) return 0;
    return history.filter(m => m === 0).length / history.length;
  };
  
  // Always cooperate on first move (critical for Friedman)
  if (iteration === 0) {
    player.forget('opponentHistory');
    return 1;
  }
  
  // Build opponent history
  let opponentHistory = player.recall('opponentHistory');
  opponentHistory = opponentHistory ? opponentHistory.split(',').map(Number) : [];
  opponentHistory.push(player.getTheirLastPick());
  player.remember('opponentHistory', opponentHistory.join(','));
  
  const lastOpponentMove = player.getTheirLastPick();
  
  // Immediate retaliation to any defection (passes Tester's test)
  if (lastOpponentMove === 0) {
    // But forgive occasionally against very random opponents
    const recentHistory = opponentHistory.slice(-10);
    const defectionRate = getDefectionRate(recentHistory);
    
    // If opponent seems very random (40-60% defection rate), use tit-for-tat with forgiveness
    if (defectionRate > 0.4 && defectionRate < 0.6) {
      // Forgive 20% of the time against random-like behavior
      if (player.getRandomBit(20)) return 1;
    }
    
    return 0;
  }
  
  // Track opponent's defection rate
  const overallDefectionRate = getDefectionRate(opponentHistory);
  
  // Against highly cooperative opponents (like alwaysCooperate), always cooperate
  if (overallDefectionRate < 0.1) return 1;
  
  // Against random players (30-70% defection rate), use adaptive strategy
  if (overallDefectionRate > 0.3 && overallDefectionRate < 0.7) {
    // Cooperate slightly more to maximize expected value against random
    return player.getRandomBit(55) ? 1 : 0;
  }
  
  // Against mostly defecting opponents, match their strategy
  if (overallDefectionRate > 0.7) {
    // But occasionally test if they'll cooperate
    if (iteration % 20 === 0) return 1;
    return 0;
  }
  
  // Default: cooperate (builds score with cooperative players)
  return 1;
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
