// import "./GameDetailsPropertyList.css";

import { gameStates } from "../utils.js";

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

  function GameDetailsPropertyList({gameData}) {
    // console.log("GameDetailsPropertyList re-rendered");
    return (
      <div className="GameDetailsPropertyList">
        <div>
          <span className="GameDetailsPropertyList-prop">Game ID:</span>
          <span className="GameDetailsPropertyList-val">{gameData.id}</span>
        </div>
        <div>
          <span className="GameDetailsPropertyList-prop">Game State:</span>
          <span className="GameDetailsPropertyList-val">{gameStates[gameData.gameState]}</span>
        </div>
      </div>
    );
  }

  export default GameDetailsPropertyList;