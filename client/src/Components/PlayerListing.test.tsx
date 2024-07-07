import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlayerListing } from './PlayerListing';

import { mockPlayers } from '../mocks';

test('renders PlayerListing component correctly with undefined actionType', () => {
    const player = mockPlayers[0];
    const action = undefined;
    const actionType = undefined;

    const tableBody = document.createElement('tbody');
    const { container } = render(
        <PlayerListing
            player={player}
            action={action}
            actionType={actionType}
        />,
        { container: document.body.appendChild(tableBody) }
    );

    const playerId = screen.queryByText(player.id);
    const playerName = screen.queryByText(player.name);
    const playerAi = screen.queryByText(player.ai.toString());
    const playerCreatedOn = screen.queryByText(player.createdOn);

    expect(playerId).not.toBeNull();
    expect(playerName).not.toBeNull();
    expect(playerAi).not.toBeNull();
    expect(playerCreatedOn).not.toBeNull();

    const playerColorTd = container.querySelector('#PlayerListing-td-color')
    expect(playerColorTd).toHaveStyle({'background-color': player.color });

    const actionButton = container.querySelector('.PlayerListing-td-button');
    expect(actionButton).toBeNull();
});

test('renders PlayerListing component correctly with a defined actionType', () => {

    const player = mockPlayers[0];
    const action = jest.fn();
    const actionType = 'deletePlayer';

    const tableBody = document.createElement('tbody');
    render(
        <PlayerListing
            player={player}
            action={action}
            actionType={actionType}
        />,
        { container: document.body.appendChild(tableBody) }
    );

    const button = screen.queryByText('DELETE');
    expect(button).not.toBeNull();
    fireEvent.click(button as HTMLButtonElement);
    expect(action).toHaveBeenCalled();
});
