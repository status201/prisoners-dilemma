/*
* Prisoner's Dilemma Tournament
*
* This Pen includes Pen https://codepen.io/status201/pen/dPbVyeq (or players.js)
* which holds the different player's strategies
* and the players array & class
*
*/
const {a, div, li, p, ul, ol, hr, strong, em, span, h1, h2, h3, table, tbody, thead, th, tr, td, input, textarea, select, option, button, label, pre, sub, sup} = van.tags;

const tournament = van.state(true);
const activePlayers = van.state(players); // players come from included Pen
const currentPlayers = van.state([players[0],players[1]]); // when tournament is set to false, currentPlayers play against eachother
const randomNumberOfRounds = van.state(false);
const roundsNr = van.state(200); // disregarded when randomNumberOfRounds is true

const evolution = van.state(false); // New: evolution mode
const tournamentsPerElimination = van.state(3); // New: how many tournaments before eliminating loser
const evolutionProgress = van.state(0); // New: tracks current tournament in evolution cycle
const enableMutants = van.state(false); // New: enable random mutants
const mutantsPerCycle = van.state(1); // New: how many mutants to add per cycle
const mutantCounter = van.state(0); // New: tracks how many mutants have been created
const maxMutants = van.state(10); // New: maximum number of mutants to create
const playersTie = van.state(0); // New: tracks if players tied and random was added as tiebreaker

const points01 = van.state(5) // Player defects, Opponent cooperates
const points11 = van.state(3) // Player & Opponent both cooperate
const points00 = van.state(1) // Player & Opponent both defect
const points10 = van.state(0) // Player cooperates, Opponent defects

const tournamentCounter = van.state(0);

const loading = van.state(false);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to scroll to element
const scrollToElement = (element) => {
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Helper function to get crypto-based random integer in range [min, max]
const getRandomInt = (min, max) => {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const randomBytes = new Uint8Array(bytesNeeded);
  
  let randomValue;
  do {
    crypto.getRandomValues(randomBytes);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= maxValue - (maxValue % range));
  
  return min + (randomValue % range);
};

// Helper function to get crypto-based random 0 or 1 with percentage
const getRandomBit = (percentage = 50) => {
  const int8 = new Uint8Array(1);
  crypto.getRandomValues(int8);
  return int8[0] < (256/100) * percentage ? 1 : 0;
};

// Helper function to get crypto-based random float between 0 and 1
const getRandomFloat = () => {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] / (0xFFFFFFFF + 1);
};

// Helper function to generate random mutant strategies
const createMutant = () => {
  mutantCounter.val++;
  const mutantName = `mutant${mutantCounter.val}`;
  
  // Random strategy parameters using crypto
  const cooperateFirst = getRandomBit(50) === 1;
  const memoryLength = getRandomInt(1, 5); // 1-5 rounds of memory
  const forgivenessRate = getRandomInt(0, 99); // 0-99% chance to forgive
  const aggressionThreshold = getRandomFloat(); // 0.0-1.0 defection rate before retaliating
  const randomness = getRandomInt(0, 29); // 0-29% random behavior
  
  // Create the mutant function dynamically
  window[mutantName] = function() {
    const name = mutantName;
    const player = new Player(name);
    
    if (iteration === 0) {
      player.forget('defectHistory');
      return cooperateFirst ? 1 : 0;
    }
    
    // Track defection history
    let defectHistory = player.recall('defectHistory');
    if (!defectHistory) {
      defectHistory = '';
    }
    
    if (player.getTheirLastPick() === 0) {
      defectHistory += '0';
    } else {
      defectHistory += '1';
    }
    
    // Keep only recent history
    if (defectHistory.length > memoryLength) {
      defectHistory = defectHistory.slice(-memoryLength);
    }
    player.remember('defectHistory', defectHistory);
    
    // Calculate opponent's defection rate
    const defectCount = (defectHistory.match(/0/g) || []).length;
    const defectRate = defectCount / defectHistory.length;
    
    // Add some randomness
    if (player.getRandomBit(randomness)) {
      return player.getRandomBit(50);
    }
    
    // If opponent defected last round
    if (player.getTheirLastPick() === 0) {
      // Maybe forgive based on forgiveness rate
      if (player.getRandomBit(forgivenessRate)) {
        return 1;
      }
      // Check if their overall behavior warrants retaliation
      if (defectRate > aggressionThreshold) {
        return 0;
      }
      return 1;
    }
    
    // They cooperated last round
    return 1;
  };
  
  return {
    name: mutantName,
    params: {
      cooperateFirst,
      memoryLength,
      forgivenessRate,
      aggressionThreshold: Math.round(aggressionThreshold * 100),
      randomness
    }
  };
};

