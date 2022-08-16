const isEqual = (array1, array2) => {
  return array1.every((element, index) => element === array2[index]);
};

const isCellPresent = (cells, expectedCell) => {
  return cells.some(cell => isEqual(cell, expectedCell));
};

const removeDuplicates = cells => {
  const filteredCells = cells.reduce((filtered, cell) => {
    if (!isCellPresent(filtered, cell)) {
      filtered.push(cell);
    }

    return filtered;
  }, []);

  return filteredCells;
};

const getRoomCell = (rooms, cell) => {
  return rooms.find(({ position }) => isEqual(position, cell));
};

const isValidAdjecentCell = (cell, baseCell, cells) => {
  const { cellPositions, roomPositions } = cells;

  if (isCellPresent(cellPositions, cell)) {
    return true;
  }

  const roomCell = getRoomCell(roomPositions, cell);

  return roomCell && isEqual(roomCell.entryPoint, baseCell);
};

const findAdjecentCells = (cells, [x, y]) => {
  const top = [x, y - 1];
  const bottom = [x, y + 1];
  const left = [x - 1, y];
  const right = [x + 1, y];
  const adjecentCells = [top, bottom, left, right];

  return adjecentCells.filter(cell =>
    isValidAdjecentCell(cell, [x, y], cells));
};

const findPossibleMoves = (cells, moves, currentPos, possibleRooms = []) => {
  const possibleMoves = [];
  let adjecentCells = findAdjecentCells(cells, currentPos);
  const room = getRoomCell(cells.roomPositions, currentPos);

  if (room) {
    possibleRooms.push(currentPos);
    adjecentCells = [room.entryPoint];
  }

  if (moves <= 1) {
    return [...adjecentCells, ...possibleRooms];
  }

  adjecentCells.forEach(cell => {
    possibleMoves.push(
      ...findPossibleMoves(cells, moves - 1, cell, possibleRooms));
  });

  return removeDuplicates([...possibleMoves, ...possibleRooms]);
};

const moveCharacter = (req, res) => {
  const { game } = req;
  const { position } = req.body;
  game.move(position);
  res.end('');
};

module.exports = { findPossibleMoves, moveCharacter };
