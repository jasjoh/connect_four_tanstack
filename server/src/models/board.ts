import db from "../db";
import { QueryResult } from "pg";

// a board cell can be null if uninitialized or in a final state if initialized
type BoardCellInitialStateType = BoardCellFinalStateInterface | null;

type CoordinatesType = number[];

type ValidCoordSetType = CoordinatesType[];

// an initialized board cell has this interface
export interface BoardCellFinalStateInterface {
  playerId: string | null;
  validCoordSets: ValidCoordSetType[];
}

export type BoardDataType = BoardCellFinalStateInterface[][];

// an initialized board full of finalized board cells
export type BoardInterface = {
  id : string;
  data : BoardDataType;
  width : number;
  height : number;
  availCols : null | number[];
}

export interface BoardDimensionsInterface {
  height: number;
  width: number;
}

export class Board {

  /**
   * Creates and initializes a new board with the specified dimensions
   * If no dimensions are provided, default dimensions are used (7 x 6)
   * Returns the created (and initialized) board (BoardInterface)
   * */
  static async create(
    dimensions : BoardDimensionsInterface = { height: 7, width: 6 }
  ) : Promise<BoardInterface> {

    const boardData = this.initializeBoardData(dimensions);

    // console.log("attempting to create new board");

    const result: QueryResult<BoardInterface> = await db.query(`
                INSERT INTO boards (
                  data,
                  height,
                  width
                )
                VALUES (
                  $1,
                  $2,
                  $3
                )
                RETURNING
                  id,
                  data,
                  height,
                  width`, [boardData, dimensions.height, dimensions.width],
    );

    const board = result.rows[0];

    return board;
  }

  /**
   * Given a board ID, returns the associated board (BoardInterface)
   **/
  static async get(boardId: string) : Promise<BoardInterface> {
    const result: QueryResult<BoardInterface> = await db.query(`
        SELECT
          id,
          data,
          width,
          height
        FROM boards
        WHERE id = $1
    `, [boardId]);

    const board = result.rows[0];
    // console.log("board found:", board);

    if (!board) throw new Error(`No board with id: ${boardId}`);

    return board;
  }

  /**
   * Updates (and overwrites) the board data with the provided data (BoardDataType)
   * Also updates the array of columns which are full
   */
  static async update(boardId: string, boardData: BoardDataType) : Promise<BoardInterface> {
    // console.log("Board.update() called.");

    const result: QueryResult<BoardInterface> = await db.query(`
      UPDATE boards
      SET
        data = $2,
        height = $3,
        width = $4
      WHERE id = $1
      RETURNING *
    `,[boardId, boardData, boardData.length, boardData[0].length]
    );
    const board = result.rows[0];
    return board;
  }

  /**
   * Resets (re-initializes) the board data for a given game
   */
  static async reset(boardId: string) : Promise<undefined> {
    // console.log("Board.reset() called.");

    const result: QueryResult<BoardDimensionsInterface> = await db.query(`
      SELECT
        width,
        height
      FROM boards
      WHERE id = $1
    `,[boardId]);

    const boardDimensions = {
      height: result.rows[0].height,
      width: result.rows[0].width
    };

    const boardData = Board.initializeBoardData(boardDimensions);

    await db.query(`
      UPDATE boards
      SET
        data = $2,
        height = $3,
        width = $4
      WHERE id = $1
      RETURNING *
    `,[boardId, boardData, boardDimensions.height, boardDimensions.width]
    );
  }

  /** Creates an initialized game board (full of cells in a final state)
   * Accepts dimensions for the board as a BoardDimensionsInterface
   * Returns the newly initialized boards as an BoardDataType
   */
  private static initializeBoardData(dimensions : BoardDimensionsInterface) : BoardDataType {

    const newBoardState: BoardCellInitialStateType[][] = [];

    _initializeMatrix();
    _populateBoardSpaces();

    return newBoardState as BoardDataType;

    /** Initializes the valid boundaries of the board */
    function _initializeMatrix() {
      // console.log("_initializeMatrix() called.");
      for (let y = 0; y < dimensions.height; y++) {
        const row = [];
        for (let x = 0; x < dimensions.width; x++) {
          row.push(null);
        }
        newBoardState.push(row);
      }
      // console.log("Matrix initialized.")
    }

    /** Internal function for Board.initializeBoardData()
     * Initializes each space with valid coords and a null player ID */
    function _populateBoardSpaces() {
      // console.log("_populateBoardSpaces() called.")
      for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
          // console.log("attempting to set game board for xy:", y, x);
          newBoardState[y][x] = {
            playerId: null,
            validCoordSets: _populateValidCoordSets(y, x)
          };
        }
      }

      // console.log("Board spaces populated:", newBoardState);

