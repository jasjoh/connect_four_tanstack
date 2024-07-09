import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as C4Server from "../server";

import { PlayerList } from "./PlayerList";
import { AddPlayerToGameModal } from "./AddPlayerToGameModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { GameDetailsPropertyList } from "./GameDetailsPropertyList";

import "./GameDetails.css";

/** Displays the details of a game
 *
 * Props:
 * - None
 *
 * URL Params:
 * - gameId: The ID of the game to display the details of
 *
 * State:
 * - game: The game object
 * - gamePlayers: The players currently part of the game
 * - isModalOpen: Used for managing the 'add players to game' modal
 * - isLoading: Used for keeping track of whether game data is loaded or not
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
export function GameDetails() {
  // console.log("GameDetails re-rendered");

  const [server, setServer] = useState<C4Server.ServerInterface>(C4Server.Server.getInstance());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { gameId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const gameDetailsQuery = useQuery({
    queryKey: ['gameDetails', gameId],
    queryFn: async () => await server.getGame(gameId!)
  })

  const gamePlayersQuery = useQuery({
    queryKey: ['gamePlayers', gameId],
    queryFn: async () => await server.getPlayersForGame(gameId!)
  })

  const removePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => await server.removePlayerFromGame(gameId!, playerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamePlayersQuery', gameId]})
  })

  const addPlayerMutation = useMutation({
    mutationFn: async (playerId: string) => await server.addPlayersToGame(gameId!, [playerId]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamePlayersQuery', gameId]})
  })

  /** Called when a user clicks on a REMOVE button to remove a player from a game
   * Calls ConnectFourServerApi.removePlayerFromGame(), fetches an updated player list
   * and then updates component state to cause a re-render.
   */
  async function removePlayer(playerId: string) : Promise<void> {
    // console.log("removePlayer() called for player ID:", playerId);
    removePlayerMutation.mutate(playerId);
  }

  /** Called when a user adds a player to a game from the 'add player to game' modal
   * Calls ConnectFourServerApi.addPlayersToGame(), fetches an updated player list
   * and then updates component state to cause a re-render.
   */
  async function addPlayerToGame(playerId : string) : Promise<void> {
    // console.log("addPlayerToGame() called for player ID:", playerId);
    addPlayerMutation.mutate(playerId);
  }

  /** Navigates to play a game */
  async function playGame() : Promise<void> {
    // console.log("playGame() called");
    navigate(`/games/${gameId}/play`);
  }

  /** Deletes a game and then navigates back to root / home */
  async function deleteGame() : Promise<void> {
    // console.log("deleteGame() called");
    await server.deleteGame(gameId!);
    navigate(`/`);
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (gamePlayersQuery.isPending || gameDetailsQuery.isPending) return ( 'TanStack Loading ...' );

  if (gamePlayersQuery.error || gameDetailsQuery.error) return ( 'A TanStack error has occurred ...');

  return (
    <div className="GameDetails">
      <AddPlayerToGameModal
        isOpen={isModalOpen}
        gameId={gameId!}
        gamePlayers={gamePlayersQuery.data}
        closeModal={closeModal}
        addPlayerToGame={addPlayerToGame} />
      <div className="GameDetails-gameDetails">
        <div className="GameDetails-gameDetails-title">Game Details</div>
        <GameDetailsPropertyList gameData={gameDetailsQuery.data.gameData} />
        <div className="GameDetails-buttons">
          <button onClick={playGame} className="GameDetails-gameDetails-button">Play</button>
          <button onClick={deleteGame} className="GameDetails-gameDetails-button">Delete</button>
          <button onClick={openModal} className="GameDetails-gameDetails-button">Add Player</button>
        </div>
      </div>
      <div className="GameDetails-gamePlayers">
        { gamePlayersQuery.data.length > 0 ?
        ( <PlayerList playerList={gamePlayersQuery.data} action={removePlayer} actionType={'removePlayer'} /> ) :
        ( <div>No Players Added to Game</div> ) }
      </div>
    </div>
  );
}