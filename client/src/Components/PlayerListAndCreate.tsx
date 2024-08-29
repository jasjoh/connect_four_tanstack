import React from "react";
import { useState, useCallback } from "react";

import * as C4Server from "../server";
import { usePlayersQuery, useCreatePlayerMutation, useDeletePlayerMutation } from "../hooks";

import { PlayerList } from "./PlayerList";
import { PlayerCreateForm } from "./PlayerCreateForm";
import { LoadingSpinner } from "./LoadingSpinner";

/** Displays the list of existing players and a form to create a new player
 *
 * Props:
 *  - None
 *
 * State:
 * - server: The singleton instance of the Server to use
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

  const [server, setServer] = useState<C4Server.Server>(C4Server.Server.getInstance());

  const playersQuery = usePlayersQuery(server);

  const createPlayerMutation = useCreatePlayerMutation(server);
  const deletePlayerMutation = useDeletePlayerMutation(server);

  /**
   * Callback function for when a user clicks on a DELETE button to delete a player
   * Calls deletePlayerMutation.mutate() with the playerId provided in the callback
   */
  const deletePlayer = useCallback(async (playerId: string) => {
    await deletePlayerMutation.mutateAsync(playerId);
  }, []);

  /**
   * Callback function for when a user clicks on a CREATE button to create a player
   * Calls createPlayerMutation.mutate() with the NewPlayer data provided in the callback
   */
  const createPlayer = useCallback(async (newPlayerData: C4Server.NewPlayer) => {
    await createPlayerMutation.mutateAsync(newPlayerData);
  }, []);

  if (playersQuery.isPending) return (<LoadingSpinner />);

  if (playersQuery.error) return (<div>'An unexpected error has occurred ...'</div>);

  return (
    <div className="PlayerListAndCreate">
      <PlayerCreateForm createPlayer={createPlayer} />
      <PlayerList action={deletePlayer} playerList={playersQuery.data} actionType={'deletePlayer'} />
    </div>
  );
}