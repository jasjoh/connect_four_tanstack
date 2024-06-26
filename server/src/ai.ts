import { Board, BoardDataType } from "./models/board";

// early ideas for how I would implement a more improved AI

export class C4AI {
  static async getColumn(boardId: string, playerId: string) : Promise<number|null> {
    let board = await Board.get(boardId);
    let boardData = board.data;
    let column = null;
    column = this.findWinningMove(boardData, playerId);
    column = column ? column : this.findWinBlock(boardData, playerId);
    column = column ? column : this.findThirdInARow(boardData, playerId);
    column = column ? column : this.findRandomColumn(boardId);
    return column;
  }

  /** Internal function of the C4AI class
   * When passed a board (BoardDataType) and a player ID, returns a column
   * number of where a piece can be played to win the game. Returns null
   * otherwise.
   */
  private static findWinningMove(boardData: BoardDataType, playerId: string) : number|null {
    return null;
  }

  /** Internal function for the C4AI class
   * When passed a board (BoardDataType) and a player ID, returns a column
   * number of where a piece can be played to block an opponent's win. Returns
   * null if no opportunities exist.
   */
  private static findWinBlock(boardData: BoardDataType, playerId: string) : number|null {
    return null;
  }

  /** Internal function for the C4AI class
   * When passed a board (BoardDataType) and a player ID, returns a column
   * number of where a piece can be played to establish three in a row. Returns
   * null if no opportunities exist.
   */
  private static findThirdInARow(boardData: BoardDataType, playerId: string) : number|null {
    return null;
  }

  /** Internal function for the C4AI class
   * When passed a board (BoardDataType) and a player ID, returns a random column
   * number where a piece can be played. Returns null if the board is full.
   */
  private static async findRandomColumn(boardId: string) : Promise<number|null> {
    const availCols = await Board.getAvailColumns(boardId);
    if (availCols.length === 0) { return null; }
    let colToAttempt = availCols[Math.floor(Math.random() * availCols.length)];
    return colToAttempt;
  }
}