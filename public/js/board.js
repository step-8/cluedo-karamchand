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
  const body = document.querySelector('body');
  const boardAttr = boardData.attributes.board;
  body.append(createDom(['svg', {
    ...boardAttr,
  }, ...rooms, ...paths, ...start]));
};

const highlightCurrentPlayer = (xhr) => {
  const game = JSON.parse(xhr.response);
  const character = game.currentPlayer.character;
  const charElement = document.getElementById(character);
  console.log(charElement);
  charElement.setAttribute('class', 'current-player');
  console.log(charElement);
  console.log(character);
};

const main = () => {
  get('/api/board', generateBoard);
  get('/api/game', highlightCurrentPlayer);
};

window.onload = main;
