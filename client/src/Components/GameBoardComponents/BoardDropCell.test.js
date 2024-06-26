import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BoardDropCell from './BoardDropCell'

/**
 * Called w/ colIndex and dropPiece() callback
 * Renders a single TD w/ a click handler called handleClick which calls dropPiece
 */

test('renders BoardDropCell component without crashing (no props)', () => {
  const { container } = render(
    <BoardDropCell />
  );

  const boardPlayCellTd = container.querySelector("td");
  expect(boardPlayCellTd).toHaveClass('BoardDropCell');
});

test('calls dropPiece() with passed in colIndex on click', () => {
  let returnedColIndex;
  function dropPiece(colIndex) {
    returnedColIndex = colIndex;
  }

  const { container } = render(
    <BoardDropCell colIndex={3} dropPiece={(dropPiece)}/>
  );

  const boardPlayCellTd = container.querySelector("td");
  fireEvent.click(boardPlayCellTd);
  expect(returnedColIndex).toBe(3);
});
