import React from 'react';
import { render } from '@testing-library/react';

import * as Mocks from '../../mocks';

import { GameBoard } from './GameBoard';
import { BoardPlayRow } from './BoardPlayRow';
import { BoardDropRow } from './BoardDropRow';
import { ClientBoard } from '../../gameManager';

// mock child components
jest.mock('./BoardDropRow');
jest.mock('./BoardPlayRow');

const boardState: ClientBoard = Mocks.mockClientBoard;
const dropPiece = () => undefined;
const gamePlayers = Mocks.mockGamePlayers;

test('GameBoard renders without crashing when passed valid props', () => {

  jest.clearAllMocks();

  const { container } = render(
    <GameBoard
      boardState={boardState}
      dropPiece={dropPiece}
      gamePlayers={gamePlayers}
    />
  );

  const gameBoard = container.querySelector("div");
  expect(gameBoard).toHaveClass('GameBoard');
});

test('GameBoard passes correct params to correct # child components', () => {

  jest.clearAllMocks();

  render(
    <GameBoard
      boardState={boardState}
      dropPiece={dropPiece}
      gamePlayers={gamePlayers}
    />
  );

  expect(BoardDropRow).toHaveBeenCalled();
  expect(BoardPlayRow).toHaveBeenCalledTimes(6);

  expect(BoardDropRow).toHaveBeenCalledWith({
    width: 7,
    dropPiece: dropPiece
  }, expect.anything()); // expect.anything() accounts for {} passed in all React calls

  /**
   * .toHaveBeenCalledWith() performs an exact match for the entire request, but we only
   * care if at least one of the calls has a signature matching the first row of our
   * board. We can deconstruct Jest's matching logic to perform our own custom matching
   * and then have Jest report simply on whether a match was found or not.
   */
  const calls = (BoardPlayRow as jest.Mock).mock.calls;
  const hasCall = calls.some(call => {
    const expectation = expect.objectContaining(
      { rowState: boardState[0], gamePlayers: expect.anything() }
    );
    const result = expectation.asymmetricMatch(call[0]);
    return result;
  });
  expect(hasCall).toBe(true);
});