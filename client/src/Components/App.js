import { BrowserRouter } from "react-router-dom";
import "./App.css";

import RoutesList from "./RoutesList.js";
import NavBar from "./NavBar.js";

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
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <RoutesList />
      </div>
    </BrowserRouter>
  );
}

export default App;
