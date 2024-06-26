import React from 'react';
import { render } from '@testing-library/react';
import GamePiece from './GamePiece'

test('renders GamePiece component with default color', () => {
  const { container } = render(
    <GamePiece />
  );
  const gamePieceDiv = container.querySelector(".GamePiece");
  expect(gamePieceDiv).toHaveStyle({
    backgroundColor: '#ff0000;'
    // backgroundColor: 'rgb(255, 0, 0);'
  });
});

test('renders GamePiece component with specified color', () => {
  const { container } = render(
    <GamePiece color={'#c3c3c3'}/>
  );
  const gamePieceDiv = container.querySelector(".GamePiece");
  expect(gamePieceDiv).toHaveStyle({
    backgroundColor: '#c3c3c3;'
  });
});
