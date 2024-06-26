import ConnectFourServerApi from "../server";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./GameDetails.css";

import PlayerList from "./PlayerList.js";
import AddPlayerToGameModal from "./AddPlayerToGameModal.js";
import LoadingSpinner from "./LoadingSpinner.js";
import GameDetailsPropertyList from "./GameDetailsPropertyList.js";

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
  function GameDetails() {
    // console.log("GameDetails re-rendered");

    const [game, setGame] = useState(null);
    const [gamePlayers, setGamePlayers] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { gameId } = useParams();
    const navigate = useNavigate();

    /** Fetches the game and its current players from the server on mount
     * and whenever gameId changes then sets appropriate state */
    useEffect(function fetchGameAndPlayersEffect(){
      async function fetchGameAndPlayers(){
        const game = await ConnectFourServerApi.getGame(gameId);
        // console.log("retrieved game:", game);
        setGame(game);
        const players = await ConnectFourServerApi.getPlayersForGame(gameId);
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
    async function removePlayer(playerId) {
      // console.log("removePlayer() called for player ID:", playerId);
      await ConnectFourServerApi.removePlayerFromGame(gameId, playerId);
      const updatedGamePlayers = await ConnectFourServerApi.getPlayersForGame(gameId);
      setGamePlayers(updatedGamePlayers);
    }

    /** Called when a user adds a player to a game from the 'add player to game' modal
     * Calls ConnectFourServerApi.addPlayersToGame(), fetches an updated player list
     * and then updates component state to cause a re-render.
     */
    async function addPlayerToGame(playerId) {
      // console.log("addPlayerToGame() called for player ID:", playerId);
      await ConnectFourServerApi.addPlayersToGame(gameId, [playerId]);
      const updatedGamePlayers = await ConnectFourServerApi.getPlayersForGame(gameId);
      setGamePlayers(updatedGamePlayers);
    }

    /** Navigates to play a game */
    async function playGame() {
      // console.log("playGame() called");
      navigate(`/games/${gameId}/play`);
    }

    /** Deletes a game and then navigates back to root / home */
    async function deleteGame() {
      // console.log("deleteGame() called");
      await ConnectFourServerApi.deleteGame(gameId);
      navigate(`/`);
    }

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    if (isLoading) return ( <LoadingSpinner /> );

    return (
      <div className="GameDetails">
        <AddPlayerToGameModal
          isOpen={isModalOpen}
          gameId={gameId}
          gamePlayers={gamePlayers}
          closeModal={closeModal}
          addPlayerToGame={addPlayerToGame} />
        <div className="GameDetails-gameDetails">
          <div className="GameDetails-gameDetails-title">Game Details</div>
          <GameDetailsPropertyList gameData={game.gameData} />
          <div className="GameDetails-buttons">
            <button onClick={playGame} className="GameDetails-gameDetails-button">Play</button>
            <button onClick={deleteGame} className="GameDetails-gameDetails-button">Delete</button>
            <button onClick={openModal} className="GameDetails-gameDetails-button">Add Player</button>
          </div>
        </div>
        <div className="GameDetails-gamePlayers">
          { gamePlayers.length > 0 ?
          ( <PlayerList playerList={gamePlayers} action={removePlayer} actionType={'removePlayer'} /> ) :
          ( <div>No Players Added to Game</div> ) }
        </div>
      </div>
    );
  }

  export default GameDetails;