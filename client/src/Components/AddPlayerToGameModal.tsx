import React from "react";
import { useState } from "react";
import { useAvailableGamePlayersQuery } from "../hooks";

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

/** Modal which displays a list of players to add to a game and allows adding them
 *
 * Props:
 *  - isOpen: a flag indicating whether to render content in this modal
 *  - closeModal: a callback function which closes (hides) the modal
 *  - gameId: the gameId to add players to (in order to filter avail players)
 *  - gamePlayers: the list of players that are currently part of the game
 *  - addPlayerToGame(): a callback function which will add a player to the game
 *
 * State:
 * - server: The singleton instance of the Server to use
 *
 * GameDetails -> AddPlayerToGameModal
 * AddPlayerToGameModal -> PlayerList
 *
 * AddPlayerToGameModal -> LoadingSpinner
 * */
export function AddPlayerToGameModal(
  { isOpen, closeModal, gameId, gamePlayers, addPlayerToGame }: AddPlayerToGameModalProps
): JSX.Element | null {
  // console.log("AddPlayerToGameModal re-rendered");
  // console.log("received gamePlayers:", gamePlayers);

  const [server, setServer] = useState<C4Server.Server>(C4Server.Server.getInstance());

  const availableGamePlayersQuery = useAvailableGamePlayersQuery(server, gameId, gamePlayers);

  // used for modal rendering
  if (!isOpen) return null;

  if (availableGamePlayersQuery.isPending) return (<LoadingSpinner />);

  if (availableGamePlayersQuery.error) return (<div>'A TanStack error has occurred ...'</div>);

  return (
    <div className="AddPlayerToGameModal">
      <div className="AddPlayerToGameModal-overlay">
        <div className="AddPlayerToGameModal-content">
          <PlayerList action={addPlayerToGame} actionType={'addPlayerToGame'} playerList={availableGamePlayersQuery.data} />
          <button className="AddPlayerToGameModal-finishButton" onClick={closeModal}>Finished Adding Players</button>
        </div>
      </div>
    </div>
  );
}