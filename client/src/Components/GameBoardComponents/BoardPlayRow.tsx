import React from "react";

import { ClientBoardCell } from "../../gameManager";
import { Player } from "../../server";

import { BoardPlayCell } from "./BoardPlayCell";

/** Displays a game board row where game pieces end up after being dropped
 *
 * Props:
 *  - rowState: The game state of a row on the game board
 *  - gamePlayers: The list of players playing the game associated with this board
 *
 * State:
 *  - None
 *
 * GameBoard -> BoardPlayRow
 * BoardPlayRow -> BoardPlayCell
 * */
export function BoardPlayRow(
  { rowState, gamePlayers }: { rowState: ClientBoardCell[], gamePlayers: Player[]; }
): JSX.Element {
  // console.log("BoardPlayRow re-rendered");
  // console.log("rowState passed in is:", rowState);

  let cellsJsx = [];
  for (let i = 0; i < rowState.length; i++) {
    let color = undefined;
    let highlight = false;
    if (rowState[i].playerId) {
      const player = gamePlayers.find(p => p.id === rowState[i].playerId);
      color = player!.color;
    }
    if (rowState[i].highlight) { highlight = true; }
    cellsJsx.push(
      <BoardPlayCell key={i} highlight={highlight} color={color} />
    );
  }

  return (<tr className="BoardPlayRow">{cellsJsx.map(cell => cell)}</tr>);
}