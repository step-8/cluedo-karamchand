(function () {
  const createAttr = ([attribute, value], element) => {
    element.setAttribute(attribute, value);
  };

  const setAttributes = (attributes, element) => {
    Object.entries(attributes).forEach(attSet => createAttr(attSet, element));
  };

  const createDom = ([tag, attributes, ...content]) => {
    const newContent = content.map(
      subTag => Array.isArray(subTag) ? createDom(subTag) : subTag);

    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    setAttributes(attributes, element);
    newContent.forEach(innerContent => element.append(innerContent));

    return element;
  };

  const generateStart = ({ position, color, name }, attributes) => {
    const [xCordinate, yCordinate] = position;
    const tile = ['rect',
      { x: xCordinate, y: yCordinate, ...attributes.start }];
    const character = ['circle',
      {
        id: name,
        fill: color,
        cx: xCordinate + 0.5, cy: yCordinate + 0.5, ...attributes.character
      }];
    return [tile, character];
  };

  const createStart = ({ startingPos, attributes }) => {
    return startingPos.flatMap(cell =>
      generateStart(cell, attributes));
  };

  const generatePath = ([x, y], attributes) => {
    return ['rect',
      { x, y, ...attributes.tiles, id: `${x}-${y}` }]; //Get ids from server.
  };

  const createPaths = ({ tiles, attributes }) => {
    return tiles.map(tile => generatePath(tile, attributes));
  };

  const generateRoom = ({ points, room, textPosition, id }, attributes) => {
    const [x, y] = textPosition;
    const roomPosition = ['polygon',
      { points: `${points.join(' ')}`, id, ...attributes.room }];
    const roomName = ['text',
      { x, y, 'font-size': '0.6', 'fill': 'white' }, room];
    return [roomPosition, roomName];
  };

  const createRooms = ({ rooms, attributes }) => {
    return rooms.flatMap(room => {
      return generateRoom(room, attributes);
    });
  };

  const createEnvelope = ({ attributes }) => {
    return [['rect',
      { ...attributes.envelope }],
    ['text', { ...attributes.envelopeText }, 'Envelope']];
  };

  const generateBoard = (boardData) => {
    const rooms = createRooms(boardData);
    const paths = createPaths(boardData);
    const start = createStart(boardData);
    const envelope = createEnvelope(boardData);
    const board = document.querySelector('.board');
    const boardAttr = boardData.attributes.board;
    board.append(createDom(
      ['svg', {
        ...boardAttr,
      }, ...rooms, ...paths, ...start, ...envelope]));
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
    currentPlayerEle.className = 'player highlight-profile';
  };

  const highlightCurrentPlayer = (character) => {
    const charElement = document.getElementById(character);
    charElement.setAttribute('class', 'current-player');
  };

  const removeHighlight = (character) => {
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

  const accuse = () => {
    const form = document.querySelector('#accused-cards');
    const formData = new FormData(form);

    const character = formData.get('characters');
    const room = formData.get('rooms');
    const weapon = formData.get('weapons');

    const accusedCards = JSON.stringify({ character, room, weapon });
    API.accuse(accusedCards)
      .then(closePopup);
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

  const createToken = (position, character, currentPlayer) => {
    const characterElement = document.querySelector(`#${character}`);
    if (character === currentPlayer.character) {
      highlightCurrentPlayer(character);
    } else {
      removeHighlight(character);
    }
    characterElement.setAttribute('cx', position[0] + 0.5);
    characterElement.setAttribute('cy', position[1] + 0.5);
  };

  const showTokens = () => {
    gameState.characters.forEach(({ position, name }) => {
      createToken(position, name, gameState.currentPlayer);
    });
  };

  const moveCharacter = (position) => {
    const newPosition = new URLSearchParams(`position=[${position}]`);

    API.moveCharacter(newPosition)
      .then(removeHightlightedPath);
  };

  const highlightPosition = (position) => {
    const id = `${position[0]}-${position[1]}`;
    const targetElement = document.getElementById(id);
    targetElement.setAttribute('class', 'highlight-path');
    targetElement.onclick = () =>
      moveCharacter(position);
  };

  const highlightPossiblePositions = () => {
    gameState.possibleMoves.forEach(position =>
      highlightPosition(position));
  };

  const diceRoll = () => {
    API.rollDice();
  };

  const showAccusationPopup = () => {
    document.querySelector('.popup-container').style.visibility = 'visible';
    document.querySelector('#accuse-popup').style.visibility = 'visible';
  };

  const highlightOptions = (optionElement) => {
    optionElement.classList.add('highlight');
  };

  const disableOptions = (optionElement) => {
    optionElement.classList.remove('highlight');
    optionElement.onclick = '';
  };

  const removeHightlightedPath = () => {
    const highlightedCells = document.querySelectorAll('.highlight-path');
    highlightedCells.forEach(node => {
      node.classList.remove('highlight-path');
      node.onclick = '';
    });
  };

  const pass = () => {
    removeHightlightedPath();
    API.passTurn();
  };

  const showSuspectPopup = () => {
    document.querySelector('.popup-container').style.visibility = 'visible';
    const popup = document.querySelector('#suspect-popup');
    const room = gameState.room;
    const container = document.querySelector('#selected-room');

    container.querySelector('img').src = `images/${room}.png`;
    popup.style.visibility = 'visible';
  };

  const enableOptions = () => {
    const diceBox = document.querySelector('#dice');
    const passElement = document.querySelector('#pass');
    const accuseButton = document.querySelector('#accuse');
    const suspectButton = document.querySelector('#suspect');

    if (gameState.canSuspect()) {
      suspectButton.onclick = showSuspectPopup;
      highlightOptions(suspectButton);
    } else {
      disableOptions(suspectButton);
    }

    if (gameState.canRollDice()) {
      diceBox.onclick = diceRoll;
      highlightOptions(diceBox);
    } else {
      disableOptions(diceBox);
    }

    if (gameState.canPassTurn()) {
      passElement.onclick = pass;
      highlightOptions(passElement);
    } else {
      disableOptions(passElement);
    }

    if (gameState.canAccuse()) {
      accuseButton.onclick = showAccusationPopup;
      highlightOptions(accuseButton);
    } else {
      disableOptions(accuseButton);
    }
  };

  const updateOptions = ([die1, die2]) => {
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
      cardsElements[index].replaceChildren(img);
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
      }

      closePopup();

      if (gameState.accusation.result) {
        showGameOver();
      }
      poller.startPolling();
    }, 10000);

    showAccusationResult();
  };

  const showAccusation = (poller) => () => {
    if (!gameState.hasAnyoneAccused()) {
      return;
    }

    accusationResult(poller);
    poller.stopPolling();
  };

  const suspicionMessage = () => {
    const { suspectedCards } = gameState.suspicion;
    const { character, room, weapon } = suspectedCards;

    const suspectedBy =
      gameState.isMyTurn() ? 'You' : gameState.currentPlayer.character;
    return `${capitalize(suspectedBy)} suspected ${capitalize(character)}, in the ${capitalize(room)}, with the ${capitalize(weapon)}`;
  };

  const showSuspicionBreaker = () => {
    const { suspicionBreakerCharacter } = gameState.suspicion;
    const playerOrder = gameState.getTurnOrder();

    const turnOrderEle = document.querySelector('#turn-order');

    const turnOrderChildren = playerOrder.map(({ character }) => {
      const dom = ['div', {}, ['img', { src: `images/${character}.png` }]];
      const imgContainer = generateHTML(dom);
      if (suspicionBreakerCharacter === character) {
        imgContainer.id = 'suspicion-breaker';
      }

      return imgContainer;
    });

    turnOrderEle.replaceChildren(...turnOrderChildren);
  };

  const showSuspicionResult = () => {
    const { suspectedCards } = gameState.suspicion;
    showSuspicionBreaker();
    showResultCards(suspectedCards, '#suspect-result-popup');

    document.querySelector('.popup-container').style.visibility = 'visible';
    const popup = document.querySelector('#suspect-result-popup');
    popup.style.visibility = 'visible';
    const message = suspicionMessage();
    popup.querySelector('#suspicion-msg').innerText = message;
  };

  const suspicionResult = (poller) => {
    setTimeout(() => {
      closePopup();
      poller.startPolling();
    }, 10000);

    showSuspicionResult();
  };

  const showSuspicion = (poller) => () => {
    if (!gameState.hasAnyoneSuspected()) {
      return;
    }

    suspicionResult(poller);
    poller.stopPolling();
  };

  const suspect = () => {
    const form = document.querySelector('#suspected-cards');
    const formData = new FormData(form);

    const character = formData.get('characters');
    const weapon = formData.get('weapons');
    const room = gameState.room;

    const suspectedCards = JSON.stringify({ character, room, weapon });
    API.suspect(suspectedCards)
      .then(closePopup);
  };

  const setupSuspectPopup = () => {
    document.querySelector('#suspect-btn').onclick = suspect;
    document.querySelector('#suspect-cancel').onclick = closePopup;

    const selects = document.querySelectorAll('#suspect-popup select');
    selects.forEach(select => {
      select.onchange = showCard;
    });
  };

  const setupAccusePopup = () => {
    document.querySelector('#accuse-btn').onclick = accuse;
    document.querySelector('#accuse-cancel').onclick = closePopup;

    const selects = document.querySelectorAll('#accuse-popup select');
    selects.forEach(select => {
      select.onchange = showCard;
    });
  };

  const main = () => {
    setupAccusePopup();
    setupSuspectPopup();

    API.getBoardData()
      .then(boardData => generateBoard(boardData));

    API.getGame()
      .then(gameData => {
        generatePlayers(gameData);
        generateCards(gameData.you);
        updateOptions(gameData.diceValue);
      });

    const getGame = () =>
      API.getGame().then(gameData => gameState.setData(gameData));

    const poller = new Poller(getGame, 1000);

    gameState.addObserver(enableOptions);
    gameState.addObserver(highlightPossiblePositions);
    gameState.addObserver(showTokens);
    gameState.addObserver(updateDice);
    gameState.addObserver(showAccusation(poller));
    gameState.addObserver(highlightTurn);
    gameState.addObserver(showSuspicion(poller));

    poller.startPolling();
  };

  const gameState = new GameState();
  window.onload = main;
})();