const List = ({items}) => ul(items.map(it => li(it)));

const Select = ({options, selected, onchange, defaultSelected}) => select(
  {onchange: onchange},
  options.map(op => defaultSelected === op ? option({'selected': 'selected'}, op) : option(op))
);

const MultipleSelect = ({options, selected, onchange}) => select(
  {'multiple': 'multiple', onchange: onchange},
  options.map(op => option({'selected': 'selected'}, op))
);

const Table = ({head, data, id}) => table({'class': 'generated', 'id': id},
  head ? thead(tr(head.map(h => th(h)))) : [],
  tbody(data.map(row => tr(
    row.map(col => td(col)),
  ))),
)


const PlayButton = () => div(
  {'class': 'form button'},
  button(
    {'onclick': () => playButtonClick(), 'class': loading.val ? 'loading' : ''},
    tournament.val && tournamentCounter.val > 0 ? 'Again': 'Play'
  )    
);
van.add(document.getElementById('settings-header'), PlayButton);

const ClearResultsButton = () => div(
  {'class': 'form button clear'},
  button({'onclick': () => clearResults(), 'class': 'clear', 'style': tournamentCounter.val && !loading.val ? '' : 'display:none', title: 'Clear and reset all tournament results'},'Clear & Reset')    
);
van.add(document.getElementById('result'), ClearResultsButton);

const TournamentCheckbox = () => div({'class': 'form checkbox'},
  input(
    {'type':'checkbox', 'onclick': () => tournament.val = !tournament.val, 'checked': tournament.val, 'id': 'tournamentCheckbox'}
  ), 
  label(
    {'for': 'tournamentCheckbox'}, 'Tournament', ` (${tournament.val})`
  )
);
van.add(document.getElementById('settings'), TournamentCheckbox);

// Evolution checkbox
const EvolutionCheckbox = () => div({'class': 'form checkbox'},
  input(
    {'type':'checkbox', 'onclick': () => evolution.val = !evolution.val, 'checked': evolution.val, 'id': 'evolutionCheckbox', 'disabled': !tournament.val}
  ), 
  label(
    {'for': 'evolutionCheckbox'}, 'Evolution (eliminate losers)', ` (${evolution.val})`
  )
);
van.add(document.getElementById('settings'), EvolutionCheckbox);

// Tournaments per elimination input
const TournamentsPerEliminationInput = () => div({'class': 'form input number ' + `evolution-${evolution.val}`, 'style': evolution.val ? '' : 'display:none'},
  label(
    {'for': 'tournamentsPerEliminationInput'}, 'Tournaments before elimination: '
  ),                                
  input(
    {
      'type':'number', 'value': `${tournamentsPerElimination.val}`, 
      'onchange': e => tournamentsPerElimination.val = e.target.value,
      'id': 'tournamentsPerEliminationInput', 'min': 1, 'max': 10
    }
  )
);
van.add(document.getElementById('settings'), TournamentsPerEliminationInput);

// New: Mutants checkbox
const MutantsCheckbox = () => div({'class': 'form checkbox', 'style': evolution.val ? '' : 'display:none'},
  input(
    {'type':'checkbox', 'onclick': () => enableMutants.val = !enableMutants.val, 'checked': enableMutants.val, 'id': 'mutantsCheckbox', 'disabled': !evolution.val}
  ), 
  label(
    {'for': 'mutantsCheckbox'}, 'Enable random mutants', ` (${enableMutants.val})`
  )
);
van.add(document.getElementById('settings'), MutantsCheckbox);

// New: Mutants per cycle input
const MutantsPerCycleInput = () => div({'class': 'form input number', 'style': evolution.val && enableMutants.val ? '' : 'display:none'},
  label(
    {'for': 'mutantsPerCycleInput'}, 'Mutants per elimination cycle: '
  ),                                
  input(
    {
      'type':'number', 'value': `${mutantsPerCycle.val}`, 
      'onchange': e => mutantsPerCycle.val = e.target.value,
      'id': 'mutantsPerCycleInput', 'min': 1, 'max': 5
    }
  )
);
van.add(document.getElementById('settings'), MutantsPerCycleInput);

