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

const generateBoard = ({ response }) => {
  const boardData = JSON.parse(response);
  const rooms = createRooms(boardData);
  const paths = createPaths(boardData);
  const start = createStart(boardData);
  const main = document.querySelector('main');
  const boardAttr = boardData.attributes.board;
  main.append(createDom(
    ['svg', {
      ...boardAttr,
    }, ...rooms, ...paths, ...start]));
};

const showTurn = game => {
  const character = game.currentPlayer.character;
  let message = `${character}'s turn`.toUpperCase();
  if (character === game.you.character) {
    message = 'YOUR TURN';
  }

  const container = generateHTML(['div', { className: 'container' },
    ['div', { className: 'turn-message' }, message]]);
  document.querySelector('main').append(container);
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
  console.log(character);
  const containerElement = document.querySelector('.container');
  const characterCardElement = generateCharacterCard(character);

  containerElement.appendChild(characterCardElement);
};

const main = () => {
  get('/api/board', generateBoard);
  get('/api/game', (xhr) => {
    const game = JSON.parse(xhr.response);
    highlightCurrentPlayer(game);
    showTurn(game);
    displayProfile(game.you);
  });
};

window.onload = main;
