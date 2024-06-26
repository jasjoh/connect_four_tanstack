import "./GamePiece.css"

/** An individual game piece dropped by a player
 *
 * Props:
 *  - color: The background color of the piece based on player selection
 *
 * State:
 *  - None
 *
 * BoardPlayCell -> GamePiece
 * */
function GamePiece({ color='#ff0000' }) {
  // console.log("GamePiece re-rendered");

  const style = {
    backgroundColor: color
  }

  return (
    <div className="GamePiece" style={style}>
    </div>
  );
}

export default GamePiece;