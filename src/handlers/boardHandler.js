const { createDom } = require('../utils/htmlGenerator.js');

const boardHandler = (req, res) => {
  if (!req.session.isPopulated) {
    return res.redirect('/login');
  }
  if (!req.session.gameId) {
    return res.redirect('/');
  }
  const { username } = req.session;
  const board = ['html', {},
    ['head', {},
      ['title', {}, 'Cluedo'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'scripts/board.js' }],
      ['script', { 'src': 'scripts/xhrUtils.js' }]],
    ['body', {}, ['div', { class: 'header' }, ['h1', {}, 'Cluedo'],
      ['div', { class: 'user' }, username]]]];
  res.end(createDom(...board));
};

const boardApi = (boardData) => (req, res) => {
  res.json(boardData);
};

module.exports = { boardHandler, boardApi };
