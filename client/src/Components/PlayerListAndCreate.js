// import "./PlayerListAndCreate.css";

import ConnectFourServerApi from "../server";
import { useState, useEffect } from "react";
import PlayerList from "./PlayerList.js";
import PlayerCreateForm from "./PlayerCreateForm.js";
import LoadingSpinner from "./LoadingSpinner.js";

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
function PlayerListAndCreate() {
  // console.log("PlayerListAndCreate re-rendered");

  const [playerList, setPlayerList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetches the player list from the server on mount
   * Updates state with the list and sets isLoading to false to trigger re-render */
  useEffect(function fetchPlayerListOnMount(){
    async function fetchPlayerListings(){
      // console.log("fetchPlayerListOnMount() called thus component is being re-mounted");
      const playerList = await ConnectFourServerApi.getPlayers();
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
  async function createPlayer(formData) {
    // console.log("PlayerList createPlayer() form called with:", formData);
    await ConnectFourServerApi.createPlayer(formData);
    const updatedPlayerList = await ConnectFourServerApi.getPlayers();
    setPlayerList(updatedPlayerList);
  }

  /** Called when a user clicks the button to delete a player
   * Leverages ConnectFourServerApi to delete the player, fetch the updated
   * list of players and then updates state to trigger a re-render.
   */
  async function deletePlayer(formData) {
    // console.log("PlayerList deletePlayer() form called with:", formData);
    await ConnectFourServerApi.deletePlayer(formData);
    const updatedPlayerList = await ConnectFourServerApi.getPlayers();
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

export default PlayerListAndCreate;