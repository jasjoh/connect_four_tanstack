import { Routes, Route, Navigate } from "react-router-dom";
import Main from "./Main.js";
import PlayGame from "./PlayGame.js";
import GameList from "./GameList.js";
import PlayerListAndCreate from "./PlayerListAndCreate.js";
import GameDetails from "./GameDetails.js";

/** Handles all routing of URLs to components (except NavBar)
 *
 * Props:
 *  - none
 *
 * State:
 *  - none
 *
 * App -> BrowserRouter -> RoutesList
 * RoutesList -> PlayGame
 * RoutesList -> GameDetails
 * RoutesList -> Main (GameList / PlayerListAndCreate)
 *
 * */
function RoutesList() {
  return (
    <Routes>
      <Route path="/games/:gameId/play" element={<PlayGame />} />
      <Route path="/games/:gameId" element={<GameDetails />} />
      <Route path="/games" element={<Main subComponent={GameList} />} />
      <Route path="/players" element={<Main subComponent={PlayerListAndCreate} />} />
      <Route path="*" element={<Navigate to="/games" />} />
    </Routes>
  );
}

export default RoutesList;