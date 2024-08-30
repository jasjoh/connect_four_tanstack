import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Main } from "./Main";
import { PlayGame } from "./PlayGame";
import { GameList } from "./GameList";
import { PlayerListAndCreate } from "./PlayerListAndCreate";
import { GameDetails } from "./GameDetails";
import { AccountLoginForm } from "./AccountLoginForm";

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
 * RoutesList -> AccountLoginForm
 *
 * */
export function RoutesList(): JSX.Element {
  return (
    <Routes>
      <Route path="/games/:gameId/play" element={<PlayGame />} />
      <Route path="/games/:gameId" element={<GameDetails />} />
      <Route path="/games" element={<Main subComponent={GameList} />} />
      <Route path="/players" element={<Main subComponent={PlayerListAndCreate} />} />
      <Route path="/login" element={<AccountLoginForm />} />
      <Route path="*" element={<Navigate to="/games" />} />
    </Routes>
  );
}