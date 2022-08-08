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

const generateStart = ({ position }) => {
  const [xCordinate, yCordinate] = position;
  return ['rect',
    {
      fill: 'goldenRod', stroke: 'black', 'stroke-width': '0.2%',
      x: xCordinate, y: yCordinate, height: '1', width: '1'
    }];
};

const createStart = (cells) => {
  return cells.map(generateStart);
};

const generatePath = ([x, y]) => {
  return ['rect',
    {
      fill: '#daa52073', stroke: 'black', 'stroke-width': '0.2%',
      x, y, height: '1', width: '1'
    }];
};

const createPaths = (cells) => {
  return cells.map(generatePath);
};

const generateRoom = (points) => {
  return ['polygon',
    {
      height: '1', width: '1', fill: 'lightBlue',
      stroke: 'black', 'stroke-width': '0.2%',
      points: `${points.join(' ')}`
    }];
};

const createRooms = (rooms) => {
  return rooms.map(room => {
    return generateRoom(room.points);
  });
};

const generateBoard = ({ response }) => {
  const boardData = JSON.parse(response);
  const rooms = createRooms(boardData.rooms);
  const paths = createPaths(boardData.tiles);
  const start = createStart(boardData.startingPos);
  const body = document.querySelector('body');
  body.append(createDom(['svg', {
    width: '900', height: '800', viewBox: '0 0 24 25'
  }, ...rooms, ...paths, ...start]));
};

const main = () => {
  get('/boardApi', generateBoard);
};

window.onload = main;
