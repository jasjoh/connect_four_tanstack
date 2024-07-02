import React from "react";
import { useState, useEffect } from "react";

import * as C4Server from "../server";

import { PlayerList } from "./PlayerList";
import { LoadingSpinner } from "./LoadingSpinner";

import "./AddPlayerToGameModal.css";

interface AddPlayerToGameModalProps {
  isOpen: boolean;
  closeModal: () => void;
  gameId: string;
  gamePlayers: C4Server.GamePlayer[];
  addPlayerToGame: (playerId: string) => void;
}

/** Displays a list of players to add to a game and allows adding them
 *
 * Props:
 *  - isOpen: a flag indicating whether to render content in this modal
 *  - closeModal: a callback function which closes (hides) the modal
 *  - gameId: the gameId to add players to (in order to filter avail players)
 *  - gamePlayers: the list of players that are currently part of the game
 *  - addPlayerToGame(): a callback function which will add a player to the game
 *
 * State:
 *  - availPlayersList: The list of players available to add to a game
 *  - isLoading: A flag to keep track of whether players have been loaded
 *
 * GameDetails -> AddPlayerToGameModal
 * AddPlayerToGameModal -> PlayerList
 *
 * AddPlayerToGameModal -> LoadingSpinner
 * */
export function AddPlayerToGameModal (
  {isOpen, closeModal, gameId, gamePlayers, addPlayerToGame} : AddPlayerToGameModalProps
) : JSX.Element | null {
  // console.log("AddPlayerToGameModal re-rendered");
  // console.log("received gamePlayers:", gamePlayers);

  const [availPlayersList, setAvailPlayersList] = useState<C4Server.Player[]|null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Performs a diff of game players to all players to determine avail players
   * Fetches updated player list on mount and changing of: gameId, modal state and gamePlayers
   * Updates isLoading once finished to force a re-render
   */
  useEffect(function fetchAndFilterPlayerListOnMount() : void {
    async function fetchAndFilterPlayerListings() : Promise<void>{
      // console.log("fetchPlayerListOnMount() called thus component is being re-mounted");
      const server = C4Server.Server.getInstance();
      const playerList = await server.getPlayers();
      // console.log("retrieved playerList:", playerList);
      // console.log("performing player filter");
      const availPlayers = playerList.filter(p => {
        // console.log(`evaluating player: ${p.id} from the list of all players.`);
        const matchedPlayers = gamePlayers.find(gp =>
          {
            // console.log(`comparing player in game ${gp.id} and seeing if it matches that player: ${p.id}`)
            return gp.id === p.id;
          })
        // console.log("matched players:", matchedPlayers);
        return matchedPlayers === undefined;
      })
      // console.log("available players determined to be:", availPlayers);
      setAvailPlayersList(availPlayers);
      setIsLoading(false);
    }

    if (isOpen) {
      fetchAndFilterPlayerListings();
    }
  }, [gameId, isOpen, gamePlayers])

  // used for modal rendering
  if (!isOpen) return null;
  if (isLoading) return ( <LoadingSpinner /> );

  return (
    <div className="AddPlayerToGameModal">
      <div className="AddPlayerToGameModal-overlay">
        <div className="AddPlayerToGameModal-content">
          <PlayerList action={addPlayerToGame} actionType={'addPlayerToGame'} playerList={availPlayersList} />
          <button className="AddPlayerToGameModal-finishButton" onClick={closeModal}>Finished Adding Players</button>
        </div>
      </div>
    </div>
  );
}