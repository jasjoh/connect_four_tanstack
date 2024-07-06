import React from 'react';
import { render } from '@testing-library/react';

import * as Mocks from '../../mocks';

import { BoardPlayRow } from './BoardPlayRow'
import { BoardPlayCell } from './BoardPlayCell';
import { ClientBoardCell } from '../../gameManager';
import { GamePlayer } from '../../server';

/**
 * Accepts a number of cols, players and highlights
 * Creates a row of the specific number of columns (default to 1)
 * Assigns players
 *
 */

jest.mock('./BoardPlayCell');

const rowStateEmpty : ClientBoardCell[] = Mocks.mockClientBoard[0] ;
const rowStateWithPieces : ClientBoardCell[] = Mocks.mockClientBoard[1] ;
const gamePlayers : GamePlayer[] = Mocks.mockGamePlayers;

test('BoardPlayRow renders without crashing when passed valid props', () => {

  const tableBody = document.createElement('tbody');
  const { container } = render(
    <BoardPlayRow rowState={rowStateEmpty} gamePlayers={gamePlayers} />,
    { container: document.body.appendChild(tableBody) }
  );

  const boardDropRowTr = container.querySelector("tr");
  expect(boardDropRowTr).toHaveClass('BoardPlayRow');
});

test('BoardPlayRow passes correct params to correct # child components', () => {

  jest.clearAllMocks();

  const tableBody = document.createElement('tbody');
  render(
    <BoardPlayRow rowState={rowStateEmpty} gamePlayers={gamePlayers} />,
    { container: document.body.appendChild(tableBody) }
  );

  expect(BoardPlayCell).toHaveBeenCalledTimes(7);

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: undefined,
    highlight: false
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});

test('BoardPlayRow passes correct highlight and color values to child component', () => {

  jest.clearAllMocks();

  const tableBody = document.createElement('tbody');
  render(
    <BoardPlayRow rowState={rowStateWithPieces} gamePlayers={gamePlayers} />,
    { container: document.body.appendChild(tableBody) }
  );

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: '#c3c5c1',
    highlight: true
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});
