import React from 'react';
import { render } from '@testing-library/react';
import { BoardPlayCell } from './BoardPlayCell'
import { GamePiece } from './GamePiece';

jest.mock('./GamePiece');

test('BoardPlayCell renders without crashing when passed valid props', () => {
  const tableRow = document.createElement('tr');
  const { container } = render(
    <BoardPlayCell highlight={false} color={undefined} />,
    { container: document.body.appendChild(tableRow) }
  );

  const boardPlayCellTd = container.querySelector("td");
  expect(boardPlayCellTd).toHaveClass('BoardPlayCell');
});

test('BoardPlayCell renders with highlight when expected', () => {
  const tableRow = document.createElement('tr');
  const { container } = render(
    <BoardPlayCell highlight={true} color={undefined} />,
    { container: document.body.appendChild(tableRow) }
  );

  const boardPlayCellTd = container.querySelector("td");
  expect(boardPlayCellTd).toHaveStyle({
    backgroundColor: '#c5c5c5;'
  });
});

test('BoardPlayRow passes correct params to child component', () => {
  const tableRow = document.createElement('tr');
  render(
    <BoardPlayCell color={'#c3c3c3'} highlight={true} />,
    { container: document.body.appendChild(tableRow) }
  );

  expect(GamePiece).toHaveBeenCalledWith({
    color: '#c3c3c3'
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});