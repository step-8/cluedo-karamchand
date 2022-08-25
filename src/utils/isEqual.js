const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

module.exports = { isEqual };