// New: Max mutants input
const MaxMutantsInput = () => div({'class': 'form input number', 'style': evolution.val && enableMutants.val ? '' : 'display:none'},
  label(
    {'for': 'maxMutantsInput'}, 'Maximum total mutants: '
  ),                                
  input(
    {
      'type':'number', 'value': `${maxMutants.val}`, 
      'onchange': e => maxMutants.val = e.target.value,
      'id': 'maxMutantsInput', 'min': 1, 'max': 50
    }
  )
);
van.add(document.getElementById('settings'), MaxMutantsInput);

const PlayersMultipleSelect = () => div(
  {
    'class': 'form select multiple ' + `tournament-${tournament.val}`
  },
  label('Tournament participants:'),
  MultipleSelect({
    options: players,
    onchange: e => activePlayers.val = Array.from(e.target.options).filter(o => o.selected).map(o => o.value)
  })
);
van.add(document.getElementById('settings'), PlayersMultipleSelect);

const PlayerASelect = () => div(
  {'class': 'form select player ' + `tournament-${tournament.val}`},
  p('Game players:'),
  label('Player A: '),
  Select({
    options: players, 
    onchange: e => currentPlayers.val[0] = Array.from(e.target.options).filter(o => o.selected).map(o => o.value)[0],
    defaultSelected: currentPlayers.val[0]
  })
);
van.add(document.getElementById('settings'), PlayerASelect);

const PlayerBSelect = () => div(
  {'class': 'form select player ' + `tournament-${tournament.val}`},
  label('Player B: '),
  Select({
    options: players,
    onchange: e => currentPlayers.val[1] = Array.from(e.target.options).filter(o => o.selected).map(o => o.value)[0],
    defaultSelected: currentPlayers.val[1]
  })    
);
van.add(document.getElementById('settings'), PlayerBSelect);

const RandomRoundsCheckbox = () => div({'class': 'form checkbox'},
  input(
    {'type':'checkbox', 'onclick': () => randomNumberOfRounds.val = !randomNumberOfRounds.val, 'checked': randomNumberOfRounds.val, 'id': 'randomRoundsCheckbox'}
  ), 
  label(
    {'for': 'randomRoundsCheckbox'}, 'Random number of rounds', ` (${randomNumberOfRounds.val})`
  )
);
van.add(document.getElementById('settings'), RandomRoundsCheckbox);

const RoundsNrInput = () => div({'class': 'form input number ' + `random-${randomNumberOfRounds.val}`},
  label(
    {'for': 'roundsNrInput'}, 'Number of rounds: '
  ),                                
  input(
    {
      'type':'number', 'value': `${roundsNr.val}`, 
      'onchange': e => roundsNr.val = e.target.value,
      'id': 'roundsNrInput', 'min': 1, 'max': 100000
    }
  ),
  p(randomNumberOfRounds.val ? ' (more or less)' : ''),
);
van.add(document.getElementById('settings'), RoundsNrInput);

const PointsSettings = () => div({'class': 'form input number points-settings'},
  label(
    'Points/Rewards: '
  ), 
  input(
    {
      'type':'number', 'value': `${points01.val}`, 
      'onchange': e => points01.val = e.target.value,
      'id': 'input-points01', 'min': -100, 'max': 100, 'size': 2,
      'title': 'Player defects, Opponent cooperates'
    }
  ),
  input(
    {
      'type':'number', 'value': `${points11.val}`, 
      'onchange': e => points11.val = e.target.value,
      'id': 'input-points11', 'min': -100, 'max': 100, 'size': 2,
      'title': 'Player & Opponent both cooperate'
    }
  ),
  input(
    {
      'type':'number', 'value': `${points00.val}`, 
      'onchange': e => points00.val = e.target.value,
      'id': 'input-points00', 'min': -100, 'max': 100, 'size': 2,
      'title': 'Player & Opponent both defect'
    }
  ),
  input(
    {
      'type':'number', 'value': `${points10.val}`, 
      'onchange': e => points10.val = e.target.value,
      'id': 'input-points10', 'min': -100, 'max': 100, 'size': 2,
      'title': 'Player cooperates, Opponent defects'
    }
  ),
);
van.add(document.getElementById('settings'), PointsSettings);

