const { createDom } = require('../utils/htmlGenerator.js');

const boardHandler = (req, res) => {
  const { username, gameId } = req.session;
  if (!gameId) {
    return res.redirect('/');
  }
  const board = ['html', {},
    ['head', {},
      ['title', {}, 'Cluedo'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'js/domGenerator.js' }],
      ['script', { 'src': 'js/board.js' }],
      ['script', { 'src': 'js/xhrUtils.js' }]],
    ['body', {}, ['header', { class: 'header' }, ['h1', {}, 'Cluedo'],
      ['div', { class: 'user' }, username]],
      ['main', {}, ['div', { class: 'board' }]]]];
  res.end(createDom(...board));
};

module.exports = { boardHandler };
