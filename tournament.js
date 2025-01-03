/*
* Prisoner's Dilemma Tournament
*
* This Pen includes Pen https://codepen.io/status201/pen/dPbVyeq 
* which holds the different player's strategies
* and the players array & class
*
* TODO
* - add button to clear results
* - add (configurable) generations, where succesful players survive and play against other succesful players
*
* - check the cumulative scores
* - add reactive front-end interface (using VanJS)
*
*/
const {a, div, li, p, ul, ol, hr, strong, em, span, h1, h2, h3, table, tbody, thead, th, tr, td, input, textarea, select, option, button, label, pre, sub, sup} = van.tags;

const tournament = van.state(true);
const activePlayers = van.state(players); // players come from included Pen
const currentPlayers = van.state([players[0],players[1]]); // when tournament is set to false, currentPlayers play against eachother
const randomNumberOfRounds = van.state(true);
const roundsNr = van.state(1000); // disregarded when randomNumberOfRounds is true

const generations = activePlayers.val.length; // TODO implement this (get rid of a loser every generation)

const points01 = van.state(5) // Player defects, Opponent cooperates
const points11 = van.state(3) // Player & Opponent both cooperate
const points00 = van.state(1) // Player & Opponent both defect
const points10 = van.state(0) // Player cooperates, Opponent defects

const loading = van.state(false);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const List = ({items}) => ul(items.map(it => li(it)));

const Select = ({options, selected, onchange, defaultSelected}) => select(
  {onchange: onchange},
  options.map(op => defaultSelected == op ? option({'selected': 'selected'}, op) : option(op))
);

const MultipleSelect = ({options, selected, onchange}) => select(
  {'multiple': 'multiple', onchange: onchange},
  options.map(op => option({'selected': 'selected'}, op))
);

const Table = ({head, data}) => table({'class': 'generated'},
  head ? thead(tr(head.map(h => th(h)))) : [],
  tbody(data.map(row => tr(
    row.map(col => td(col)),
  ))),
)


const PlayButton = () => div(
  {'class': 'form button'},
  button({'onclick': () => playButton(), 'class': loading.val ? 'loading' : ''},'Play')    
);
van.add(document.getElementById('settings-header'), PlayButton);

const TournamentCheckbox = () => div({'class': 'form checkbox'},
  input(
    {'type':'checkbox', 'onclick': () => tournament.val = !tournament.val, 'checked': tournament.val, 'id': 'tournamentCheckbox'}
  ), 
  label(
    {'for': 'tournamentCheckbox'}, 'Tournament', ` (${tournament.val})`
  )
);
van.add(document.getElementById('settings'), TournamentCheckbox);

const PlayersMultipleSelect = () => div(
  {
    'class': 'form select multiple ' + `tournament-${tournament.val}`
  },
  MultipleSelect({
    options: players,
    onchange: e => activePlayers.val = Array.from(e.target.options).filter(o => o.selected).map(o => o.value)
  })
);
van.add(document.getElementById('settings'), PlayersMultipleSelect);

const PlayerASelect = () => div(
  {'class': 'form select player ' + `tournament-${tournament.val}`},
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
);
van.add(document.getElementById('settings'), RoundsNrInput);

const pointsSettings = () => div({'class': 'form input number points-settings'},
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
      'id': 'input-points11', 'min': 1, 'max': 100, 'size': 2,
      'title': 'Player & Opponent both cooperate'
    }
  ),
  input(
    {
      'type':'number', 'value': `${points00.val}`, 
      'onchange': e => points00.val = e.target.value,
      'id': 'input-points00', 'min': 1, 'max': 100, 'size': 2,
      'title': 'Player & Opponent both defect'
    }
  ),
  input(
    {
      'type':'number', 'value': `${points10.val}`, 
      'onchange': e => points10.val = e.target.value,
      'id': 'input-points10', 'min': 1, 'max': 100, 'size': 2,
      'title': 'Player cooperates, Opponent defects'
    }
  ),
);
van.add(document.getElementById('settings'), pointsSettings);

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
let iteration = null;

// Keep the score
let scoreA = 0;
let scoreB = 0;
let playersScore = {};
let playersOpponentScore = {};
let playersScoreArray = [];



function playTournament() {
  let totalPlayers = activePlayers.val.length;
  let tournamentScore = {};
  
  for (let playerI = 0; playerI < totalPlayers; playerI++) {
    for (let opponentI = 0; opponentI < totalPlayers; opponentI++) {
      tournamentScore[activePlayers.val[playerI] +'-'+ activePlayers.val[opponentI]] = 
          playTheGame(activePlayers.val[playerI], activePlayers.val[opponentI]);

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

function playTheGame(playerA, playerB) {
  let rounds; // Players should not have access to rounds
  if (randomNumberOfRounds.val) {
    const roundsMin = 180;
    const roundsMax = 220;
    rounds = Math.round(Math.random() * (roundsMax - roundsMin) + roundsMin);
  } else {
    rounds = roundsNr.val;
  }
  
  const maxScoreTotal = rounds * (tournament.val ? activePlayers.val.length : 1) * (points11.val + points11.val);
  const maxScoreIndividual = rounds * (tournament.val ? activePlayers.val.length : 1) * points01.val;
  const maxScoreMessage = () => div(
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
  if (iteration < 1){
    van.add(document.getElementById('settings'), maxScoreMessage());
  }
  
  let outcome = new Array();
  scoreA = 0;
  scoreB = 0;
  for (iteration = 0; iteration < rounds; iteration++) {
    let params = new Array();
    let choiceA = window[playerA](params);
    //let choiceA = handle_function_call(playerA);
    let choiceB = window[playerB](params);
    //let choiceB = handle_function_call(playerB);

    outcome = calculatePoints(choiceA, choiceB);
    
    if (!tournament.val) {
      let gameDebug = () => pre(
        (choiceA),
        (' - '),
        (choiceB),
        (' > ' + outcome[0] + ' - ' + outcome[1])                               
      );
      van.add(document.getElementById('info'), gameDebug);
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
  if (tournament.val) {
    let tournamentScore = playTournament();
    let debugInfoText = JSON.stringify(tournamentScore, null, 4);
    const debugInfo = () => pre(
      debugInfoText
    );
    van.add(document.getElementById('info'), debugInfo);
    //console.log('playersScore: ', playersScore); 
    van.add(document.getElementById('result'), Table({
      head: ["Player", "Score", "Opponents", "Total"],
      data: playersScoreArray,
    }));
  } else {
    playTheGame(currentPlayers.val[0], currentPlayers.val[1]);
    const debugGame = () => p(`Score (${currentPlayers.val[0]}, ${currentPlayers.val[1]}): ${scoreA}, ${scoreB}. Total: ` + (scoreA + scoreB));
    van.add(document.getElementById('result'), debugGame);
  }
  // Reset iteration for a next run
  iteration = 0;
  loading.val = false;
  return true;
}

function playButton(){
  loading.val = true;
  sleep(100).then(() => fight());
}