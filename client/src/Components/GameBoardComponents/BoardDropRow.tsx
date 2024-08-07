import React from "react";

import { BoardDropCell } from "./BoardDropCell";

import "./BoardDropRow.css";

/** Displays the row where game pieces are 'dropped'
 *
 * Props:
 *  - width: The game board width (# of cells) that should be rendered
 *  - dropPiece(): A callback function for when a player attempts to drop a piece
 *
 * State:
 *  - None
 *
 * GameBoard -> BoardDropRow
 *
 * BoardDropRow -> BoardDropCell
 * */
export function BoardDropRow({ width, dropPiece }: { width: number, dropPiece: (col: number) => void; }) {
  // console.log("BoardDropRow re-rendered, passed width of:", width);

  let cellsJsx = [];
  let curCol = 0;
  while (curCol < width) {
    cellsJsx.push(
      <BoardDropCell key={curCol} colIndex={curCol} dropPiece={dropPiece} />
    );
    curCol++;
  }

  return (<tr className="BoardDropRow">{cellsJsx.map(cell => cell)}</tr>);
}