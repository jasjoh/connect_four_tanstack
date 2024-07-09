import React from "react";

import { GamePiece } from "./GamePiece";

import "./BoardPlayCell.css";

/** An individual cell in the game board where pieces may exist once dropped
 *
 * Props:
 *  - highlight: whether to highlight the cell as part of a winning set; defaults to false
 *  - color: the color of the cell (if it has a piece there)
 *
 * State:
 *  - None
 *
 * BoardPlayRow -> BoardPlayCell
 *
 * BoardPlayCell -> GamePiece
 * */
export function BoardPlayCell(
  { highlight = false, color = undefined }: { highlight: boolean, color: undefined | string; }
) {
  // console.log("BoardPlayCell re-rendered");

  let style = {};

  if (highlight) {
    style = { backgroundColor: '#e0e0e0' };
  }

  return (
    <td className="BoardPlayCell" style={style}>
      {color !== undefined ? <GamePiece color={color} /> : null}
    </td>
  );
}