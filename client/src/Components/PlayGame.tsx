import React from "react";
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Server } from "../server";
import {
  useClientBoardAndGameData,
  useGamePlayersQuery,
  useStartGameMutation,
  useDeleteGameMutation
} from "../hooks";

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
 * - clientBoardAndGameDataQuery.data.gameData The instance of the clientBoardAndGameDataQuery.data.gameDataassociated with the game being played
 * - renderToggle: A helper state for re-rendering when server-state mutates in the clientBoardAndGameDataQuery.data.gameData *
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
  const [server, setServer] = useState<Server>(Server.getInstance());

  const { gameId } = useParams();
  const navigate = useNavigate();

  const clientBoardAndGameDataQuery = useClientBoardAndGameData(server, gameId!);
  const gamePlayersQuery = useGamePlayersQuery(server, gameId!);

  const startGameMutation = useStartGameMutation(server);
  const deleteGameMutation = useDeleteGameMutation(server);

  /** Called when a user clicks on the start or re-start button
   * Calls the startGameMutation mutate function  */
  async function startGame() : Promise<void> {
    // console.log("startGame() called");
    await startGameMutation.mutateAsync(gameId!);
  }

  /** Called when a user clicks the button to delete the current game
   * Calls the deleteGameMutation mutate function and navigates to root */
  async function deleteGame() : Promise<void> {
    console.log("deleteGame() called");
    await deleteGameMutation.mutateAsync(gameId!);
    console.log("deleteGameMutation finished.");
    navigate(`/`);
    console.log("deleteGame() exiting");
  }

  /** Called when a user clicks the button to manage the players in a game
   * Navigates the user to the GameDetails for the game */
  async function managePlayers() : Promise<void>{
    // console.log("managePlayers() called");
    navigate(`/games/${gameId}`);
  }


  if (clientBoardAndGameDataQuery.isPending || gamePlayersQuery.isPending) return (<LoadingSpinner />);

  if (clientBoardAndGameDataQuery.error || gamePlayersQuery.error) return (<div>'A TanStack error has occurred ...'</div>);

  const gameData = clientBoardAndGameDataQuery.data.gameData;

  const dropPiece = useCallback(async (colIndex: number) => {
    if (gameData.gameState === 1) {
      await server.dropPiece(gameId!, gameData.currPlayerId, colIndex);
    } else {
      console.log("dropPiece called while game in started state");
    }
  },[gameData.gameState]);

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
        boardState={clientBoardAndGameDataQuery.data.clientBoard}
        gamePlayers={gamePlayersQuery.data}
        dropPiece={dropPiece}>
      </GameBoard>
    </div>
  );
}