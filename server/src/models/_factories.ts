import {
  Game,
  GameInterface,
  GameUpdateInterface,
  BoardDimensionsInterface
} from "./game";
import { BoardDataType } from "./game";

import { generateRandomHexColor, generateRandomName } from "../utilities/utils";

import { PlayerInterface, NewPlayerInterface, Player } from "./player";
import { Board } from "./board";

/**
 * Factory function for creating a new Game and setting its state
 * Accepts an initial state as a matrix representing desired game state
 * Returns the newly created Game instance
 */
async function createGameWithBoardData(
    boardData: BoardDataType
  ): Promise<GameInterface> {

  // console.log("createGameWithBoardData factory function called");
  _validateBoardData();

  const boardDimensions = {
    height: boardData.length,
    width: boardData[0].length
  }

  // populate placedPieces based on boardData
  const placedPieces : number[][] = [];
  for (let y = 0; y < boardData.length; y++) {
    for (let x = 0; x < boardData[y].length; x++) {
      if (boardData[y][x].playerId !== null) {
        placedPieces.push([y, x]);
      }
    }
  }

  let board = await Board.create(boardDimensions);
  board = await Board.update(board.id, boardData);

  let game = await Game.createWithBoard(board.id);
  // game = await Game.update()

  // determine game state
  // const gameState = Game.checkForGameEnd(gameToInsert);

  // update game in DB

  // console.log("SQL result from attempting to create a game:", result);

  return game;

  /** Internal function for createGameWithBoardData()
   * Validates every playerId has a valid value */
  function _validateBoardData() {
    for (let row of boardData) {
      const allNotUndefined = row.every(c => c.playerId !== undefined );
      if (!allNotUndefined) {
        throw new Error("Invalid initial board state. Some playerId values were undefined.")
      }
    }
  }

}

/**
 * Factory function for creating a new game which is one play away from being won
 * Accepts a player ID to use as the about-to-win player
 * The created game will be won if the provided player ID drops a piece in column 0
 * Also populates: Game.placedPieces, Game.gameState
 * Returns the newly created Game instance
 */
async function createNearlyWonGame(
  boardDimensions: BoardDimensionsInterface,
  playerIds: string[],
  winningPlayerId: string
): Promise<GameInterface> {

// console.log("createNearlyWonGame factory function called");

let game = await Game.create(boardDimensions);
await Game.addPlayers(game.id, playerIds);
await Game.start(game.id, false);
const boardId = game.boardId;
await Board.setBoardDataNearlyWon(boardId, winningPlayerId);
const board = await Board.get(boardId);

// populate placedPieces based on boardData
const placedPieces : number[][] = [];
for (let y = 0; y < board.height; y++) {
  for (let x = 0; x < board.width; x++) {
    if (board.data[y][x].playerId !== null) {
      placedPieces.push([y, x]);
    }
  }
}

// TODO: fix other issues? add players, set current player, etc.?
const gameUpdate : GameUpdateInterface = {
  placedPieces: placedPieces,
  currPlayerId: winningPlayerId
};

game = await Game.update(game.id, gameUpdate);

return game;

}

/**
 * Factory function for creating a new game which is one play away from being tied
 * Fills all slots with different randomly generated GUIDs
 * The created game will be tied if a piece is dropped in column 0
 * Also populates: Game.placedPieces, Game.gameState
 * Returns the newly created Game instance
 */
async function createNearlyTiedGame(
  boardDimensions: BoardDimensionsInterface,
  currPlayerId: string
): Promise<GameInterface> {

// console.log("createNearlyTiedGame factory function called");

let game = await Game.create(boardDimensions);
const players = await createPlayers(2);
const playerIds = players.map(p => p.id);
await Game.addPlayers(game.id, playerIds);
await Game.start(game.id, false);
const boardId = game.boardId;
await Board.setBoardDataNearlyTied(boardId, playerIds);
const board = await Board.get(boardId);

// populate placedPieces based on boardData
const placedPieces : number[][] = [];
for (let y = 0; y < board.height; y++) {
  for (let x = 0; x < board.width; x++) {
    if (board.data[y][x].playerId !== null) {
      placedPieces.push([y, x]);
    }
  }
}

// TODO: fix other issues? add players, set current player, etc.?
const gameUpdate : GameUpdateInterface = {
  placedPieces: placedPieces,
  currPlayerId: currPlayerId
};

game = await Game.update(game.id, gameUpdate);

return game;

}


/**
 * Factory function for creating one or more random players
 * Accepts an optional count for numbers of players to create (default 1)
 * Returns an array of player objects which have been created (PlayerInterface)
*/
async function createPlayers(count : number = 1) : Promise<PlayerInterface[]> {
  // console.log("createPlayers factory function called");
  const players : PlayerInterface[] = [];
  let counter = 1;
  while (counter <= count) {
    const playerData : NewPlayerInterface = {
      name: generateRandomName(),
      color: generateRandomHexColor(),
      ai: false
    }
    const player = await Player.create(playerData);
    players.push(player);
    counter++;
  }
  return players;
}

export {
  createGameWithBoardData,
  createPlayers,
  createNearlyWonGame,
  createNearlyTiedGame
}