const PointsMatrixTable = () => table({'class': 'pointsMatrix'},
  tbody(
    tr(
      th('Points',sub(' A'),'\\',sup('B')), th('B: 0 (defect)'), th('B: 1 (cooperate)')
    ),
    tr(
      th('A: 0 (defect)'), td(
        sub(points00),(` \\ `), sup(points00)
      ), td(
        sub(points01),(` \\ `), sup(points10)
      )
    ),
    tr(
      th('A: 1 (cooperate)'), td(
        sub(points10),(` \\ `), sup(points01)
      ), td(
        sub(points11),(` \\ `), sup(points11)
      )
    )
  )
)
van.add(document.getElementById('settings'), PointsMatrixTable())
  
let playerA;
let playerB;
let previousPick = new Array();
let iteration = 0;

// Keep the score
let scoreA = 0;
let scoreB = 0;
let playersScore = {};
let playersOpponentScore = {};
let playersScoreArray = [];



function playTournament(rounds) {
  let totalPlayers = activePlayers.val.length;
  let tournamentScore = {};
  
  for (let playerI = 0; playerI < totalPlayers; playerI++) {
    for (let opponentI = 0; opponentI < totalPlayers; opponentI++) {
      tournamentScore[activePlayers.val[playerI] +'-'+ activePlayers.val[opponentI]] = 
          playTheGame(activePlayers.val[playerI], activePlayers.val[opponentI], rounds);

      playersScore[activePlayers.val[playerI]] = 
        (playersScore[activePlayers.val[playerI]] || 0) + tournamentScore[activePlayers.val[playerI] +'-'+ activePlayers.val[opponentI]][0];
      playersOpponentScore[activePlayers.val[playerI]]  = (playersOpponentScore[activePlayers.val[playerI]] || 0) + tournamentScore[activePlayers.val[playerI] +'-'+ activePlayers.val[opponentI]][1];
      playersScoreArray[playerI] = [ 
        activePlayers.val[playerI], 
        playersScore[activePlayers.val[playerI]], 
        playersOpponentScore[activePlayers.val[playerI]],
        playersScore[activePlayers.val[playerI]] + playersOpponentScore[activePlayers.val[playerI]]
      ];
      
    }
  }

  return tournamentScore;
}

function playTheGame(playerAParam, playerBParam, rounds) {
  playerA = playerAParam;
  playerB = playerBParam;
  const maxScoreTotal = rounds * (tournament.val ? activePlayers.val.length : 1) * (points11.val * 2);
  const maxScoreIndividual = rounds * (tournament.val ? activePlayers.val.length : 1) * points01.val;
  if (iteration === 0){  
    const MaxScoreMessage = () => div(
      hr(),
      p(
        ('Max individual score ('+ rounds +' rounds, ' + (tournament.val ? activePlayers.val.length : 2) + ' players): '),
        strong(maxScoreIndividual)
      ),
      p(
        ('Max total score ('+ rounds +' rounds, ' + (tournament.val ? activePlayers.val.length : 2) + ' players): '),
        strong(maxScoreTotal)
      )
    )
    van.add(document.getElementById('settings'), MaxScoreMessage());
  }
  
  let outcome = new Array();
  scoreA = 0;
  scoreB = 0;
  for (iteration = 0; iteration < rounds; iteration++) {
    let params = new Array();
    let choiceA = window[playerA](params);
    let choiceB = window[playerB](params);
    let playerNamesHeader;

    previousPick = [];
    previousPick[0] = false;
    previousPick[1] = false;
    
    outcome = calculatePoints(choiceA, choiceB);
    
    if (!tournament.val) { // add an option to debug tournaments as well?
      if (iteration === 0) {
        playerNamesHeader = `${playerA} - ${playerB}:` + "\n\n";
      } else {
        playerNamesHeader = '';
      }
      let GameDebug = () => pre(
        (playerNamesHeader),
        (choiceA),
        (' - '),
        (choiceB),
        (' > ' + outcome[0] + ' - ' + outcome[1])                               
      );
      van.add(document.getElementById('info'), GameDebug);
    }
    
    scoreA = (scoreA || 0) + outcome[0];
    scoreB = (scoreB || 0) + outcome[1];
    previousPick[0] = choiceA;
    previousPick[1] = choiceB;
  }
  return [scoreA, scoreB];
}

