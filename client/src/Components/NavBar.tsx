import React from "react";
import { Link } from "react-router-dom";

import "./NavBar.css";

/** Navigation bar with links to view list of games or players
 *
 * Props:
 * - None
 *
 * State:
 * - None
 *
 * App -> BrowserRouter -> NavBar
 */
export function NavBar() : JSX.Element {
  // console.log("NavBar re-rendered");

  return (
    <div className="NavBar">
      <span className="NavBar-link">
        <Link to='/games'>GAME LIST</Link>
      </span>
      <span className="NavBar-link">
        <Link to='/players'>PLAYER LIST</Link>
      </span>
    </div>
  );
}