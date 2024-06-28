import "./BoardDropRow.css"
import BoardDropCell from "./BoardDropCell";

/** Displays the row where game pieces are 'dropped'
 *
 * Props:
 *  - width: The width (# of cells) that should be rendered
 *  - dropPiece(): A callback function for when a player attempts to drop a piece
 *
 * State:
 *  - None
 *
 * GameBoard -> BoardDropRow
 *
 * BoardDropRow -> BoardDropCell
 * */
function BoardDropRow({ width, dropPiece }) {
  // console.log("BoardDropRow re-rendered, passed width of:", width);

  let cellsJsx = [];
  let curCol = 0;
  while (curCol < width) {
    cellsJsx.push(
      <BoardDropCell key={curCol} colIndex={curCol} dropPiece={dropPiece} />
    );
    curCol++;
  }

  // console.log("drop row cells array populated:", cellsJsx);

  return (<tr className="BoardDropRow">{ cellsJsx.map( cell => cell )}</tr>);
}

export default BoardDropRow;