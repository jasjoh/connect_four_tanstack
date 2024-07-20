import React, { useEffect } from "react";
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { delay } from "../utils";
import { Server } from "../server";
import {
  useGamePlayStateQuery,
  useGamePlayersQuery,
  useStartGameMutation,
  useDeleteGameMutation
} from "../hooks";

import { PlayerList } from "./PlayerList";
import { GameBoard } from "./GameBoardComponents/GameBoard";
import { LoadingSpinner } from "./LoadingSpinner";
import { GameDetailsPropertyList } from "./GameDetailsPropertyList";
import { GameManagerV2 } from "../gameManagerV2";

const animatePlaysDelayInMs = 1000;

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
 * - gamePlayStateQuery.data.gameData The instance of the gamePlayStateQuery.data.gameDataassociated with the game being played
 * - renderToggle: A helper state for re-rendering when server-state mutates in the gamePlayStateQuery.data.gameData *
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
  console.log("PlayGame re-rendered");
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [server, setServer] = useState<Server>(Server.getInstance());
  const [gameManager, setGameManager] = useState<GameManagerV2 | null>(null);

  useEffect(function initializeGameManagerEffect(): void {
    const newGameManager: GameManagerV2 = new GameManagerV2(server, gameId!);
    setGameManager(newGameManager);
  }, [gameId]);

  useEffect(function processTurnEffect(): void {
    async function executeProcessTurnEffect() {
      if (gameManager && gameManager?.countNewTurnsRemaining() > 0) {
        const queryClient = useQueryClient();
        const newGamePlayState = gameManager?.processNewTurn();
        queryClient.setQueryData(['gamePlayState', gameId], newGamePlayState);
        queryClient.invalidateQueries({ queryKey: ['gameDetails', gameId] });
        await delay(animatePlaysDelayInMs);
      }
    }
    executeProcessTurnEffect();
  }, [gameManager?.countNewTurnsRemaining]);

  // const gamePlayStateQuery = useClientBoardAndGameData(server, gameId!)
  const gamePlayStateQuery = useGamePlayStateQuery(gameManager, gameId);
  const gamePlayersQuery = useGamePlayersQuery(server, gameId!);

  const startGameMutation = useStartGameMutation(server);
  const deleteGameMutation = useDeleteGameMutation(server);

  /** Called when a user clicks on the start or re-start button
   * Calls the startGameMutation mutate function  */
  async function startGame(): Promise<void> {
    // console.log("startGame() called");
    await startGameMutation.mutateAsync(gameId!);
  }

  /** Called when a user clicks the button to delete the current game
   * Calls the deleteGameMutation mutate function and navigates to root */
  async function deleteGame(): Promise<void> {
    console.log("deleteGame() called");
    await deleteGameMutation.mutateAsync(gameId!);
    console.log("deleteGameMutation finished.");
    navigate(`/`);
    console.log("deleteGame() exiting");
  }

  /** Called when a user clicks the button to manage the players in a game
   * Navigates the user to the GameDetails for the game */
  async function managePlayers(): Promise<void> {
    // console.log("managePlayers() called");
    navigate(`/games/${gameId}`);
  }

  const dropPiece = useCallback(async (colIndex: number) => {
    const gameData = gamePlayStateQuery.data!.gameData;
    if (gameData.gameState === 1) {
      await server.dropPiece(gameId!, gameData.currPlayerId, colIndex);
    } else {
      console.log("dropPiece called while game in started state");
    }
  }, [gamePlayStateQuery.data?.gameData.gameState]);

  if (gamePlayStateQuery.isPending || gamePlayersQuery.isPending) return (<LoadingSpinner />);

  if (gamePlayStateQuery.error || gamePlayersQuery.error) return (<div>'A TanStack error has occurred ...'</div>);

  const gameData = gamePlayStateQuery.data.gameData;

  return (
    <div className="PlayGame">
      <GameDetailsPropertyList gameData={gameData} />
      <PlayerList playerList={gamePlayersQuery.data} action={undefined} actionType={undefined} />
      <div className="PlayGame-manageButtons">
        <button className="PlayGame-manageButtons-button" onClick={startGame}>
          {gameData.gameState === 0 ? 'Start' : 'Restart'}
        </button>
        <button className="PlayGame-manageButtons-button" onClick={deleteGame}>
          Delete
        </button>
        <button className="PlayGame-manageButtons-button" onClick={managePlayers}>
          Manage Players
        </button>
      </div>
      <GameBoard
        boardState={gamePlayStateQuery.data.clientBoard}
        gamePlayers={gamePlayersQuery.data}
        dropPiece={dropPiece}>
      </GameBoard>
    </div>
  );
}