function calculatePoints(choiceA, choiceB) {
  let pointsA;
  let pointsB;
  
  switch (true) {
    case (choiceA > choiceB):
      pointsA = points10.val; pointsB = points01.val;
      break;
    case (choiceA < choiceB):
      pointsA = points01.val; pointsB = points10.val;
      break;
    case (choiceA === 1 && choiceB === 1):
      pointsA = points11.val; pointsB = points11.val; 
      break;
    default:
      pointsA = points00.val; pointsB = points00.val;
  }
  
  return new Array(parseInt(pointsA), parseInt(pointsB));
}


// Fight here!
function fight(){
  let rounds;
  if (randomNumberOfRounds.val) {
    const roundsMin = Math.ceil(parseInt(roundsNr.val) - (0.1 * roundsNr.val));
    const roundsMax = Math.ceil(parseInt(roundsNr.val) + (0.1 * roundsNr.val));
    rounds = getRandomInt(roundsMin, roundsMax);
  } else {
    rounds = roundsNr.val;
  }
  
  if (tournament.val) {
    let tournamentScore = playTournament(rounds);
    let debugInfoText = `--------------\nTournament ${tournamentCounter.val} \n--------------\n\n`;
    debugInfoText += JSON.stringify(tournamentScore, null, 4);
    const DebugInfo = () => pre({class:'debug-tournament'},
      debugInfoText
    );
    van.add(document.getElementById('info'), DebugInfo);
    
    // Display results
    van.add(document.getElementById('result'), Table({
      head: ["Player", "Score", "Opponents", "Total"],
      data: playersScoreArray,
      id: 'tournament-table-' + tournamentCounter.val
    }));
    highlightWinners(document.getElementById('tournament-table-' + tournamentCounter.val));
    
    // Handle evolution/elimination
    if (evolution.val && activePlayers.val.length > 1) {
      evolutionProgress.val++;
      
      if (evolutionProgress.val >= parseInt(tournamentsPerElimination.val)) {
        // Find the loser (lowest score)
        let lowestScore = Infinity;
        let loserIndex = -1;
        let loserCount = 0;
        
        // First pass: find the lowest score
        for (let i = 0; i < playersScoreArray.length; i++) {
          const score = playersScoreArray[i][1]; // Individual score
          // Updated condition to make random lose in final tournament after tie
          if (score < lowestScore && !(playersTie.val === 1 && (activePlayers.val[i] === 'random' && activePlayers.val.length > 2))) {
            lowestScore = score;
            loserIndex = i;
            loserCount = 1;
          } else if (score === lowestScore) {
            loserCount++;
          }
        }
        
        // Check if all players are tied (everyone has the same score)
        const allScoresSame = playersScoreArray.every(player => player[1] === playersScoreArray[0][1]);
        
        if (allScoresSame && activePlayers.val.length > 1) {
          // Set playersTie flag before adding random player
          playersTie.val = 1;
          
          // All players are tied - add random player as tiebreaker
          const TiebreakerMessage = () => div(
            {class: 'tiebreaker-message', style: 'background: #fff3e0; padding: 10px; margin: 10px 0; border-left: 4px solid #ff9800;'},
            strong('⚖️ TIE DETECTED: '),
            span(`All ${activePlayers.val.length} players tied with score ${playersScoreArray[0][1]}. Adding "random" player as tiebreaker!`)
          );
          van.add(document.getElementById('result'), TiebreakerMessage);
          
          // Scroll to tiebreaker message
          sleep(100).then(() => {
            const messages = document.getElementsByClassName('tiebreaker-message');
            if (messages.length > 0) {
              scrollToElement(messages[messages.length - 1]);
            }
          });
          
          // Add random player if not already present
          if (!activePlayers.val.includes('random')) {
            activePlayers.val = [...activePlayers.val, 'random'];
          }
          
          // Reset evolution progress and continue
          evolutionProgress.val = 0;
          playersScoreArray.length = 0;
          playersScore = {};
          playersOpponentScore = {};
          
          sleep(1000).then(() => {
            tournamentCounter.val++;
            fight();
          });
          return true;
        }
        
        if (loserIndex !== -1) {
          const eliminatedPlayer = activePlayers.val[loserIndex];
          
          // Show elimination message
          const eliminationElement = div(
            {class: 'elimination-message', style: 'background: #ffebee; padding: 10px; margin: 10px 0; border-left: 4px solid #f44336;'},
            strong('❌ ELIMINATED: '),
            span(eliminatedPlayer),
            span(` (Score: ${lowestScore})`),
            loserCount > 1 ? span(` - One of ${loserCount} players tied for last`) : ''
          );
          van.add(document.getElementById('result'), eliminationElement);
          
          // Scroll to elimination message
          sleep(100).then(() => {
            const messages = document.getElementsByClassName('elimination-message');
            if (messages.length > 0) {
              scrollToElement(messages[messages.length - 1]);
            }
          });
          
          // Remove loser from active players
          const newActivePlayers = activePlayers.val.filter((_, index) => index !== loserIndex);
          activePlayers.val = newActivePlayers;
          
          // Add mutants if enabled
          if (enableMutants.val && newActivePlayers.length > 1 && mutantCounter.val < parseInt(maxMutants.val)) {
            const mutantsToAdd = parseInt(mutantsPerCycle.val);
            const newMutants = [];
            
            for (let i = 0; i < mutantsToAdd; i++) {
              const mutant = createMutant();
              newMutants.push(mutant);
              activePlayers.val = [...activePlayers.val, mutant.name];
            }
            
            // Show mutant message
            const mutantDetails = newMutants.map(m => 
              `${m.name} (First: ${m.params.cooperateFirst ? 'Coop' : 'Defect'}, Memory: ${m.params.memoryLength}, Forgive: ${m.params.forgivenessRate}%, Aggression: ${m.params.aggressionThreshold}%, Random: ${m.params.randomness}%)`
            ).join('\n');
            
            const MutantMessage = () => div(
              {class: 'mutant-message'},
              strong('🧬 MUTANTS ADDED: '),
              span(`${mutantsToAdd} new random ${mutantsToAdd === 1 ? 'strategy' : 'strategies'}`),
              pre(mutantDetails)
            );
            van.add(document.getElementById('result'), MutantMessage);
            
            // Scroll to mutant message
            sleep(100).then(() => {
              const messages = document.getElementsByClassName('mutant-message');
              if (messages.length > 0) {
                scrollToElement(messages[messages.length - 1]);
              }
            });
          }
          
          // Reset evolution progress
          evolutionProgress.val = 0;
          
          // Check if we have a winner
          if (newActivePlayers.length === 1) {
            const winnerElement = div(
              {class: 'winner-message', style: 'background: #e8f5e9; padding: 20px; margin: 20px 0; border: 3px solid #4caf50; text-align: center;'},
              h2({style: 'margin: 0; color: #2e7d32;'}, '🏆 EVOLUTION WINNER 🏆'),
              p({style: 'font-size: 24px; margin: 10px 0;'}, strong(newActivePlayers[0])),
              p('Survived ', tournamentCounter.val, ' tournaments!')
            );
            van.add(document.getElementById('result'), winnerElement);
            
            // Scroll to winner message
            sleep(100).then(() => {
              const winners = document.getElementsByClassName('winner-message');
              if (winners.length > 0) {
                scrollToElement(winners[winners.length - 1]);
              }
            });
            
            loading.val = false;
            return true;
          }
          
          // Continue with next tournament automatically
          if (activePlayers.val.length > 1) {
            const continueElement = p(
              {class: 'continue-message', style: 'font-style: italic; color: #666; margin: 10px 0;'},
              `${activePlayers.val.length} players remaining. Next tournament starting...`
            );
            van.add(document.getElementById('result'), continueElement);
            
            // Reset scores for next tournament cycle
            playersScoreArray.length = 0;
            playersScore = {};
            playersOpponentScore = {};
            
            // Continue automatically
            sleep(1000).then(() => {
              tournamentCounter.val++;
              fight();
            });
            return true;
          }
        }
      } else {
        // Show progress towards elimination
        const progressElement = p(
          {class: 'progress-message', style: 'font-style: italic; color: #666; margin: 10px 0;'},
          `Evolution progress: ${evolutionProgress.val}/${tournamentsPerElimination.val} tournaments until elimination`
        );
        van.add(document.getElementById('result'), progressElement);
        
        // Scroll to progress message
        sleep(100).then(() => {
          const messages = document.getElementsByClassName('progress-message');
          if (messages.length > 0) {
            scrollToElement(messages[messages.length - 1]);
          }
        });
		
        // Continue automatically
        sleep(1000).then(() => {
          tournamentCounter.val++;
          fight();
        });
        return true;
      }
    }
    
  } else {
    playTheGame(currentPlayers.val[0], currentPlayers.val[1], rounds);
    const DebugGame = () => p(
      `Score (${currentPlayers.val[0]}, ${currentPlayers.val[1]}): ${scoreA}, ${scoreB}. Total: ` + (scoreA + scoreB)
    );
    van.add(document.getElementById('result'), DebugGame);
  }
  
  // Reset iteration for a next run
  iteration = 0;
  loading.val = false;
  return true;
}

