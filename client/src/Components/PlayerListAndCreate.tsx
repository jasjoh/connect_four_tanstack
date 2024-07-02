import React from "react";

import * as C4Server from "../server";

import { useState, useEffect } from "react";
import { PlayerList } from "./PlayerList";
import { PlayerCreateForm, PlayerCreateFormData } from "./PlayerCreateForm";
import { LoadingSpinner } from "./LoadingSpinner";

/** Displays the list of existing players and a form to create a new player
 *
 * Props:
 *  - None
 *
 * State:
 *  - playerList: The list of all players (whether they are part of games or not)
 *  - isLoading: A flag to keep track of whether games have been loaded
 *
 * RoutesList -> Main -> PlayerListAndCreate
 *
 * PlayerListAndCreate -> PlayerCreateForm
 * PlayerListAndCreate -> PlayerList
 *
 * PlayerListAndCreate -> LoadingSpinner
 * */
export function PlayerListAndCreate() {
  // console.log("PlayerListAndCreate re-rendered");

  const [playerList, setPlayerList] = useState<C4Server.Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetches the player list from the server on mount
   * Updates state with the list and sets isLoading to false to trigger re-render */
  useEffect(function fetchPlayerListOnMount() : void {
    async function fetchPlayerListings() : Promise<void> {
      // console.log("fetchPlayerListOnMount() called thus component is being re-mounted");
      const server = C4Server.Server.getInstance();
      const playerList = await server.getPlayers();
      // console.log("retrieved playerList:", playerList);
      setPlayerList(playerList);
      setIsLoading(false);
    }
    fetchPlayerListings();
  }, [])

  /** Called when a user fills in the form to create a player and clicks add button
   * Leverages ConnectFourServerApi to create the player, fetch the updated
   * list of players and then updates state to trigger a re-render.
   */
  async function createPlayer(formData : PlayerCreateFormData) {
    // console.log("PlayerList createPlayer() form called with:", formData);
    const server = C4Server.Server.getInstance();
    await server.createPlayer(formData);
    const updatedPlayerList = await server.getPlayers();
    setPlayerList(updatedPlayerList);
  }

  /** Called when a user clicks the button to delete a player
   * Leverages ConnectFourServerApi to delete the player, fetch the updated
   * list of players and then updates state to trigger a re-render.
   */
  async function deletePlayer(formData : string) {
    // console.log("PlayerList deletePlayer() form called with:", formData);
    const server = C4Server.Server.getInstance();
    await server.deletePlayer(formData);
    const updatedPlayerList = await server.getPlayers();
    setPlayerList(updatedPlayerList);
  }

  if (isLoading) return ( <LoadingSpinner /> );

  return (
    <div className="PlayerListAndCreate">
      <PlayerCreateForm createPlayer={createPlayer} />
      <PlayerList action={deletePlayer} playerList={playerList} actionType={'deletePlayer'} />
    </div>
  );
}