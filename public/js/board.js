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
    { x, y, ...attributes.tiles }];
};

const createPaths = ({ tiles, attributes }) => {
  return tiles.map(tile => generatePath(tile, attributes));
};

const generateRoom = ({ points, room, textPosition }, attributes) => {
  const [x, y] = textPosition;
  const roomPosition = ['polygon',
    { points: `${points.join(' ')}`, ...attributes.room }];
  const roomName = ['text',
    { x, y, 'font-size': '1' }, room];
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

const generateBoard = ({ response }) => {
  const boardData = JSON.parse(response);
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

const showTurn = game => {
  const character = game.currentPlayer.character;
  let message = `${character}'s turn`.toUpperCase();
  if (character === game.you.character) {
    message = 'YOUR TURN';
  }

  const dom = ['div', { className: 'turn-message' }, message];

  const turnMessage = generateHTML(dom);
  document.querySelector('.sub-container').append(turnMessage);
};

const highlightCurrentPlayer = (game) => {
  const character = game.currentPlayer.character;
  const charElement = document.getElementById(character);
  charElement.setAttribute('class', 'current-player');
};

const generateCharacterCard = (character) => {
  const dom = ['div', { className: 'profile-card' },
    ['figure', {},
      ['div', { className: 'image-wrapper' },
        ['img', { src: `/images/${character}.png`, alt: character }]
      ]
    ],
    ['figcaption', {}, character]
  ];

  return generateHTML(dom);
};

const displayProfile = ({ character }) => {
  const containerElement = document.querySelector('.sub-container');
  const characterCardElement = generateCharacterCard(character);

  containerElement.appendChild(characterCardElement);
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

const cardsDom = () => {
  const cardDom = ['div', { className: 'card' }, '?'];
  return Array(3).fill(cardDom);
};

const closePopup = () => {
  document.querySelector('.popup').remove();
};

const accusationPopupDom = () => {
  const dom = [
    'div', { className: 'accuse-popup popup' },
    [
      'div', { className: 'envolope-cards' }, ...cardsDom()
    ],
    [
      'div', { className: 'accused-cards' }
    ],
    [
      'div', { className: 'popup-options' },
      ['button', { id: 'accuse' }, 'ACCUSE'],
      ['button', { id: 'select', onclick: closePopup }, 'CANCEL']
    ]
  ];
  return dom;
};

const showCard = (event) => {
  const card = event.target.closest('.suit').querySelector('.card');
  const cardName = event.target.value;
  card.querySelector('img').src = `images/${cardName}.png`;
};

const accusationDropdownDom = ([suitName, suit]) => {
  const dom = [
    'select', {
      name: suitName, id: suitName, onchange: showCard
    },
    ...suit.map(card => ['option', {
      value: card,
    }, card])
  ];
  return dom;
};

const accusationCard = ([suitName, suit]) => {
  const dom = [
    'div', { className: 'suit' }, accusationDropdownDom([suitName, suit]),
    ['div', { className: 'card' }, [
      'img', { src: `images/${suit[0]}.png` }
    ]]
  ];
  return dom;
};

const accusationOptionsDropdown = (deck) => {
  const accusationCards = Object.entries(deck).map((suit) =>
    generateHTML(accusationCard(suit)));

  document.querySelector('.accused-cards').append(...accusationCards);
};

const startAccusation = () => {
  document.querySelector('body').append(generateHTML(accusationPopupDom()));

  fetch('./api/cards')
    .then((res) => res.json())
    .then(accusationOptionsDropdown);
};

const generateOptions = ([dice1, dice2]) => {
  const options = document.querySelector('.options');
  const dom = [['button', {
    className: 'button', id: 'accuse-button', onclick: startAccusation
  }, 'Accuse'],
  ['div', { className: 'dice-box' },
    ['div', { className: 'dice' }, dice1],
    ['div', { className: 'dice' }, dice2]
  ]];

  options.append(...dom.map(generateHTML));
};

const main = () => {

  get('/api/board', generateBoard);
  get('/api/game', (xhr) => {
    const game = JSON.parse(xhr.response);
    console.log(game);
    generateOptions(game.diceValue);
    highlightCurrentPlayer(game);
    showTurn(game);
    displayProfile(game.you);
    generateCards(game.you);
  });
};

window.onload = main;
