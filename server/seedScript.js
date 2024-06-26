/** This seeds the database via the API endpoints as opposed to psql */

const axios = require('axios');

const endpoint = 'http://localhost:3000'

async function createGameAddPlayers() {

  // create a game
  const gameRequestBody = {
    "height": 6,
    "width": 7
  }

  const response = await axios.post(`${endpoint}/games/`, gameRequestBody);
  let gameId = response.data.game.id;

  /**
   * ('08b9a3b4-1fa0-4d1d-bfa2-e6955a1db3e2', TRUE, 'AI Player 1', '#c3c3c3'),
     ('6fea23b5-d9c6-4c3d-92cc-8653965c4748', FALSE, 'Human Player 2', '#c2c2c2');
   */
  let players = [
    { id: '08b9a3b4-1fa0-4d1d-bfa2-e6955a1db3e2' },
    { id: '6fea23b5-d9c6-4c3d-92cc-8653965c4748' },
  ];

  // added players to game
  await axios.post(`${endpoint}/games/${gameId}/players`, players[0]);
  await axios.post(`${endpoint}/games/${gameId}/players`, players[1]);
}

createGameAddPlayers();
