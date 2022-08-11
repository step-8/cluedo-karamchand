const isCellPresent = (cells, cell) => {
  return cells.some(([row, col]) => row === cell[0] && col === cell[1]);
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

const findPossibleMoves = (cells, moves, currentPosition) => {
  const allCells = cells.cellPositions;
  const roomPositions = cells.roomPositions.map(({ position }) => position);
  allCells.push(...roomPositions);

  const possibleMoves = [];
  const adjecentCells = findAdjecentCells(allCells, currentPosition);

  if (moves <= 1) {
    return adjecentCells;
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
