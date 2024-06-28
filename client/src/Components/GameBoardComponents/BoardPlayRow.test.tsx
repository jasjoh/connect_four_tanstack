import React from 'react';
import { render } from '@testing-library/react';
import BoardPlayRow from './BoardPlayRow'
import BoardPlayCell from './BoardPlayCell';

/**
 * Takes in rowState as prop [ { player, highlight } ]
 * Generates array of BoardPlayCells using rowState data
 * Renders one or more BoardPlayCells with key, highlight and color
 */

function createRowState(rows=1, players=0, highlights=0) {
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

  let rowState = createRowState()

  const { container } = render(
    <BoardPlayRow rowState={rowState} />
  );

  const boardDropRowTr = container.querySelector("tr");
  expect(boardDropRowTr).toHaveClass('BoardPlayRow');
});

test('BoardPlayRow passes correct params to correct # child components', () => {

  let rowState = createRowState(3)

  render(<BoardPlayRow rowState={rowState} />);

  expect(BoardPlayCell).toHaveBeenCalledTimes(3);

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: undefined,
    highlight: false
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});

test('BoardPlayRow passes correct highlight and color values to child component', () => {

  let rowState = createRowState(1, 1, 1)

  render(<BoardPlayRow rowState={rowState} />);

  expect(BoardPlayCell).toHaveBeenCalledWith({
    color: '#f3f3f3',
    highlight: true
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls
});
