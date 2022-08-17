const { createDom } = require('../utils/htmlGenerator.js');

const boardtemplate = (username) => {
  return [
    'html', {},
    ['head', {},
      ['title', {}, 'CLUEDO'],
      ['link', { 'rel': 'stylesheet', 'href': 'css/game.css' }],
      ['script', { 'src': 'js/domGenerator.js' }],
      ['script', { 'src': 'js/gameState.js' }],
      ['script', { 'src': 'js/board.js' }],
      ['script', { 'src': 'js/xhrUtils.js' }],
      ['script', { 'src': 'js/poller.js' }],
      ['script', { 'src': 'js/apiLayer.js' }]
    ],
    ['body', {},
      ['header', { class: 'header' },
        ['h1', {}, 'CLUEDO'],
        ['div', { class: 'username' }, `Hey ${username}!`]
      ],
      ['main', {},
        ['div', { class: 'players' }],
        ['div', { class: 'board' }],
        ['div', { class: 'player-controls' },
          ['div', { class: 'cards' }],
          ['div', { class: 'options' },
            ['div', { class: 'btn', id: 'accuse' }, 'ACCUSE'],
            ['div', { class: 'btn', id: 'suspect' }, 'SUSPECT'],
            ['div', { class: 'btn', id: 'pass' }, 'PASS'],
            ['div', { class: 'btn', id: 'dice' },
              ['div', { class: 'die', id: 'die1' }, '1'],
              ['div', { class: 'die', id: 'die2' }, '2']
            ]
          ],
          ['div', { class: 'logs' }]
        ]
      ]
    ]];
};

const boardHandler = (req, res) => {
  const { username, gameId } = req.session;
  if (!gameId) {
    return res.redirect('/');
  }
  if (!req.game.isStarted) {
    req.game.start();
  }
  const board = boardtemplate(username);
  res.end(createDom(...board));
};

module.exports = { boardHandler };
