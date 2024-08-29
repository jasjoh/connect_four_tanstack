import React from "react";
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import * as C4Server from "../server";

import { PlayerList } from "./PlayerList";
import { AddPlayerToGameModal } from "./AddPlayerToGameModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { GameDetailsPropertyList } from "./GameDetailsPropertyList";

import "./GameDetails.css";
import {
  useGamePlayersQuery,
  useGameDetailsQuery,
  useAddPlayerMutation,
  useRemovePlayerMutation
} from "../hooks";

/** Displays the details of a game
 *
 * Props:
 * - None
 *
 * URL Params:
 * - gameId: The ID of the game to display the details of
 *
 * State:
 * - server: The singleton instance of the Server to use
 * - isModalOpen: Used for managing the 'add players to game' modal
 *
 * GameList -> (navigation) -> GameDetails
 * PlayGame -> (navigation) -> GameDetails
 * /games/:gameId -> GameDetails
 *
 * GameDetails -> (modal) -> AddPlayerToGameModal
 * GameDetails -> GameDetailsPropertyList
 * GameDetails -> PlayerList
 *
 * GameDetails -> LoadingSpinner
 * */
export function GameDetails(): JSX.Element {
  // console.log("GameDetails re-rendered");

  const [server, setServer] = useState<C4Server.Server>(C4Server.Server.getInstance());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { gameId } = useParams();
  const navigate = useNavigate();

  const gameDetails = useGameDetailsQuery(server, gameId!);
  const gamePlayers = useGamePlayersQuery(server, gameId!);

  const removePlayerMutation = useRemovePlayerMutation(server, gameId!);
  const addPlayerMutation = useAddPlayerMutation(server, gameId!);

  /**
   * Callback function for when a user clicks on a REMOVE button to remove a player from a game
   * Calls removePlayerMutation.mutate() on the playerId provided in the callback
   */
  const removePlayer = useCallback(async (playerId: string) => {
    await removePlayerMutation.mutateAsync(playerId);
  }, []);

  /**
   * Callback function for when a user clicks on a ADD button to add a player to a game
   * Calls addPlayerMutation.mutate() on the playerId provided in the callback
   */
  const addPlayerToGame = useCallback(async (playerId: string) => {
    await addPlayerMutation.mutateAsync([playerId]);
  }, []);

  /** Navigates to play a game */
  async function playGame(): Promise<void> {
    // console.log("playGame() called");
    navigate(`/games/${gameId}/play`);
  }

  /** Deletes a game and then navigates back to root / home */
  async function deleteGame(): Promise<void> {
    // console.log("deleteGame() called");
    await server.deleteGame(gameId!);
    navigate(`/`);
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (gamePlayers.isPending || gameDetails.isPending) return (<LoadingSpinner />);

  if (gamePlayers.error || gameDetails.error) return (<div>'An unexpected error has occurred ...'</div>);

  return (
    <div className="GameDetails">
      <AddPlayerToGameModal
        isOpen={isModalOpen}
        gameId={gameId!}
        gamePlayers={gamePlayers.data}
        closeModal={closeModal}
        addPlayerToGame={addPlayerToGame} />
      <div className="Common-form">
        <div className="Common-formTitle">Game Details</div>
        <GameDetailsPropertyList gameData={gameDetails.data.gameData} />
        <div className="GameDetails-buttons">
          <button onClick={playGame} className="Common-formButton">Play</button>
          <button onClick={deleteGame} className="Common-formButton">Delete</button>
          <button onClick={openModal} className="Common-formButton">Add Player</button>
        </div>
      </div>
      <div className="GameDetails-gamePlayers">
        {gamePlayers.data.length > 0 ?
          (<PlayerList playerList={gamePlayers.data} action={removePlayer} actionType={'removePlayer'} />) :
          (<div>No Players Added to Game</div>)}
      </div>
    </div>
  );
}