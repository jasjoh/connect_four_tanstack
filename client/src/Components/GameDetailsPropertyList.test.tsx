import React from 'react';
import { render } from '@testing-library/react';
import { GameDetailsPropertyList } from './GameDetailsPropertyList';
import { mockGame } from '../mocks';

test('renders GameDetailsPropertyList component with correct game data', () => {
    const gameData = mockGame.gameData;
    const { container } = render(
        <GameDetailsPropertyList gameData={gameData} />
    );
    const gameIdSpan = container.querySelector("#GameDetailsPropertyList-val-gameId");
    expect(gameIdSpan).toHaveTextContent(gameData.id);
    const gameStateSpan = container.querySelector("#GameDetailsPropertyList-val-gameId");
    expect(gameStateSpan).toHaveTextContent(gameData.gameState.toString());
});
