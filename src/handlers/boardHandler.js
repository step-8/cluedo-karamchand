const { createDom } = require('../utils/htmlGenerator.js');

const boardtemplate = (username) => {
  return ['html', {},
    ['head', {},
      ['title', {}, 'Cluedo'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'js/domGenerator.js' }],
      ['script', { 'src': 'js/board.js' }],
      ['script', { 'src': 'js/xhrUtils.js' }]],
    ['body', {}, ['header', { class: 'header' }, ['h1', {}, 'Cluedo'],
      ['div', { class: 'user' }, username]],
      ['main', {}, ['div', { class: 'board' }],
        ['div', { class: 'container' },
          ['div', { class: 'sub-container' }],
          ['div', { class: 'cards' }],
          ['div', { class: 'options' }]
        ]
      ]
    ]
  ];
};

const boardHandler = (req, res) => {
  const { username, gameId } = req.session;
  if (!gameId) {
    return res.redirect('/');
  }
  req.game.enableDice();
  const board = boardtemplate(username);
  res.end(createDom(...board));
};

module.exports = { boardHandler };
