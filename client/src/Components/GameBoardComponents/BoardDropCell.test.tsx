import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BoardDropCell } from './BoardDropCell';

test('renders BoardDropCell component without crashing', () => {
  const tableRow = document.createElement('tr');
  const { container } = render(
    <BoardDropCell colIndex={1} dropPiece={() => { }} />,
    { container: document.body.appendChild(tableRow) }
  );

  const boardPlayCellTd = container.querySelector("td");
  expect(boardPlayCellTd).toHaveClass('BoardDropCell');
});

test('calls dropPiece() with passed in colIndex on click', () => {
  const tableRow = document.createElement('tr');
  let returnedColIndex;
  function dropPiece(colIndex: number) {
    returnedColIndex = colIndex;
  }

  const { container } = render(
    <BoardDropCell colIndex={3} dropPiece={(dropPiece)} />,
    { container: document.body.appendChild(tableRow) }
  );

  const boardPlayCellTd = container.querySelector("td");
  fireEvent.click(boardPlayCellTd!);
  expect(returnedColIndex).toBe(3);
});
