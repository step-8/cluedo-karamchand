(function () {
  const isEqual = (array1, array2) =>
    array1.every((element, index) => element === array2[index]);

  const createAttr = ([attribute, value], element) =>
    element.setAttribute(attribute, value);

  const setAttributes = (attributes, element) =>
    Object.entries(attributes).forEach(attSet => createAttr(attSet, element));

  const includeTokens = (characters) => {
    const board = document.querySelector('.board>svg');

    const playerTokens = characters.map((character) => {
      const { name, position } = character;
      return createElementTree(createTokenDom(name, position));
    });

    board.append(...playerTokens);
  };

  const createElementTree = ([tag, attributes, ...content]) => {
    const newContent = content.map(
      subTag => Array.isArray(subTag) ? createElementTree(subTag) : subTag);

    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    setAttributes(attributes, element);
    newContent.forEach(innerContent => element.append(innerContent));

    return element;
  };

  const generatePlayersDom = (players, you) => {
    return players.map(({ name, character }) => {
      const usernameDom = [['div', { className: 'name' }, name]];
      if (character === you.character) {
        usernameDom.push(['div', { className: 'you' }, '(You)']);
      }
      return ['div', { className: 'player', id: `${character}-profile` },
        ['div', { className: 'character' },
          ['img', { src: `/images/${character}.png` }]],
        ['div', {}, ...usernameDom]
      ];
    });
  };

  const generatePlayers = ({ players, you }) => {
    const playersDom = generatePlayersDom(players, you);
    const playersEle = generateHTML(['div', { className: 'players' }, ...playersDom]);
    document.querySelector('.players').replaceWith(playersEle);
  };

  const highlightTurn = () => {
    const highlightedEle = document.querySelector('.highlight-profile');
    if (highlightedEle !== null) {
      highlightedEle.classList.remove('highlight-profile');
    }

    const character = gameState.currentPlayer.character;
    const currentPlayerEle = document.querySelector(`#${character}-profile`);
    currentPlayerEle.classList.add('highlight-profile');
  };

  const fadeNonCompetitivePlayers = () => {
    const players = gameState.players;
    const nonCompetitivePlayers = players.filter(player => !player.isCompetitive);

    nonCompetitivePlayers.forEach(ncp => {
      const playerEle = document.querySelector(`#${ncp.character}-profile`);
      playerEle.classList.add('fade');
      playerEle.querySelector('img').classList.add('grayscale');
    });
  };

  const pulsate = (character) => {
    const charElement = document.getElementById(character);
    charElement.classList.add('current-player');
  };

  const removePulsate = (character) => {
    const charElement = document.getElementById(character);
    charElement.classList.remove('current-player');
  };

  const cardsTemplate = (cards) => {
    return cards.map(card => {
      return ['div', { className: 'card' },
        ['img', { src: `/images/${card}.png` }]];
    });
  };

  const generateCards = ({ cards }) => {
    const cardsContainer = document.querySelector('.cards');
    const userCards = cardsTemplate(cards);
    cardsContainer.append(...userCards.map(generateHTML));
  };

  const closePopup = () => {
    const popupContainerEle = document.querySelector('.popup-container');
    popupContainerEle.classList.add('hidden');

    const popups = popupContainerEle.querySelectorAll('article');
    popups.forEach(popup => {
      popup.classList.add('hidden');
      popup.classList.remove('zoom');
    });
  };

  const showCard = (event) => {
    const card = event.target.closest('.suit').querySelector('.card');
    const cardName = event.target.value;
    card.querySelector('img').src = `/images/${cardName}.png`;
  };

  const createTokenDom = (characterName, position) => {
    const token = ['circle',
      {
        id: characterName,
        cx: position[0] + 0.5,
        cy: position[1] + 0.5,
        class: 'token'
      }];
    return token;
  };

  const createTokenInRoom = (characterElement, room) => {
    const playerGroupEle = room.closest('g').querySelector('g');

    if (playerGroupEle.contains(characterElement)) {
      return;
    }

    characterElement.remove();
    characterElement.setAttribute('cx', 0);
    characterElement.setAttribute('cy', 0);
    playerGroupEle.append(characterElement);
  };

  const createToken = (position, character, currentPlayer) => {
    const characterElement = document.querySelector(`#${character}`);
    if (character === currentPlayer.character) {
      pulsate(character);
    } else {
      removePulsate(character);
    }

    const positionEle = document.getElementById(position.join('-'));

    if (positionEle.classList.contains('room')) {
      createTokenInRoom(characterElement, positionEle);
      return;
    }

    characterElement.remove();
    characterElement.setAttribute('cx', position[0] + 0.5);
    characterElement.setAttribute('cy', position[1] + 0.5);
    document.querySelector('svg').append(characterElement);
  };

  const arrangeTokens = () => {
    const groups = document.querySelectorAll('.room ~ g');

    for (const group of groups) {
      const positions = [[0, 0], [0.5, 1], [-1, 1], [0.2, 2], [2, 0.3], [2, 1.3]];
      let index = 0;

      for (const child of group.children) {
        child.setAttribute('cx', positions[index][0]);
        child.setAttribute('cy', positions[index][1]);
        index++;
      }
    }
  };

  const showTokens = () => {
    gameState.characters.forEach(({ position, name }) =>
      createToken(position, name, gameState.currentPlayer));

    arrangeTokens();
  };

  const moveCharacter = (position) => {
    const secretPassage = getSecretPassageEle();
    if (secretPassage.length > 0) {
      disableOptions(secretPassage);
    }

    API.moveCharacter({ position })
      .then(() => {
        disableAllOptions();
        removeHighlightedPath();
      });
  };

  const highlightPosition = (position) => {
    const id = `${position[0]}-${position[1]}`;
    const targetElement = document.getElementById(id);

    const isRoom = targetElement.classList.contains('room');
    const className = isRoom ? 'highlight-room' : 'highlight-path';
    targetElement.classList.add(className);
    targetElement.onclick = () => moveCharacter(position);
  };

  const highlightPossiblePositions = () => {
    if (!gameState.isMyTurn()) {
      return;
    }

    setTimeout(() => gameState.possibleMoves.forEach(position =>
      highlightPosition(position)), 1000);
  };

  const rollDice = () => {
    API.rollDice();
  };

  const showAccusationPopup = () => {
    document.querySelector('.popup-container').classList.remove('hidden');
    const accusePopup = document.querySelector('#accuse-popup');
    accusePopup.classList.remove('hidden');
    accusePopup.classList.add('zoom');
  };

  const disableOption = (optionElement) => {
    removeHighlight(optionElement);
    optionElement.onclick = '';
  };

  const removeHighlightedRooms = () => {
    const highlightedCells = document.querySelectorAll('.highlight-room');
    highlightedCells.forEach(node => {
      node.classList.remove('highlight-room');
      node.onclick = '';
    });
  };

  const removeHighlightedPath = () => {
    const highlightedCells = document.querySelectorAll('.highlight-path');
    highlightedCells.forEach(node => {
      node.classList.remove('highlight-path');
      node.onclick = '';
    });
    removeHighlightedRooms();
  };

  const pass = () => {
    removeHighlightedPath();
    API.passTurn();
  };

  const showSuspectPopup = () => {
    document.querySelector('.popup-container').classList.remove('hidden');
    const popup = document.querySelector('#suspect-popup');
    const room = gameState.room.name;
    const container = document.querySelector('#selected-room');

    container.querySelector('img').src = `/images/${room}.png`;
    popup.classList.remove('hidden');
    popup.classList.add('zoom');
  };

  const disableOptions = (options) => options.forEach(disableOption);

  const disableAllOptions = () => {
    const options = document.querySelectorAll('.options .btn');
    const secretPassage = document.querySelectorAll('g > .passage');
    disableOptions([...options, ...secretPassage]);
  };

  const moveThroughSecretPassage = () => API.useSecretPassage();

  const highlightPassage = (source, destination) => {
    const sourceElement = document.querySelector(source);
    const destinationElement = document.querySelector(destination);
    sourceElement.classList.add('highlight-passage');
    sourceElement.classList.add('passage');
    destinationElement.classList.add('highlight-passage-destination');
    destinationElement.classList.add('passage');
  };

  const allowSecretPassage = options => {
    const { name, secretPassage } = gameState.room;

    const source = `#${name}-group .secret-passage`;
    const destination = `[id='${secretPassage.join('-')}']`;
    highlightPassage(source, destination);

    options.add('secret-passage', source, true, () => {
      moveThroughSecretPassage();
      disableOption(document.querySelector(source));
      disableOption(document.querySelector('#dice'));
      disableOption(document.querySelector(destination));
      removeHighlightedPath();
    });
  };

  const enableOptions = () => {
    const options = new Options();

    options.add('rollDice', '#dice', gameState.canRollDice(), ({ target }) => {
      rollDice();
      disableOption(target.closest('#dice'));
    });

    options.add('pass', '#pass', gameState.canPassTurn(), () => {
      pass();
      disableAllOptions();
    });

    options.add('suspect', '#suspect', gameState.canSuspect(), showSuspectPopup);

    options.add('accuse', '#accuse', gameState.canAccuse(), showAccusationPopup);

    if (gameState.canUseSecretPassage()) {
      allowSecretPassage(options);
    }

    options.enable();
  };

  const setupDice = () => {
    const die1Element = document.querySelector('#die1');
    die1Element.className = 'die quick';

    const die2Element = document.querySelector('#die2');
    die2Element.className = 'die quick';
  };

  const setDice = () => {
    const [value1, value2] = gameState.diceValue;
    const die1Element = document.querySelector('#die1');
    die1Element.classList.remove('quick');
    die1Element.classList.add(`show-${value1}`);

    const die2Element = document.querySelector('#die2');
    die2Element.classList.remove('quick');
    die2Element.classList.add(`show-${value2}`);
  };

  const setDiceImmediately = ([value1, value2]) => {
    const die1Element = document.querySelector('#die1');
    die1Element.className = `die show-${value1} quick`;

    const die2Element = document.querySelector('#die2');
    die2Element.className = `die show-${value2} quick`;
  };

  const updateDice = () => {
    const oldValue = JSON.parse(localStorage.getItem('diceValue'));
    const newValue = gameState.diceValue;

    if (isEqual(newValue, oldValue)) {
      setDiceImmediately(newValue);
      return;
    }
    setupDice();
    saveDiceValue(newValue);
    setTimeout(setDice, 100);
  };

  const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

  const getAccusationMessage = () => {
    const { accuser, accusedCards } = gameState.accusation;
    const { character, room, weapon } = accusedCards;

    const accuserName = gameState.isMyTurn() ? 'you' : accuser.character;
    return `${capitalize(accuserName)} accused ${capitalize(character)}, in the ${capitalize(room)}, with the ${capitalize(weapon)}`;
  };

  const getAccusationResult = () => {
    const { accuser: { character }, result } = gameState.accusation;

    const resultMessage = result ? 'correct' : 'incorrect';
    const accuser = gameState.isMyTurn() ? 'your' : `${character}'s`;

    return `${capitalize(accuser)} accusation is ${resultMessage}!`;
  };

  const showResultCards = (cards, containerId) => {
    const popup = document.querySelector(containerId);
    const categories = ['character', 'room', 'weapon'];
    const cardsElements = popup.querySelectorAll('.card');

    categories.forEach((category, index) => {
      const imgDom = ['img', { src: `/images/${cards[category]}.png` }];
      const img = generateHTML(imgDom);
      const cardElement = cardsElements[index];
      cardElement.id = cards[category];
      cardElement.prepend(img);
    });
  };

  const showAccusationResult = () => {
    const { accuser, accusedCards, result } = gameState.accusation;

    document.querySelector('.popup-container').classList.remove('hidden');
    const popup = document.querySelector('#accuse-result-popup');
    popup.classList.remove('hidden');
    popup.classList.add('zoom');

    showResultCards(accusedCards, '#accuse-result-popup');

    const accusationMsgEle = popup.querySelector('#accusation-msg');
    const accusationMessage = getAccusationMessage(accuser, accusedCards);
    accusationMsgEle.innerText = accusationMessage;

    const resultMessageEle = popup.querySelector('#accuse-result-msg');
    const resultMessage = getAccusationResult(accuser, result);
    resultMessageEle.innerText = resultMessage;
  };

  const showGameOver = () => {
    if (!gameState.isGameOver()) {
      return;
    }

    const { currentPlayer, envelope } = gameState;
    const winner = currentPlayer.character;
    const winnerMessageEle = document.querySelector('.winner-message');
    winnerMessageEle.innerText = capitalize(winner) + ' Solved The Mystery!';

    showResultCards(envelope, '#game-over-popup');

    const popupContainer = document.querySelector('.popup-container');
    popupContainer.classList.remove('hidden');
    popupContainer.classList.add('game-over-bg');

    const gameOverPopup = document.querySelector('#game-over-popup');
    gameOverPopup.classList.remove('hidden');
    gameOverPopup.classList.add('zoom');
  };

  const accusationResult = (poller) => {
    setTimeout(() => {
      closePopup();

      poller.startPolling();

      if (gameState.accusation.result) {
        API.acknowledgeAcusation();
        return showGameOver();
      }

      if (gameState.isMyTurn()) {
        pass();
        disableAllOptions();
      }

    }, 10000);

    showAccusationResult();
  };

  const suspicionMessage = () => {
    const { suspectedElements: suspectedCards } = gameState.suspicion;
    const { character, room, weapon } = suspectedCards;

    const suspectedBy = gameState.isMyTurn() ?
      'You' : gameState.currentPlayer.character;

    return `${capitalize(suspectedBy)} suspected ${capitalize(character)}, in the ${capitalize(room)}, with the ${capitalize(weapon)}`;
  };

  const showSuspicionBreaker = () => {
    const { suspicionBreaker } = gameState.suspicion;
    const playerOrder = gameState.getTurnOrder();

    const turnOrderEle = document.querySelector('#turn-order');

    const turnOrderChildren = playerOrder.map(({ character }) => {
      const dom = ['div', {}, ['img', { src: `/images/${character}.png` }]];
      const imgContainer = generateHTML(dom);
      if (suspicionBreaker === character) {
        imgContainer.id = 'suspicion-breaker';
      }

      return imgContainer;
    });

    turnOrderEle.replaceChildren(...turnOrderChildren);
  };

  const suspicionResultMessage = ({ suspicionBreaker }) => {
    if (gameState.amISuspicionBreaker()) {
      return 'Select a card to rule out the suspicion';
    }

    if (suspicionBreaker) {
      return `${capitalize(suspicionBreaker)} can rule out the suspicion`;
    }

    return 'No one ruled out the suspicion';
  };

  const showSuspicionResultPopup = () => {
    const { suspectedElements: suspectedCards } = gameState.suspicion;
    showSuspicionBreaker();
    showResultCards(suspectedCards, '#suspect-result-popup');

    document.querySelector('.popup-container').classList.remove('hidden');

    const popup = document.querySelector('#suspect-result-popup');
    popup.classList.remove('hidden');
    popup.classList.add('zoom');

    const resultMessage = suspicionResultMessage(gameState.suspicion);
    popup.querySelector('h2').innerText = resultMessage;

    const message = suspicionMessage();
    popup.querySelector('#suspicion-msg').innerText = message;
  };

  const disallowRuleOut = () => {
    const suspicionPopup = document.querySelector('#suspect-result-popup');
    const cardsElements = suspicionPopup.querySelectorAll('.card');

    cardsElements.forEach(cardElement => {
      cardElement.removeEventListener('click', ruleOut);
      removeHighlight(cardElement);
    });
  };

  const unMarkRuledOutCard = () => {
    const imageEle = document.querySelector('#suspect-result-popup .fade');

    if (!imageEle) {
      return;
    }

    const cardElement = imageEle.closest('.card');
    const markEle = cardElement.querySelector('.mark');

    imageEle.classList.remove('fade');
    markEle.classList.add('hidden');
  };

  const markRuledOutCard = (cardElement) => {
    const markEle = cardElement.querySelector('.mark');
    const imageEle = cardElement.querySelector('img');

    imageEle.classList.add('fade');
    markEle.classList.remove('hidden');
  };

  const ruleOut = ({ target }) => {
    const rulingOutCardEle = target.closest('.card');
    const rulingOutCard = rulingOutCardEle.id;
    markRuledOutCard(rulingOutCardEle);

    API.ruleOut({ rulingOutCard })
      .then(disallowRuleOut);
  };

  const allowRuleOut = () => {
    const { suspectedElements: suspectedCards } = gameState.suspicion;
    const { cards: myCards } = gameState.you;

    const rulingOutCards = Object.values(suspectedCards).filter(suspectedCard =>
      myCards.includes(suspectedCard));

    const suspicionPopup = document.querySelector('#suspect-result-popup');

    rulingOutCards.forEach(rulingOutCard => {
      const cardElement = suspicionPopup.querySelector(`#${rulingOutCard}`);
      cardElement.classList.add('highlight-card');
      cardElement.addEventListener('click', ruleOut, { once: true });
    });
  };

  const removeHighlight = (htmlElement) => {
    htmlElement.classList.remove('highlight-btn');
    htmlElement.classList.remove('highlight-card');
    htmlElement.classList.remove('highlight-passage');
    htmlElement.classList.remove('highlight-passage-destination');
  };

  const removeCardsHighlight = () => {
    const suspicionPopup = document.querySelector('#suspect-result-popup');
    const highlightedCards = suspicionPopup.querySelectorAll('.cards-combo .highlight-btn');
    highlightedCards.forEach(removeHighlight);
  };

  const afterRuleOut = (gamePoller) => {
    setTimeout(() => {
      closePopup();
      removeCardsHighlight();
      unMarkRuledOutCard();
      gamePoller.startPolling();
    }, 5000);
  };

  const suspicionRuledOutMessage = suspicionBreaker =>
    capitalize(suspicionBreaker) + ' ruled out the suspicion';

  const updateSuspicionPopup = (suspicion) => {
    const suspicionPopup = document.querySelector('#suspect-result-popup');
    const { suspicionBreaker, ruledOutWith } = suspicion;

    if (suspicionBreaker) {
      const headerElement = suspicionPopup.querySelector('h2');
      headerElement.innerText = suspicionRuledOutMessage(suspicionBreaker);
    }

    if (!gameState.didISuspect() || !ruledOutWith) {
      return;
    }

    const ruledOutCardEle = suspicionPopup.querySelector(`#${ruledOutWith}`);
    markRuledOutCard(ruledOutCardEle);
  };

  const endSuspicion = (gamePoller, suspicionPoller) =>
    API.getGame()
      .then(({ suspicion }) => {
        if (!suspicion.ruledOut && suspicion.suspicionBreaker) {
          return;
        }

        suspicionPoller.stopPolling();
        API.acknowledgeSuspicion();
        updateSuspicionPopup(suspicion);
        afterRuleOut(gamePoller);
      });

  const handleRuleOut = (gamePoller) => {
    if (gameState.amISuspicionBreaker()) {
      allowRuleOut();
    }

    const suspicionPoller = new Poller(() =>
      endSuspicion(gamePoller, suspicionPoller), 1000);

    suspicionPoller.startPolling();
  };

  const handleSuspicion = (poller) => () => {
    if (!gameState.suspicion) {
      return;
    }

    poller.stopPolling();

    showSuspicionResultPopup();
    handleRuleOut(poller);
  };

  const showAccusation = (poller) => () => {
    if (!gameState.hasAnyoneAccused()) {
      return;
    }

    accusationResult(poller);
    poller.stopPolling();
  };

  const actOn = (action, cb) => {
    const form = document.querySelector(`#${action}-cards`);
    const formData = new FormData(form);

    const character = formData.get('characters');
    const weapon = formData.get('weapons');
    const room = action === 'suspected' ?
      gameState.room.name : formData.get('rooms');

    const cards = { character, room, weapon };
    cb(cards)
      .then(closePopup);
  };

  const getSecretPassageEle = () =>
    document.querySelectorAll('g > .passage');

  const suspect = () => {
    disableAllOptions();
    removeHighlightedPath();
    actOn('suspected', API.suspect);
  };

  const accuse = () => {
    disableAllOptions();
    actOn('accused', API.accuse);
  };

  const setupPopup = (action, cb) => {
    document.querySelector(`#${action}-btn`).onclick = cb;
    document.querySelector(`#${action}-cancel`).onclick = closePopup;

    const selects = document.querySelectorAll(`#${action}-popup select`);
    selects.forEach(select => {
      select.onchange = showCard;
    });
  };

  const rollDiceLogMessage = ({ actor, result: [value1, value2] }) =>
    `${capitalize(actor)} rolled dice, got ${value1 + value2}`;

  const suspectLogMessage = ({ actor, actionData }) => {
    const { character, weapon, room } = actionData;

    return `${capitalize(actor)} suspected ${character} with ${weapon} in ${room}`;
  };

  const accuseLogMessage = ({ actor, actionData }) => {
    const { character, weapon, room } = actionData;

    return `${capitalize(actor)} accused ${character} with ${weapon} in ${room}`;
  };

  const accusationOutcomeMessage = ({ actor, result }) => {
    if (result) {
      return `${capitalize(actor)} solved the mystery`;
    }
    return `${capitalize(actor)} got eliminated`;
  };

  const accusationStatusMessage = ({ actor, result }) => {
    const resultMessage = result ? 'correct' : 'incorrect';
    return `${capitalize(actor)}'s accusation was ${resultMessage}`;
  };

  const ruleOutLogMessage = ({ actor }) =>
    `${capitalize(actor)} ruled out the suspicion`;

  const secretPassageLogMessage = ({ actor }) =>
    `${capitalize(actor)} moved through secret passage`;

  const logMessageLookup = {
    'roll-dice': rollDiceLogMessage,
    'suspect': suspectLogMessage,
    'accuse': accuseLogMessage,
    'accusation-status': accusationStatusMessage,
    'accusation-outcome': accusationOutcomeMessage,
    'rule-out': ruleOutLogMessage,
    'secret-passage': secretPassageLogMessage,
  };

  const createLogElement = (log) => {
    const messageFormatter = logMessageLookup[log.action];
    return generateHTML(['li', { className: 'log' }, messageFormatter(log)]);
  };

  const showLogs = (logs) => {
    const logContainerElement = document.querySelector('.log-container');
    const logListElement = logContainerElement.querySelector('ul');

    const logsElements = logs.map(createLogElement);

    logListElement.append(...logsElements);
    logContainerElement.scrollTop = logContainerElement.scrollHeight;
  };

  const updateLogs = (logger) => () => {
    logger.addNewLogs(gameState.logs);
    showLogs(logger.getLatestLogs());
  };

  const saveOnLocale = (key, value) => {
    localStorage[key] = value;
  };

  const saveDiceValue = (diceValue) => {
    saveOnLocale('diceValue', JSON.stringify(diceValue));
  };

  const main = () => {
    setupPopup('suspect', suspect);
    setupPopup('accuse', accuse);

    API.getGame()
      .then(gameData => {
        generatePlayers(gameData);
        generateCards(gameData.you);
        includeTokens(gameData.characters);
        saveDiceValue(gameData.diceValue);
      });

    const getGame = () =>
      API.getGame().then(gameData => gameState.setData(gameData));

    const poller = new Poller(getGame, 1000);
    const logger = new Logger();

    const subscribers = [
      showGameOver,
      fadeNonCompetitivePlayers,
      updateDice,
      enableOptions,
      showTokens,
      showAccusation(poller),
      highlightTurn,
      handleSuspicion(poller),
      updateLogs(logger),
      highlightPossiblePositions
    ];

    subscribers.forEach(subscriber => gameState.addObserver(subscriber));

    poller.startPolling();
  };

  const gameState = new GameState();
  window.onload = main;
})();
