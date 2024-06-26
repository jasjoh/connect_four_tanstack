import db from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import {
  Game,
  GameInterface,
  BoardDimensionsInterface
} from "./game";
import {
  Player,
  NewPlayerInterface,
  PlayerInterface
} from "./player";
import { createNearlyWonGame, createNearlyTiedGame, createPlayers } from "./_factories";
import { Board, BoardDataType } from "./board";
import {
  TooFewPlayers, PlayerAlreadyExists,
  InvalidGameState, InvalidPiecePlacement, NotCurrentPlayer
} from "../utilities/gameErrors";
import { QueryResult } from "pg";

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} from "./_testCommon";
import { randomUUID } from "crypto";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// default board dimensions for test games; 6 x 6
const boardDimensions = { width: 6, height: 6 };

describe("create a new game", function () {

  test("create a game successfully", async function () {

    // verify game was returned from creation
    const createdGame = await Game.create(boardDimensions);

    // console.log("result of creating a game:", createdGame);

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    expect(uuidRegex.test(createdGame.id)).toBe(true);
    expect(createdGame.boardHeight).toEqual(6);
    expect(createdGame.boardWidth).toEqual(6);
    expect(createdGame.gameState).toEqual(0);

    // verify game exists in database
    const result: QueryResult<GameInterface> = await db.query(`
      SELECT id
      FROM games
      WHERE id = $1
    `, [createdGame.id]);
    expect(result.rows[0].id).toEqual(createdGame.id);
  });
});

describe("get all games", function () {

  test("returns default games", async function () {
    const existingGames = await Game.getAll();
    expect(existingGames.length).toEqual(1);
  });

  test("returns all games including newly created ones", async function () {
    await Game.create(boardDimensions);
    await Game.create(boardDimensions);
    const existingGames = await Game.getAll();
    expect(existingGames.length).toEqual(3);
  });
});

describe("get game details", function () {

  test("returns created ame", async function () {
    const createGame = await Game.create(boardDimensions);
    const retrievedGame = await Game.get(createGame.id);
    expect(createGame).toEqual(retrievedGame);
  });
});

describe("delete game", function () {

  test("deletes default game", async function () {
    let existingGames = await Game.getAll();
    const gameToDeleteId = existingGames[0].id;
    Game.delete(gameToDeleteId);
    existingGames = await Game.getAll();
    expect(existingGames.length).toEqual(0);
  });

});

describe("add player to game", function () {

  test("successfully adds a player", async function () {

    const players = await createPlayers(1);
    const existingGames = await Game.getAll();
    const existingPlayerCount = existingGames[0].totalPlayers;

    // confirm addPlayers() returns expected count
    const playerCount = await Game.addPlayers(existingGames[0].id, [players[0].id]);
    expect(playerCount).toEqual(existingPlayerCount + 1);

    // confirm game reflects updated player count
    const gameWithPlayer = await Game.get(existingGames[0].id);
    expect(gameWithPlayer.totalPlayers).toEqual(existingPlayerCount + 1);
  });

  test("throws exception adding existing player", async function () {

    const players = await createPlayers(1);
    const existingGames = await Game.getAll();

    await Game.addPlayers(existingGames[0].id, [players[0].id]);

    try {
      await Game.addPlayers(existingGames[0].id, [players[0].id]);
    } catch (error: any) {
      expect(error).toBeInstanceOf(PlayerAlreadyExists);
    }
  });

});

