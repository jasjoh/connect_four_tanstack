// import "./BoardDropCell.css"

/** An individual cell which can be clicked to drop a piece into a column
 *
 * Props:
 *  - colIndex: The index of the column this cell resides in; use for callback
 *  - dropPiece(): A callback function to call when this cell is clicked
 *
 * State:
 *  - None
 *
 * BoardDropRow -> BoardDropCell
 * */
function BoardDropCell({ colIndex, dropPiece }) {
  // console.log("BoardDropCell re-rendered");

  /** Handles a click and calls dropPiece with correct column index */
  function handleClick(evt) {
    // console.log("BoardDropCell clicked, calling dropPiece with:", colIndex);
    dropPiece(colIndex);
  }

  return (
    <td
      className="BoardDropCell"
      id={`BoardDropCell-${colIndex}`}
      onClick={handleClick}>
    </td>
  );
}

export default BoardDropCell;