      /** Internal function for Board.initializeBoardData()._populateBoardSpaces()
       * Accepts board coordinates and return array of valid coord sets */
      function _populateValidCoordSets(y: number, x: number) {
        // console.log("_populateValidCoordSets called with yx:", y, x);
        const vcs: number[][][] = [];
        let coordSet: number[][] = [];

        /**
         * check each direction to see if a valid set of coords exist.
         * since we can't lookup column values for rows which are undefined,
         * we will check if the row exists before checking anything else
        */

        // does a row existing 4 rows above?
        if (newBoardState[y - 3] !== undefined) {
          // check up and diagonals

          // check up
          if (newBoardState[y - 3][x] !== undefined) {
            coordSet = [];
            coordSet.push([y, x]);
            coordSet.push([y - 1, x]);
            coordSet.push([y - 2, x]);
            coordSet.push([y - 3, x]);
            vcs.push(coordSet);
          }

          // check upLeft
          if (newBoardState[y - 3][x - 3] !== undefined) {
            coordSet = [];
            coordSet.push([y, x]);
            coordSet.push([y - 1, x - 1]);
            coordSet.push([y - 2, x - 2]);
            coordSet.push([y - 3, x - 3]);
            vcs.push(coordSet);
          }

          // check upRight
          if (newBoardState[y - 3][x + 3] !== undefined) {
            coordSet = [];
            coordSet.push([y, x]);
            coordSet.push([y - 1, x + 1]);
            coordSet.push([y - 2, x + 2]);
            coordSet.push([y - 3, x + 3]);
            vcs.push(coordSet);
          }
        }

        // check left and right

        // check left
        if (newBoardState[y][x - 3] !== undefined) {
          coordSet = [];
          coordSet.push([y, x]);
          coordSet.push([y, x - 1]);
          coordSet.push([y, x - 2]);
          coordSet.push([y, x - 3]);
          vcs.push(coordSet);
        }

        // check right
        if (newBoardState[y][x + 3] !== undefined) {
          coordSet = [];
          coordSet.push([y, x]);
          coordSet.push([y, x + 1]);
          coordSet.push([y, x + 2]);
          coordSet.push([y, x + 3]);
          vcs.push(coordSet);
        }

        // console.log("Valid coord sets populated:", vcs)
        return vcs;
      }
    }
  }

  /**
 * Updates the provided BoardDataType to have pieces played by the provided
 * player ID at the bottom row in columns 1, 2, and 3 so that a piece can be
 * placed in column 0 and trigger a win. Should only be provided a fresh board.
 */
  static async setBoardDataNearlyWon(
    boardId : string,
    winningPlayerId : string
  ) : Promise<undefined> {

    const board = await Board.get(boardId);
    const boardData = board.data;
    boardData[boardData.length - 1][1].playerId = winningPlayerId;
    boardData[boardData.length - 1][2].playerId = winningPlayerId;
    boardData[boardData.length - 1][3].playerId = winningPlayerId;
    await Board.update(boardId, boardData);
  }

  /**
   * Updates the provided BoardDataType to have only one empty slot available
   * to drop a piece at the top of column 0. Uses a random GUID to represent
   * player IDs associated with every other played piece to avoid a potential
   * win.
   */
  static async setBoardDataNearlyTied(
    boardId : string,
    playerIds: string[]
  ) : Promise<undefined> {
    const board = await Board.get(boardId);
    const boardData = board.data;

    let playerIndex : number;
    let counter = 0;
    for (let y = 0; y < boardData.length; y++) {
      playerIndex = 0;
      if (counter > 1) {
        playerIndex = 1;
        if (counter > 3) {
          playerIndex = 0;
          counter = 0;
        }
      }
      for (let col of boardData[y]) {
        playerIndex = playerIndex === 0 ? 1 : 0;
        col.playerId = playerIds[playerIndex];
      }
      counter++;
    }

    boardData[0][0].playerId = null;
    await Board.update(boardId, boardData);
  }

  /** Retrieves the matrix of playerIds representing played pieces for a given
   *  board ID in the format (playerId | null)[][] */
  static async getGamePieces(boardId: string) : Promise<(string | null)[][]> {
    const board = await Board.get(boardId);
    const boardPieces = board.data.map(r => r.map(c => c.playerId));
    return boardPieces;
  }

  /** Accepts a BoardDataType and returns an array of the column indices
   * that are not full (where the top row in each column has a null playerId value)
   */
  static async getAvailColumns(boardId: string) : Promise<number[]> {
    const board = await Board.get(boardId);
    let availCols: number[] = [];
    for (let i = 0; i < board.data[0].length; i++) {
      if (board.data[0][i].playerId === null) { availCols.push(i); }
    }
    return availCols;
  }
}

