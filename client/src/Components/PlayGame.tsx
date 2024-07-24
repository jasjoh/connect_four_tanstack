import React, { useEffect } from "react";
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { delay } from "../utils";
import { Server } from "../server";
import {
  useGetGameClientStateQuery,
  useUpdateGameClientStateQuery,
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
 * - server: A reference to the Server singleton
 * - gameManager: The instance of the gameManager associated with the game being played
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
  console.log("PlayGame re-rendered");
  const { gameId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [server, setServer] = useState<Server>(Server.getInstance());
  const [gameManager, setGameManager] = useState<GameManagerV2>(GameManagerV2.getInstance(gameId!));

  // useEffect(function processTurnEffect(): void {
  //   async function executeProcessTurnEffect() {
  //     console.log('processTurnEffect called');
  //     if (gameManager && gameManager?.countNewTurnsRemaining() > 0) {
  //       const queryClient = useQueryClient();
  //       const newGamePlayState = gameManager?.processNewTurn();
  //       queryClient.setQueryData(['gamePlayState', gameId!], newGamePlayState);
  //       queryClient.invalidateQueries({ queryKey: ['gameDetails', gameId!] });
  //       await delay(animatePlaysDelayInMs);
  //     }
  //   }
  //   executeProcessTurnEffect();
  // }, [gameManager?.countNewTurnsRemaining]);

  // const getGameClientStateQuery = useClientBoardAndGameData(server, gameId!)
  const getGameClientStateQuery = useGetGameClientStateQuery(gameManager, gameId!);
  // useUpdateGameClientStateQuery(gameManager, gameId!);
  const gamePlayersQuery = useGamePlayersQuery(server, gameId!);

  const startGameMutation = useStartGameMutation(gameManager);
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

  /** Callback function called when a user clicks in a dropCell to drop
   * a game piece in a specific column.
   */
  const dropPiece = useCallback(async (colIndex: number) => {
    await gameManager.dropPiece(colIndex);
    queryClient.invalidateQueries({ queryKey: ['getGameClientState', gameId] });
  }, []);

  if (getGameClientStateQuery.isPending || gamePlayersQuery.isPending) return (<LoadingSpinner />);

  if (getGameClientStateQuery.error || gamePlayersQuery.error) return (<div>'A TanStack error has occurred ...'</div>);

  const gameData = getGameClientStateQuery.data.game.gameData;

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
        boardState={getGameClientStateQuery.data.clientBoard}
        gamePlayers={gamePlayersQuery.data}
        dropPiece={dropPiece}>
      </GameBoard>
    </div>
  );
}