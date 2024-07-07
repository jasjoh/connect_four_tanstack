import React from "react";

import { gameStates } from "../utils";
import { GameData } from "../server";

/** Displays a list of the properties of a game
 *
 * Props:
 *  - gameData: The game data to display the properties of
 *
 * State:
 *  - None
 *
 * GameDetails -> GameDetailsPropertyList
 * */

export function GameDetailsPropertyList({ gameData }: { gameData: GameData; }): JSX.Element {
  // console.log("GameDetailsPropertyList re-rendered");
  return (
    <div className="GameDetailsPropertyList">
      <div>
        <span
          className="GameDetailsPropertyList-prop"
          id="GameDetailsPropertyList-prop-gameId">
          Game ID:
        </span>
        <span
          className="GameDetailsPropertyList-val"
          id="GameDetailsPropertyList-val-gameId">
          {gameData.id}
        </span>
      </div>
      <div>
        <span
          className="GameDetailsPropertyList-prop"
          id="GameDetailsPropertyList-prop-gameState">
          Game State:
        </span>
        <span
          className="GameDetailsPropertyList-val"
          id="GameDetailsPropertyList-val-gameState">
          {gameStates[gameData.gameState]}
        </span>
      </div>
    </div>
  );
}