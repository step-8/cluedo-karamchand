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

const isValidAdjacentCell = (cell, baseCell, cells) => {
  const { cellPositions, roomDetails } = cells;

  if (isCellPresent(cellPositions, cell)) {
    return true;
  }

  const roomCell = getRoomCell(roomDetails, cell);

  return roomCell && isEqual(roomCell.entryPoint, baseCell);
};

const findAdjacentCells = (cells, [x, y]) => {
  const top = [x, y - 1];
  const bottom = [x, y + 1];
  const left = [x - 1, y];
  const right = [x + 1, y];
  const adjacentCells = [top, bottom, left, right];

  return adjacentCells.filter(cell =>
    isValidAdjacentCell(cell, [x, y], cells));
};

const findPossibleMoves = (cells, moves, currentPos, possibleRooms = []) => {
  const possibleMoves = [];
  let adjacentCells = findAdjacentCells(cells, currentPos);
  const room = getRoomCell(cells.roomDetails, currentPos);

  if (room) {
    possibleRooms.push(currentPos);
    adjacentCells = [room.entryPoint];
  }

  if (moves <= 1) {
    return [...adjacentCells, ...possibleRooms];
  }

  adjacentCells.forEach(cell => {
    possibleMoves.push(
      ...findPossibleMoves(cells, moves - 1, cell, possibleRooms));
  });

  return removeDuplicates([...possibleMoves, ...possibleRooms]);
};

const moveCharacter = (req, res) => {
  const { game } = req;
  const { position } = req.body;
  game.move(JSON.parse(position));
  res.sendStatus(201);
};

module.exports = { findPossibleMoves, moveCharacter };
