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

const findAdjecentCells = (cellPositions, [x, y]) => {
  const top = [x, y - 1];
  const bottom = [x, y + 1];
  const left = [x - 1, y];
  const right = [x + 1, y];
  const adjecentCells = [top, bottom, left, right];

  return adjecentCells.filter(cell => isCellPresent(cellPositions, cell));
};

const isValidAdjecentCell = (cell, cells, baseCell) => {
  const { roomPositions } = cells;
  const roomCell = roomPositions.find(({ position }) =>
    isEqual(position, cell));

  return !(roomCell && !isCellPresent(roomCell.entryPoints, baseCell));
};

const findPossibleMoves = (cells, moves, currentPosition) => {
  let allCells = cells.cellPositions;
  const roomPositions = cells.roomPositions.map(({ position }) => position);
  allCells = allCells.concat(roomPositions);

  const possibleMoves = [];
  const adjecentCells = findAdjecentCells(allCells, currentPosition);

  if (moves <= 1) {
    return adjecentCells.filter((cell) =>
      isValidAdjecentCell(cell, cells, currentPosition));
  }

  adjecentCells.forEach(cell => {
    possibleMoves.push(...findPossibleMoves(cells, moves - 1, cell));
  });

  return removeDuplicates(possibleMoves);
};

const servePossibleMoves = (cellPositions) => (req, res) => {
  const { game, session: { userId } } = req;
  const { diceValue, you } = game.getState(userId);
  findPossibleMoves(cellPositions, diceValue, [0, 17]);
};

module.exports = { servePossibleMoves, findPossibleMoves };
