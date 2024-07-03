import React from 'react';
import { render } from '@testing-library/react';
import { BoardPlayRow } from './BoardPlayRow'
import { BoardPlayCell } from './BoardPlayCell';
import { ClientBoardCell } from '../../gameManager';
import { Player } from '../../server';

/**
 * Accepts a number of cols, players and highlights
 * Creates a row of the specific number of columns (default to 1)
 * Assigns players
 *
 */
function createRowState(cols=1, players=0, highlights=0) : ClientBoardCell[] {
  let curRow = 0;
  let rowState = [];
  let playersAdded = 0;
  let highlightsAdded = 0;
  while (curRow < rows) {
    let row = {}
    if (playersAdded < players) {
      row.player = { color:  '#f3f3f3' }
      playersAdded++;
    } else {
      row.player = null;
    }
    if (highlightsAdded < highlights) {
      row.highlight = true;
      highlightsAdded++;
    }
    rowState.push(row);
    curRow++;
  }
  return rowState;
}

jest.mock('./BoardPlayCell');

test('BoardPlayRow renders without crashing when passed valid props', () => {

  let rowState = createRowState();
  let gamePlayers = createGamePlayers();

  const tableBody = document.createElement('tbody');
  const { container } = render(
    <BoardPlayRow rowState={rowState} gamePlayers={gamePlayers} />,
    { container: document.body.appendChild(tableBody) }
  );

  const boardDropRowTr = container.querySelector("tr");
  expect(boardDropRowTr).toHaveClass('BoardPlayRow');
});

test('BoardPlayRow passes correct params to correct # child components', () => {

  let rowState = createRowState(3)

  const tableBody = document.createElement('tbody');
  render(
    <BoardPlayRow rowState={rowState} />,
    { container: document.body.appendChild(tableBody) }
  );

  expect(BoardPlayCell).toHaveBeenCalledTimes(3);

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: undefined,
    highlight: false
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});

test('BoardPlayRow passes correct highlight and color values to child component', () => {

  let rowState = createRowState(1, 1, 1)

  const tableBody = document.createElement('tbody');
  render(
    <BoardPlayRow rowState={rowState} />,
    { container: document.body.appendChild(tableBody) }
  );

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: '#f3f3f3',
    highlight: true
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});
