(function () {
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
          ['img', { src: `images/${character}.png` }]],
        ['div', {}, ...usernameDom]
      ];
    });
  };

  const generatePlayers = ({ players, you }) => {
    const playersDom = generatePlayersDom(players, you);
    const playersEle = generateHTML(['div', { className: 'players' }, ...playersDom]);
    document.querySelector('main').prepend(playersEle);
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
        ['img', { src: `images/${card}.png` }]];
    });
  };

  const generateCards = ({ cards }) => {
    const cardsContainer = document.querySelector('.cards');
    const userCards = cardsTemplate(cards);
    cardsContainer.append(...userCards.map(generateHTML));
  };

  const closePopup = () => {
    const popupContainerEle = document.querySelector('.popup-container');
    popupContainerEle.style.visibility = 'hidden';

    const popups = popupContainerEle.querySelectorAll('article');
    popups.forEach(popup => {
      popup.style.visibility = 'hidden';
    });
  };

  const showCard = (event) => {
    const card = event.target.closest('.suit').querySelector('.card');
    const cardName = event.target.value;
    card.querySelector('img').src = `images/${cardName}.png`;
  };

  const updateDice = () => {
    const dice = document.querySelectorAll('.die');

    const diceValue = gameState.diceValue;
    dice[0].innerText = diceValue[0];
    dice[1].innerText = diceValue[1];
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
    const playerGroupEle = room.closest(`g`).querySelector('g');
    const positions = [[0, 0], [1, 1], [0, 1], [1, 2], [0, 2], [-1, 2]];
    const index = playerGroupEle.children.length;

    if (playerGroupEle.contains(characterElement)) {
      return;
    }

    characterElement.remove();
    playerGroupEle.append(characterElement)
    characterElement.setAttribute('cx', positions[index][0]);
    characterElement.setAttribute('cy', positions[index][1]);
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

    characterElement.setAttribute('cx', position[0] + 0.5);
    characterElement.setAttribute('cy', position[1] + 0.5);
  };

  const showTokens = () => {
    gameState.characters.forEach(({ position, name }) =>
      createToken(position, name, gameState.currentPlayer));
  };

  const moveCharacter = (position) => {
    const secretPassage = getSecretPassageEle();
    if (secretPassage.length > 0) {
      disableOptions(secretPassage);
    }

    const newPosition = new URLSearchParams(`position=[${position}]`);

    API.moveCharacter(newPosition)
      .then(() => {
        disableAllOptions();
        removeHighlightedPath();
      });
  };

  const highlightPosition = (position) => {
    const id = `${position[0]}-${position[1]}`;
    const targetElement = document.getElementById(id);
    targetElement.classList.add('highlight-path');
    targetElement.onclick = () =>
      moveCharacter(position);
  };

  const highlightPossiblePositions = () => {
    gameState.possibleMoves.forEach(position =>
      highlightPosition(position));
  };

  const rollDice = () => {
    API.rollDice();
  };

  const showAccusationPopup = () => {
    document.querySelector('.popup-container').style.visibility = 'visible';
    document.querySelector('#accuse-popup').style.visibility = 'visible';
  };

  const disableOption = (optionElement) => {
    removeHighlight(optionElement);
    optionElement.onclick = '';
  };

  const removeHighlightedPath = () => {
    const highlightedCells = document.querySelectorAll('.highlight-path');
    highlightedCells.forEach(node => {
      node.classList.remove('highlight-path');
      node.onclick = '';
    });
  };

  const pass = () => {
    removeHighlightedPath();
    API.passTurn();
  };

  const showSuspectPopup = () => {
    document.querySelector('.popup-container').style.visibility = 'visible';
    const popup = document.querySelector('#suspect-popup');
    const room = gameState.room.name;
    const container = document.querySelector('#selected-room');

    container.querySelector('img').src = `images/${room}.png`;
    popup.style.visibility = 'visible';
  };

  const disableOptions = (options) => options.forEach(disableOption);

  const disableAllOptions = () => {
    const options = document.querySelectorAll('.options .btn');
    const secretPassage = document.querySelectorAll('g > .highlight');
    disableOptions([...options, ...secretPassage]);
  };

  const moveThroughSecretPassage = () => API.useSecretPassage();

  const allowSecretPassage = options => {
    const { name, secretPassage } = gameState.room;

    const from = `#${name}-group .secret-passage`;
    const destination = `[id='${secretPassage.join('-')}']`;

    options.add('secret-passage', from, true, () => {
      moveThroughSecretPassage();
      disableOption(document.querySelector(from));
      disableOption(document.querySelector('#dice'));
      disableOption(document.querySelector(destination));
    });

    options.add('secret-passage', destination, true, x => x);
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

  const setDice = ([die1, die2]) => {
    const dice = document.querySelectorAll('.die');
    dice[0].innerText = die1;
    dice[1].innerText = die2;
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
      const imgDom = ['img', { src: `images/${cards[category]}.png` }];
      const img = generateHTML(imgDom);
      const cardElement = cardsElements[index];
      cardElement.id = cards[category];
      cardElement.replaceChildren(img);
    });
  };

  const showAccusationResult = () => {
    const { accuser, accusedCards, result } = gameState.accusation;

    document.querySelector('.popup-container').style.visibility = 'visible';
    const popup = document.querySelector('#accuse-result-popup');
    popup.style.visibility = 'visible';

    showResultCards(accusedCards, '#accuse-result-popup');

    const accusationMsgEle = popup.querySelector('#accusation-msg');
    const accusationMessage = getAccusationMessage(accuser, accusedCards);
    accusationMsgEle.innerText = accusationMessage;

    const resultMessageEle = popup.querySelector('#accuse-result-msg');
    const resultMessage = getAccusationResult(accuser, result);
    resultMessageEle.innerText = resultMessage;
  };

  const showGameOver = () => {
    const winner = gameState.currentPlayer.character;
    const winnerMessageEle = document.querySelector('.winner-message');
    winnerMessageEle.innerText = capitalize(winner) + ' Won!';

    const popupContainer = document.querySelector('.popup-container');
    popupContainer.style.visibility = 'visible';

    const gameOverPopup = document.querySelector('#game-over-popup');
    gameOverPopup.style.visibility = 'visible';
  };

  const accusationResult = (poller) => {
    setTimeout(() => {
      if (gameState.isMyTurn()) {
        pass();
        disableAllOptions();
      }

      closePopup();

      if (gameState.accusation.result) {
        showGameOver();
      }

      poller.startPolling();
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
      const dom = ['div', {}, ['img', { src: `images/${character}.png` }]];
      const imgContainer = generateHTML(dom);
      if (suspicionBreaker === character) {
        imgContainer.id = 'suspicion-breaker';
      }

      return imgContainer;
    });

    turnOrderEle.replaceChildren(...turnOrderChildren);
  };

  const showSuspicionResultPopup = () => {
    const { suspectedElements: suspectedCards } = gameState.suspicion;
    showSuspicionBreaker();
    showResultCards(suspectedCards, '#suspect-result-popup');

    document.querySelector('.popup-container').style.visibility = 'visible';
    const popup = document.querySelector('#suspect-result-popup');
    popup.style.visibility = 'visible';
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

  const ruleOut = ({ target }) => {
    const rulingOutCard = target.closest('.card').id;

    API.ruleOut(JSON.stringify({ rulingOutCard }))
      .then(disallowRuleOut);
  };

  const allowRuleOut = () => {
    const { suspectedElements: suspectedCards } = gameState.suspicion;

    const rulingOutCards = Object.values(suspectedCards).filter(suspectedCard =>
      gameState.you.cards.includes(suspectedCard));

    const suspicionPopup = document.querySelector('#suspect-result-popup');

    rulingOutCards.forEach(rulingOutCard => {
      const cardElement = suspicionPopup.querySelector(`#${rulingOutCard}`);
      cardElement.classList.add('highlight');
      cardElement.addEventListener('click', ruleOut, { once: true });
    });
  };

  const removeHighlight = (htmlElement) =>
    htmlElement.classList.remove('highlight');

  const removeCardsHighlight = () => {
    const suspicionPopup = document.querySelector('#suspect-result-popup');
    const highlightedCards = suspicionPopup.querySelectorAll('.cards-combo .highlight');
    highlightedCards.forEach(removeHighlight);
  };

  const afterRuleOut = (gamePoller) => {
    setTimeout(() => {
      closePopup();
      removeCardsHighlight();
      gamePoller.startPolling();
    }, 5000);
  };

  const updateSuspicionPopup = (suspicion) => {
    const suspicionPopup = document.querySelector('#suspect-result-popup');

    if (!gameState.didISuspect()) {
      return;
    }

    const { ruledOutWith } = suspicion;
    const ruledOutCardEle = suspicionPopup.querySelector(`#${ruledOutWith}`);
    ruledOutCardEle.classList.add('highlight');
  };

  const endSuspicion = (gamePoller, suspicionPoller) =>
    API.getGame()
      .then(({ suspicion }) => {
        if (!suspicion.ruledOut) {
          return;
        }

        suspicionPoller.stopPolling();
        updateSuspicionPopup(suspicion);
        afterRuleOut(gamePoller, suspicionPoller);
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
    if (!gameState.hasAnyoneSuspected() || gameState.isSuspicionRuledOut()) {
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

    const cards = JSON.stringify({ character, room, weapon });
    cb(cards)
      .then(closePopup);
  };

  const getSecretPassageEle = () =>
    document.querySelectorAll('g > .highlight');

  const suspect = () => {
    disableAllOptions();
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

  const main = () => {
    setupPopup('suspect', suspect);
    setupPopup('accuse', accuse);

    API.getGame()
      .then(gameData => {
        generatePlayers(gameData);
        generateCards(gameData.you);
        setDice(gameData.diceValue);
        includeTokens(gameData.characters);
      });

    const getGame = () =>
      API.getGame().then(gameData => gameState.setData(gameData));

    const poller = new Poller(getGame, 1000);

    gameState.addObserver(enableOptions);
    gameState.addObserver(highlightPossiblePositions);
    gameState.addObserver(highlightPossiblePositions);
    // gameState.addObserver(updateCurrentPlayerToken);
    gameState.addObserver(showTokens);
    gameState.addObserver(updateDice);
    gameState.addObserver(showAccusation(poller));
    gameState.addObserver(highlightTurn);
    gameState.addObserver(handleSuspicion(poller));

    poller.startPolling();
  };

  const gameState = new GameState();
  window.onload = main;
})();
