import "./GameList.css";

import ConnectFourServerApi from "../server";
import { useState, useEffect } from "react";
import GameListing from "./GameListing";
import GameCreateForm from "./GameCreateForm";
import LoadingSpinner from "./LoadingSpinner";

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
function GameList() {
  // console.log("GameList re-rendered");

  const [gameList, setGameList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetches the game list from the server on mount
   * Updates state with the list and sets isLoading to false to trigger re-render */
  useEffect(function fetchGameListOnMount(){
    async function fetchGameListings(){
      // console.log("fetchGameListOnMount() called thus component is being re-mounted");
      const gameList = await ConnectFourServerApi.getGames();
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
  async function createGame(formData) {
    // console.log("GameList createGame() form called with:", formData);
    await ConnectFourServerApi.createGame(formData);
    const updatedGameList = await ConnectFourServerApi.getGames();
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

export default GameList;