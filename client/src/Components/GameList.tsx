import React from "react";
import { useState, useCallback } from "react";
import { useCreateGameMutation, useGameListQuery } from "../hooks";

import * as C4Server from "../server";

import { GameListing } from "./GameListing";
import { GameCreateForm } from "./GameCreateForm";
import { LoadingSpinner } from "./LoadingSpinner";

import "./GameList.css";

/** Displays the list of available games and a form to create a new game
 *
 * Props:
 *  - None
 *
 * State:
 *  - server: The instance of the Server for use in querying server state
 *
 * RoutesList -> Main -> GameList
 *
 * GameList -> GameCreateForm *
 * GameList -> LoadingSpinner
 *  */
export function GameList(): JSX.Element {
  // console.log("GameList re-rendered");

  const [server, setServer] = useState<C4Server.Server>(C4Server.Server.getInstance());

  const gameListQuery = useGameListQuery(server);
  const createGameMutation = useCreateGameMutation(server);

  /**
   * Callback function for when a user clicks button to create a new game
   * Calls createGameMutation.mutate() with provided dimensions
   */
  const createGame = useCallback(async (dimensions: C4Server.NewGameDimensions) => {
    await createGameMutation.mutateAsync(dimensions);
  }, []);

  if (gameListQuery.isPending) return (<LoadingSpinner />);

  if (gameListQuery.error) return (<div>'A TanStack error has occurred ...'</div>);

  return (
    <div className="GameList">
      <GameCreateForm createGame={createGame} />
      <div className="GameList-list">
        <div className="GameList-title">
          Existing Games
        </div>
        <div className="GameList-subTitle">
          Click a Row to View Details, Manage and Play
        </div>
        <table className="GameList-table">
          <thead className="GameList-thead">
            <tr>
              <td className="GameList-td">{`Game ID`}</td>
              <td className="GameList-td">{`Game State`}</td>
              <td className="GameList-td">{`Created On`}</td>
              <td className="GameList-td">{`Total Players`}</td>
            </tr>
          </thead>
          <tbody className="GameList-tbody">
            {gameListQuery.data.map((g, index) => <GameListing
              key={index}
              game={g} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}