describe("remove player from game", function () {

  test("successfully remove a player", async function () {

    const players = await createPlayers(1);
    const existingGames = await Game.getAll();
    const existingPlayerCount = existingGames[0].totalPlayers;

    let playerCount = await Game.addPlayers(existingGames[0].id, [players[0].id]);
    expect(playerCount).toEqual(existingPlayerCount + 1);

    playerCount = await Game.removePlayer(existingGames[0].id, players[0].id);
    expect(playerCount).toEqual(existingPlayerCount);

  });

  test("throws exception removing non-existing player", async function () {

    const existingGames = await Game.getAll();

    try {
      await Game.removePlayer(randomUUID(), existingGames[0].id);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

});

describe("get list of players in game", function () {

  test("successfully get list of players", async function () {

    const players = await createPlayers(2);
    const existingGames = await Game.getAll();
    const existingPlayerCount = existingGames[0].totalPlayers;

    await Game.addPlayers(existingGames[0].id, [players[0].id]);
    await Game.addPlayers(existingGames[0].id, [players[1].id]);

    const addedPlayers = await Game.getPlayers(existingGames[0].id);
    expect(addedPlayers.length).toEqual(existingPlayerCount + 2);

  });

});

describe("start a game", function () {

  test("successfully updates game state", async function () {

    const players = await createPlayers(2);
    const existingGames = await Game.getAll();
    const gameToStart = existingGames[0];

    expect(gameToStart.gameState).toEqual(0);

    await Game.addPlayers(existingGames[0].id, [players[0].id]);
    await Game.addPlayers(existingGames[0].id, [players[1].id]);

    await Game.start(gameToStart.id, false);

    const startedGame = await Game.get(gameToStart.id);

    expect(startedGame.gameState).toEqual(1);
  });

  test("throws error if no game exists", async function () {
    try {
      await Game.start(randomUUID(), false);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

  test("throws error if too few players", async function () {

    const players = await createPlayers(1);
    const existingGames = await Game.getAll();
    const gameToStart = existingGames[0];

    expect(gameToStart.gameState).toEqual(0);

    await Game.addPlayers(gameToStart.id, [players[0].id]);

    try {
      await Game.start(gameToStart.id, false);
    } catch (error: any) {
      expect(error).toBeInstanceOf(TooFewPlayers);
    }
  });

  test("does not call nextTurn() when instructed not to", async function () {

    const players = await createPlayers(2);
    const existingGames = await Game.getAll();
    const gameToStart = existingGames[0];

    expect(gameToStart.gameState).toEqual(0);

    await Game.addPlayers(gameToStart.id, [players[0].id]);
    await Game.addPlayers(gameToStart.id, [players[1].id]);
    await Game.start(gameToStart.id, false);

    const startedGame = await Game.get(gameToStart.id);
    expect(startedGame.currPlayerId).toBeNull();
  });

  test("calls nextTurn() by default", async function () {

    const players = await createPlayers(2);
    const existingGames = await Game.getAll();
    const gameToStart = existingGames[0];

    expect(gameToStart.gameState).toEqual(0);

    await Game.addPlayers(gameToStart.id, [players[0].id]);
    await Game.addPlayers(gameToStart.id, [players[1].id]);

    const spy = jest.spyOn(Game, 'nextTurn').mockResolvedValue();
    await Game.start(gameToStart.id);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

  });

});

describe("drops piece", function () {

  test("successfully drop piece", async function () {

    console.log("running successfully drop piece test");

    // setup a game and start it
    const players = await createPlayers(2);
    const games = await Game.getAll();
    let game = games[0];

    await Game.addPlayers(game.id, [players[0].id]);
    await Game.addPlayers(game.id, [players[1].id]);
    await Game.start(game.id);

    game = await Game.get(game.id);
    const currPlayerId = game.currPlayerId as string;

    await Game.dropPiece(game.id, currPlayerId, 0);
    game = await Game.get(game.id);

    // test game board
    const gameBoard = game.boardData as BoardDataType;
    const cellToTest = gameBoard[gameBoard.length - 1][0];
    expect(cellToTest.playerId).toBe(currPlayerId);

    // test placed pieces
    const placedPieces = game.placedPieces as number[][];
    expect(placedPieces[0]).toEqual([gameBoard.length - 1, 0]);
  });

  test("successfully detects a won game", async function () {
    const players = await createPlayers(2);
    const playerIds = [
      players[0].id,
      players[1].id
    ];
    let game = await createNearlyWonGame(boardDimensions, playerIds, playerIds[0]);
    // console.log("nearly won game:", game);
    expect(game.gameState).toBe(1);

    game = await Game.dropPiece(game.id, playerIds[0], 0);
    //console.log("game after dropping a game winning piece:", game);
    expect(game.gameState).toBe(2);
  });

  test("successfully detects a tied game", async function () {
    const players = await createPlayers(2);
    const playerIds = [
      players[0].id,
      players[1].id
    ];
    let game = await createNearlyTiedGame(boardDimensions, playerIds[0]);
    expect(game.gameState).toBe(1);

    game = await Game.dropPiece(game.id, playerIds[0], 0);
    //console.log("game after dropping a game winning piece:", game);
    expect(game.gameState).toBe(3);
  });

});

describe("game turns retrieval", function () {

  test("successfully returns no turns when none have transpired", async function () {

    const games = await Game.getAll();
    let game = games[0];
    expect(await Game.getTurns(game.id)).toEqual([]);
  });

  test("successfully returns correct number of turns", async function () {

    // setup a game, start it and take a turn
    const players = await createPlayers(2);
    const games = await Game.getAll();
    let game = games[0];

    await Game.addPlayers(game.id, [players[0].id]);
    await Game.addPlayers(game.id, [players[1].id]);

    await Game.start(game.id);

    game = await Game.get(game.id);
    const currPlayerId = game.currPlayerId as string;
    await Game.dropPiece(game.id, currPlayerId, 0);

    const gameTurns = await Game.getTurns(game.id);
    expect(gameTurns.length).toBe(1);
  });

});