import React from 'react';
import { render } from '@testing-library/react';
import { BoardDropRow } from './BoardDropRow';
import { BoardDropCell } from './BoardDropCell';

// mock child components
jest.mock('./BoardDropCell');

function dropPiece() { };

test('BoardDropRow renders without crashing when passed valid props', () => {

  jest.clearAllMocks();

  const tableBody = document.createElement('tbody');
  const { container } = render(
    <BoardDropRow width={3} dropPiece={dropPiece} />,
    { container: document.body.appendChild(tableBody) }
  );

  const boardDropRowTr = container.querySelector("tr");
  expect(boardDropRowTr).toHaveClass('BoardDropRow');
});

test('BoardDropRow passes correct params to correct # child components', () => {

  jest.clearAllMocks();

  const tableBody = document.createElement('tbody');
  render(
    <BoardDropRow width={3} dropPiece={dropPiece} />,
    { container: document.body.appendChild(tableBody) }
  );

  expect(BoardDropCell).toHaveBeenCalledTimes(3);

  expect(BoardDropCell).toHaveBeenCalledWith({
    colIndex: 0,
    dropPiece: dropPiece
  }, expect.anything()); // expect.anything() accounts for {} passed in all React calls
});