import React from "react";

/** An individual cell which can be clicked to drop a piece into a column
 *
 * Props:
 *  - colIndex: The index of the column this cell resides in; used for callback
 *  - dropPiece(): A callback function to call when this cell is clicked
 *
 * State:
 *  - None
 *
 * BoardDropRow -> BoardDropCell
 * */
export function BoardDropCell(
  { colIndex, dropPiece }: { colIndex: number, dropPiece: (col: number) => void; }
) {
  // console.log("BoardDropCell re-rendered");

  /** Handles a click and calls dropPiece with correct column index */
  function handleClick(evt: React.MouseEvent): void {
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