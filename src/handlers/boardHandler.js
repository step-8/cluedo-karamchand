const { createDom } = require('../htmlGenerator.js');

const boardHandler = (req, res) => {
  if (!req.session.isPopulated) {
    return res.redirect('/login');
  }
  if (!req.session.gameId) {
    return res.redirect('/');
  }

  const board = ['html', {},
    ['head', {},
      ['title', {}, 'Cluedo'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'scripts/board.js' }],
      ['script', { 'src': 'scripts/xhrUtils.js' }]],
    ['body', {}, ['h1', { class: 'header' }, 'Cluedo']

    ]];
  res.end(createDom(...board));
};

const boardApi = (boardData) => (req, res) => {
  res.json(boardData);
};

module.exports = { boardHandler, boardApi };
