import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";

import { RoutesList } from "./RoutesList";
import { NavBar } from "./NavBar";

/** Parent level component hosting BrowserRouter and
 * for displaying nav bar alongside all components in the RoutesList
 *
 * Props:
 * - None
 *
 * State:
 *  - None
 *
 * App -> BrowserRouter -> NavBar
 * App -> BrowserRouter -> RoutesList
 *  */
export function App() : JSX.Element {
// const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <RoutesList />
      </div>
    </BrowserRouter>
  );
}
