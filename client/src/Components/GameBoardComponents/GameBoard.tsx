import React from "react";
import { ClientBoard } from "../../gameManager";
import { Player } from "../../server";

import { BoardPlayRow } from "./BoardPlayRow";
import { BoardDropRow } from "./BoardDropRow";

import "./GameBoard.css"

interface GameBoardProps {
  gameState: number | undefined;
  boardState: ClientBoard;
  gamePlayers: Player[];
  dropPiece: (col: number) => void;
}

/** Displays the game board
 *
 * Props:
 * - gameState: the state of the game ( to enable / disable dropping )
 * - boardState: The active game's state [ [ { playerId, highlight } ] ]
 * - gamePlayers: A list of player objects { ai, color, createdOn, id, name, playOrder }
 * - dropPiece(): A callback function for when a player attempts to drop a piece
 *
 * State:
 *  - None
 *
 * PlayGame -> GameBoard
 *
 * GameBoard -> BoardDropRow
 * GameBoard -> BoardPlayRow
 * */
export function GameBoard({ gameState, boardState, gamePlayers, dropPiece } : GameBoardProps) {
  // console.log("GameBoard re-rendered");
  // console.log("called w/ boardState:", boardState);

  if (gameState !== 1) {
    dropPiece = () => console.log("dropPiece called while game not started");
  }

  // Build array of BoardPlayRows
  let boardPlayRowsJsx = boardState.map( (row, index) => {
    // console.log("new play row being added for row, index:", row, index);
    return <BoardPlayRow key={index} rowState={row} gamePlayers={gamePlayers} />;
  })

  return (
    <div className="GameBoard">
      <table className="GameBoard-board"><tbody>
        <BoardDropRow
          width={ boardState[0].length }
          dropPiece={ dropPiece }
        />
        { boardPlayRowsJsx.map( row => row ) }
      </tbody></table>
    </div>
  );
}