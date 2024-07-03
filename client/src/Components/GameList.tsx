import React from "react";
import { useState, useEffect } from "react";

import * as C4Server from "../server";

import { GameListing } from "./GameListing";
import { GameCreateForm, GameCreateFormData } from "./GameCreateForm";
import { LoadingSpinner } from "./LoadingSpinner";

import "./GameList.css";

/** Displays the list of available games and a form to create a new game
 *
 * Props:
 *  - None
 *
 * State:
 *  - gameList: The list games retrieved from the server
 *  - isLoading: A flag to keep track of whether game data has been loaded
 *
 * RoutesList -> Main -> GameList
 *
 * GameList -> GameCreateForm
 *
 * GameList -> LoadingSpinner
 *  */
export function GameList() : JSX.Element {
  // console.log("GameList re-rendered");

  const [gameList, setGameList] = useState<C4Server.GameSummary[]>([]);
  const [server, setServer] = useState<C4Server.ServerInterface>(C4Server.Server.getInstance());
  const [isLoading, setIsLoading] = useState(true);

  /** Fetches the game list from the server on mount
   * Updates state with the list and sets isLoading to false to trigger re-render */
  useEffect(function fetchGameListOnMount() : void {
    async function fetchGameListings() : Promise<void> {
      // console.log("fetchGameListOnMount() called thus component is being re-mounted");
      const gameList = await server.getGames();
      // console.log("retrieved gameList:", gameList);
      setGameList(gameList);
      setIsLoading(false);
    }
    fetchGameListings();
  }, [])

  /** Called when a user fills in the form to create a game and clicks create
   * Leverages ConnectFourServerApi to create the game, fetch the updated
   * list of games and then updates state to trigger a re-render.
   */
  async function createGame(formData : GameCreateFormData) : Promise<void> {
    // console.log("GameList createGame() form called with:", formData);
    await server.createGame(formData);
    const updatedGameList = await server.getGames();
    setGameList(updatedGameList);
  }

  if (isLoading) return ( <LoadingSpinner /> );

  return (
    <div className="GameList">
      <GameCreateForm createGame={createGame}/>
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
            { gameList.map( (g, index) => <GameListing
              key={index}
              game={g}/>
            ) }
          </tbody>
        </table>
      </div>
    </div>
  );
}