const fetchRequest = (request) => fetch(request.url, request.options);

const fetchJSON = (request) => fetchRequest(request)
  .then(response => response.json())
  .catch(error => {
    throw new Error(error);
  });

const API = {
  getGame: () => {
    const request = { url: '/api/game', options: { method: 'GET' } };
    return fetchJSON(request);
  },

  rollDice: () => {
    const request = { url: '/game/roll-dice', options: { method: 'GET' } };
    return fetchRequest(request);
  },

  passTurn: () => {
    const request = { url: '/game/pass-turn', options: { method: 'GET' } };
    return fetchRequest(request);
  },

  moveCharacter: (newPosition) => {
    const request = {
      url: '/game/move',
      options: {
        method: 'POST',
        body: newPosition
      }
    };
    return fetchRequest(request);
  },

  accuse: (accusedCards) => {
    const request = {
      url: '/game/accuse',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: accusedCards
      }
    };

    return fetchRequest(request);
  },

  suspect: (suspectedCards) => {
    const request = {
      url: '/game/suspect/make',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: suspectedCards
      }
    };

    return fetchRequest(request);
  },

  ruleOut: (rulingOutCard) => {
    const request = {
      url: '/game/suspect/rule-out',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rulingOutCard
      }
    };

    return fetchRequest(request);
  }
};
