import { GameManager } from "../gameManager.js";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PlayerList from "./PlayerList.js";
import GameBoard from "./GameBoardComponents/GameBoard.js";
import LoadingSpinner from "./LoadingSpinner.js";
import GameDetailsPropertyList from "./GameDetailsPropertyList.js";

/** Main component that handles playing a specific game
 *
 * Props:
 * - None
 *
 * URL Params:
 * - gameId: The game ID to play
 *
 * State:
 * - isLoading: Whether the component is still loading server data or not
 * - gameManager: The instance of the GameManager associated with the game being played
 * - renderToggle: A helper state for re-rendering when server-state mutates in the GameManager
 *
 * GameDetails -> (gameId) -> PlayGame
 * /games/{gameId} -> PlayGame
 *
 * PlayGame -> GameDetailsPropertyList
 * PlayGame -> PlayerList
 * PlayGame -> GameBoard
 *
 * PlayGame -> LoadingSpinner
 */
function PlayGame() {
  // console.log("PlayGame re-rendered");
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [gameManager, setGameManager] = useState(null);

  /** Hack to handle the fact game state is mutating server-side and avoid
   * having to generate new GameManagers each time game state is updated */
  // eslint-disable-next-line
  const [renderToggle, setRenderToggle] = useState(false);

  /** Constructs a new GameManager on mount or on changing of gameId
  * After construction, initializes the new GameManager and then sets state
  * Once the new GameManager state is set, sets isLoading to false
  */
  useEffect(function initializeGameManagerEffect() {
    async function initializeGameManager() {
      const newGameManager = new GameManager(gameId, forceReRender);
      await newGameManager.initialize();
      setGameManager(newGameManager);
      setIsLoading(false);
    }
    // console.log("initializeGameManagerFetch() called; component re-mounted or gameId changed");
    initializeGameManager();
  }, [gameId]);

  /** Used by the gameManager as a callback function to force re-render when game state is updated  */
  function forceReRender() {
    // console.log("PlayGame.forceReRender() called");
    setRenderToggle(prevValue => { return !prevValue; });
  }

  /** Called when a user clicks on the start or re-start button
   * Calls the GameManager's startGame() function  */
  async function startGame() {
    // console.log("startGame() called");
    await gameManager.startGame();
  }

  /** Called when a user clicks the button to delete the current game
   * Calls the GameManager's deleteGame() function */
  async function deleteGame() {
    // console.log("deleteGame() called");
    await gameManager.deleteGame();
    navigate(`/`);
  }

  /** Called when a user clicks the button to manage the players in a game
   * Navigates the user to the GameDetails for the game */
  async function managePlayers() {
    // console.log("managePlayers() called");
    navigate(`/games/${gameId}`);
  }

  /** Called when a user drops a piece in a drop row
   * Calls the GameManager's dropPiece() function */
  async function dropPiece(colIndex) {
    // console.log("dropPiece() called with colIndex:", colIndex);
    await gameManager.dropPiece(colIndex);
  }

  if (isLoading) return (<LoadingSpinner />);

  return (
    <div className="PlayGame">
      <GameDetailsPropertyList gameData={gameManager.game.gameData} />
      <PlayerList playerList={gameManager.players} />
      <div className="PlayGame-manageButtons">
        <button className="PlayGame-manageButtons-button" onClick={startGame}>
          {gameManager.gameState === 0 ? 'Start' : 'Restart'}
        </button>
        <button className="PlayGame-manageButtons-button" onClick={deleteGame}>
          Delete
        </button>
        <button className="PlayGame-manageButtons-button" onClick={managePlayers}>
          Manage Players
        </button>
      </div>
      <GameBoard
        gameState={gameManager.gameState}
        boardState={gameManager.board}
        gamePlayers={gameManager.players}
        dropPiece={dropPiece}>
      </GameBoard>
    </div>
  );
}

export default PlayGame;