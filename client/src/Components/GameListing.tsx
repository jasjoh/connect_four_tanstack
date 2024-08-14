import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GameSummary } from '../server';

import "./GameListing.css";

/** Displays a specific game listing
 *
 * Props:
 *  - game: Summary data about a game to display.
 *
 * State:
 *  - None
 *
 * GameList -> GameListing */
export function GameListing({ game }: { game: GameSummary; }): JSX.Element {
  // console.log("GameListing re-rendered");

  const navigate = useNavigate();

  function gameClick(): void {
    // console.log("Game row clicked. Navigating to:", `/games/${game.id}`);
    navigate(`/games/${game.id}`);
  }

  return (
    <tr onClick={gameClick} className="GameListing-tr">
      <td className="GameListing-td">{`${game.id}`}</td>
      <td className="GameListing-td">{`${game.gameState}`}</td>
      <td className="GameListing-td">{`${game.createdOn}`}</td>
      <td className="GameListing-td">{`${game.totalPlayers}`}</td>
    </tr>
  );
}