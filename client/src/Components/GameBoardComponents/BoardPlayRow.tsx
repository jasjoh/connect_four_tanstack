// import "./GameDropRow.css"
import BoardPlayCell from "./BoardPlayCell";

/** Displays a row where game pieces end up after being dropped
 *
 * Props:
 *  - rowState: A row on the game board [ { playerId, highlight } ]
 *  - gamePlayers: An array of player objects { id, name, ai, color, createdOn }
 *
 * State:
 *  - None
 *
 * GameBoard -> BoardPlayRow
 * BoardPlayRow -> BoardPlayCell
 * */
function BoardPlayRow({ rowState, gamePlayers }) {
  // console.log("BoardPlayRow re-rendered");
  // console.log("rowState passed in is:", rowState);

  let cellsJsx = [];
  for (let i = 0; i < rowState.length; i++) {
    let color = undefined;
    let highlight = false;
    if (rowState[i].playerId) {
      const player = gamePlayers.find(p => p.id === rowState[i].playerId)
      color = player.color;
    }
    if (rowState[i].highlight) { highlight = true; }
    cellsJsx.push(
      <BoardPlayCell key={i} highlight={highlight} color={color} />
    )
  }

  return (<tr className="BoardPlayRow">{ cellsJsx.map( cell => cell ) }</tr>);
}

export default BoardPlayRow;