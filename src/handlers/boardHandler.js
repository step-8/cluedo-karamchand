const { createDom } = require('../utils/htmlGenerator.js');

const boardHandler = (req, res) => {
  if (!req.session.gameId) {
    return res.redirect('/');
  }
  const { username } = req.session;
  const board = ['html', {},
    ['head', {},
      ['title', {}, 'Cluedo'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'js/board.js' }],
      ['script', { 'src': 'js/xhrUtils.js' }]],
    ['body', {}, ['div', { class: 'header' }, ['h1', {}, 'CLUEDO'],
      ['div', { class: 'user' }, username]]]];
  res.end(createDom(...board));
};

module.exports = { boardHandler };
