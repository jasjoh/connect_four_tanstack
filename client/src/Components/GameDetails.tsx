import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import * as C4Server from "../server";

import { PlayerList } from "./PlayerList.js";
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

  const [game, setGame] = useState<C4Server.GameAndTurns|null>(null);
  const [gamePlayers, setGamePlayers] = useState<C4Server.GamePlayer[]|null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { gameId } = useParams();
  const navigate = useNavigate();

  /** Fetches the game and its current players from the server on mount
   * and whenever gameId changes then sets appropriate state */
  useEffect(function fetchGameAndPlayersEffect() : void {
    async function fetchGameAndPlayers() : Promise<void> {
      const server = C4Server.Server.getInstance();
      const game = await server.getGame(gameId!);
      // console.log("retrieved game:", game);
      setGame(game);
      const players = await server.getPlayersForGame(gameId!);
      // console.log("retrieved players:", players);
      setGamePlayers(players);
      setIsLoading(false);
    }
    // console.log("fetchGameAndPlayerEffect() called; component re-mounted or gameId changed");
    fetchGameAndPlayers();
  }, [gameId])

  /** Called when a user clicks on a REMOVE button to remove a player from a game
   * Calls ConnectFourServerApi.removePlayerFromGame(), fetches an updated player list
   * and then updates component state to cause a re-render.
   */
  async function removePlayer(playerId: string) : Promise<void> {
    // console.log("removePlayer() called for player ID:", playerId);
    const server = C4Server.Server.getInstance();
    await server.removePlayerFromGame(gameId!, playerId);
    const updatedGamePlayers = await server.getPlayersForGame(gameId!);
    setGamePlayers(updatedGamePlayers);
  }

  /** Called when a user adds a player to a game from the 'add player to game' modal
   * Calls ConnectFourServerApi.addPlayersToGame(), fetches an updated player list
   * and then updates component state to cause a re-render.
   */
  async function addPlayerToGame(playerId : string) : Promise<void> {
    // console.log("addPlayerToGame() called for player ID:", playerId);
    const server = C4Server.Server.getInstance();
    await server.addPlayersToGame(gameId!, [playerId]);
    const updatedGamePlayers = await server.getPlayersForGame(gameId!);
    setGamePlayers(updatedGamePlayers);
  }

  /** Navigates to play a game */
  async function playGame() : Promise<void> {
    // console.log("playGame() called");
    navigate(`/games/${gameId}/play`);
  }

  /** Deletes a game and then navigates back to root / home */
  async function deleteGame() : Promise<void> {
    // console.log("deleteGame() called");
    const server = C4Server.Server.getInstance();
    await server.deleteGame(gameId!);
    navigate(`/`);
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (isLoading) return ( <LoadingSpinner /> );

  return (
    <div className="GameDetails">
      <AddPlayerToGameModal
        isOpen={isModalOpen}
        gameId={gameId!}
        gamePlayers={gamePlayers!}
        closeModal={closeModal}
        addPlayerToGame={addPlayerToGame} />
      <div className="GameDetails-gameDetails">
        <div className="GameDetails-gameDetails-title">Game Details</div>
        <GameDetailsPropertyList gameData={game!.gameData} />
        <div className="GameDetails-buttons">
          <button onClick={playGame} className="GameDetails-gameDetails-button">Play</button>
          <button onClick={deleteGame} className="GameDetails-gameDetails-button">Delete</button>
          <button onClick={openModal} className="GameDetails-gameDetails-button">Add Player</button>
        </div>
      </div>
      <div className="GameDetails-gamePlayers">
        { gamePlayers!.length > 0 ?
        ( <PlayerList playerList={gamePlayers!} action={removePlayer} actionType={'removePlayer'} /> ) :
        ( <div>No Players Added to Game</div> ) }
      </div>
    </div>
  );
}