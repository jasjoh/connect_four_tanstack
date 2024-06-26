import "./Main.css";

/** Handles rendering of game and player lists
 *
 * Props:
 * - component: the sub-component (GameList / PlayerListAndCreate) to render
 *
 * State:
 * - None
 *
 * RoutesList -> Main
 * Main -> GameList
 * Main -> PlayerListAndCreate
 * */
function Main({ subComponent: SubComponent }) {
  // console.log("Main re-rendered");

  return (
    <div className="Main">
      <SubComponent />
    </div>
  );
}

export default Main;