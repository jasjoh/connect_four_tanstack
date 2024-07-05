import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { GameManager, GameManagerInterface } from "../gameManager";

import { PlayerList } from "./PlayerList";
import { GameBoard } from "./GameBoardComponents/GameBoard";
import { LoadingSpinner } from "./LoadingSpinner";
import { GameDetailsPropertyList } from "./GameDetailsPropertyList";

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
export function PlayGame() {
  // console.log("PlayGame re-rendered");
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [gameManager, setGameManager] = useState<GameManagerInterface|null>(null);

  /** Hack to handle the fact game state is mutating server-side and avoid
   * having to generate new GameManagers each time game state is updated */
  // eslint-disable-next-line
  const [renderToggle, setRenderToggle] = useState(false);

  /** Constructs a new GameManager on mount or on changing of gameId
  * After construction, initializes the new GameManager and then sets state
  * Once the new GameManager state is set, sets isLoading to false
  */
  useEffect(function initializeGameManagerEffect() : void {
    async function initializeGameManager() : Promise<void>{
      const newGameManager: GameManagerInterface = new GameManager(gameId!, forceReRender);
      await newGameManager.initialize();
      setGameManager(newGameManager);
      setIsLoading(false);
    }
    // console.log("initializeGameManagerFetch() called; component re-mounted or gameId changed");
    initializeGameManager();
  }, [gameId]);

  /** Used by the gameManager as a callback function to force re-render when game state is updated  */
  function forceReRender() : void {
    // console.log("PlayGame.forceReRender() called");
    setRenderToggle(prevValue => { return !prevValue; });
  }

  /** Called when a user clicks on the start or re-start button
   * Calls the GameManager's startGame() function  */
  async function startGame() : Promise<void> {
    // console.log("startGame() called");
    await gameManager!.startGame();
  }

  /** Called when a user clicks the button to delete the current game
   * Calls the GameManager's deleteGame() function */
  async function deleteGame() : Promise<void> {
    // console.log("deleteGame() called");
    await gameManager!.deleteGame();
    navigate(`/`);
  }

  /** Called when a user clicks the button to manage the players in a game
   * Navigates the user to the GameDetails for the game */
  async function managePlayers() : Promise<void>{
    // console.log("managePlayers() called");
    navigate(`/games/${gameId}`);
  }

  /** Called when a user drops a piece in a drop row
   * Calls the GameManager's dropPiece() function */
  // async function dropPiece(colIndex: number) : Promise<void> {
  //   // console.log("dropPiece() called with colIndex:", colIndex);
  //   await gameManager!.dropPiece(colIndex);
  // }

  const dropPiece = useCallback(async (colIndex: number) => {
    if (gameManager!.getGameState() === 1) {
      await gameManager!.dropPiece(colIndex);
    } else {
      console.log("dropPiece called while game in started state");
    }
  },[gameManager])

  if (isLoading) return (<LoadingSpinner />);

  return (
    <div className="PlayGame">
      <GameDetailsPropertyList gameData={gameManager!.getGameAndTurns().gameData} />
      <PlayerList playerList={gameManager!.getPlayers()} action={undefined} actionType={undefined} />
      <div className="PlayGame-manageButtons">
        <button className="PlayGame-manageButtons-button" onClick={startGame}>
          {gameManager!.getGameState() === 0 ? 'Start' : 'Restart'}
        </button>
        <button className="PlayGame-manageButtons-button" onClick={deleteGame}>
          Delete
        </button>
        <button className="PlayGame-manageButtons-button" onClick={managePlayers}>
          Manage Players
        </button>
      </div>
      <GameBoard
        boardState={gameManager!.getClientBoard()}
        gamePlayers={gameManager!.getPlayers()}
        dropPiece={dropPiece}>
      </GameBoard>
    </div>
  );
}