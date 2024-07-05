import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import * as Mocks from '../../mocks';

import { GameBoard } from './GameBoard'
import { BoardPlayRow } from './BoardPlayRow';
import { BoardDropRow } from './BoardDropRow';
import { ClientBoard } from '../../gameManager';

/**
 * Props:
 *  - boardState: The active game's state which includes:
 *  --- the height and width of the board
 *  --- where any game pieces have been placed and their color
 *  --- the winning set of game pieces (if they exist)
 *  - dropPiece(): A callback function for when a player attempts to drop a piece
 *
 * Logic:
 * - builds an array of BoardDropRows using boardState
 * - sets value for rowState prop to row extracted from boardState via map
 *
 * Renders
 * - BoardDropRow, passing in boardState[0].length and dropPiece()
 * - BoardPlayRow, passing in rowState
 *
 **/

// mock child components
jest.mock('./BoardDropRow');
jest.mock('./BoardPlayRow');

const boardState : ClientBoard = Mocks.mockClientBoard;
const dropPiece = () => undefined;
const gameState = 2;
const gamePlayers = Mocks.mockGamePlayers;

test('GameBoard renders without crashing when passed valid props', () => {

  const { container } = render(
    <GameBoard
      boardState={boardState}
      dropPiece={dropPiece}
      gameState={gameState}
      gamePlayers={gamePlayers}
    />
  );

  const gameBoard = container.querySelector("div");
  expect(gameBoard).toHaveClass('GameBoard');
});

test('GameBoard passes correct params to correct # child components', () => {

  render(
    <GameBoard
      boardState={boardState}
      dropPiece={dropPiece}
      gameState={gameState}
      gamePlayers={gamePlayers}
    />
  );

  expect(BoardDropRow).toHaveBeenCalled();
  expect(BoardPlayRow).toHaveBeenCalledTimes(6);

  expect(BoardDropRow).toHaveBeenCalledWith({
    width: 7,
    dropPiece: dropPiece
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls

  expect(BoardPlayRow).toHaveBeenCalledWith({
    rowState: boardState[0]
  }, expect.anything()) // expect.anything() accounts for {} passed in all React calls

});