function playButtonClick(){
  tournamentCounter.val = tournament.val ? ++tournamentCounter.val : tournamentCounter.val;
  
  // Reset evolution progress when starting fresh
  if (tournamentCounter.val === 1 && evolution.val) {
    evolutionProgress.val = 0;
    mutantCounter.val = 0; // Reset mutant counter
    playersTie.val = 0; // Reset tie flag
    // Reset active players to all selected players
    const selectedOptions = Array.from(document.querySelectorAll('#settings select[multiple] option:checked'));
    if (selectedOptions.length > 0) {
      activePlayers.val = selectedOptions.map(o => o.value);
    }
  }
  
  loading.val = true;
  sleep(100).then(() => fight());
}

function clearResults() {
  tournamentCounter.val = 0;
  evolutionProgress.val = 0;
  mutantCounter.val = 0;
  playersTie.val = 0; // Reset tie flag
  playersScoreArray.length = 0;
  playersScore = {};
  playersOpponentScore = {};
  
  // Clean up mutant functions
  for (let i = 1; i <= mutantCounter.val; i++) {
    delete window[`mutant${i}`];
  }
  
  // Reset active players to all selected
  const selectedOptions = Array.from(document.querySelectorAll('#settings select[multiple] option:checked'));
  if (selectedOptions.length > 0) {
    activePlayers.val = selectedOptions.map(o => o.value);
  } else {
    activePlayers.val = players;
  }
  
  let tables = document.getElementsByClassName('generated');
  while(tables.length > 0) {
     tables[0].parentNode.removeChild(tables[0]);
  }
  let debugs = document.getElementsByClassName('debug-tournament');
  while(debugs.length > 0) {
     debugs[0].parentNode.removeChild(debugs[0]);
  }
  let eliminations = document.getElementsByClassName('elimination-message');
  while(eliminations.length > 0) {
     eliminations[0].parentNode.removeChild(eliminations[0]);
  }
  let winners = document.getElementsByClassName('winner-message');
  while(winners.length > 0) {
     winners[0].parentNode.removeChild(winners[0]);
  }
  let continues = document.getElementsByClassName('continue-message');
  while(continues.length > 0) {
     continues[0].parentNode.removeChild(continues[0]);
  }
  let progresses = document.getElementsByClassName('progress-message');
  while(progresses.length > 0) {
     progresses[0].parentNode.removeChild(progresses[0]);
  }
  let tiebreakers = document.getElementsByClassName('tiebreaker-message');
  while(tiebreakers.length > 0) {
     tiebreakers[0].parentNode.removeChild(tiebreakers[0]);
  }
  let mutants = document.getElementsByClassName('mutant-message');
  while(mutants.length > 0) {
     mutants[0].parentNode.removeChild(mutants[0]);
  }
  let maxScores = document.querySelectorAll('#settings hr');
  maxScores.forEach(hr => {
    if (hr.nextSibling) hr.nextSibling.remove();
    if (hr.nextSibling) hr.nextSibling.remove();
    hr.remove();
  });
}

function highlightWinners(table) {
  if (table === null) return;

  let thead = table.tHead,
    tbody = table.tBodies[0],
    rowCount = tbody.rows.length,
    colCount = thead.rows[0].cells.length,
    maxValues = new Array(colCount),
    maxCells = new Array(colCount),
    i = rowCount - 1,
    j = colCount - 1,
    cell,
    value;

  for (; i > -1; i--) {
    for (; j > -1; j--) {
      cell = tbody.rows[i].cells[j];
      value = parseFloat(cell.innerHTML);
      if (value.toString() === "NaN") continue;
      if (value > (maxValues[j] === undefined ? -1 : maxValues[j])) {
        maxValues[j] = value;
        maxCells[j] = [i,j];
      }
    }
    j = colCount - 1;
  }

  for (; j > -1; j--) {
    if (maxCells[j] !== undefined){
      tbody.rows[maxCells[j][0]].cells[
        maxCells[j][1]
      ].setAttribute("class", "max");
    }
  }
}
