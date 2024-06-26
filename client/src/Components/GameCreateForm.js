import { useState } from "react";
import "./GameCreateForm.css"

/** A form for creating a new game
 *
 * Props:
 *  - createGame(): A callback function for form submission
 *
 * State:
 *  - None
 *
 * GameList -> GameCreateForm
 * */

function GameCreateForm({ createGame }) {
  // console.log("GameCreateForm re-rendered");

  const [formData, setFormData] = useState({
    width: 6,
    height: 6,
    ai: false
  });

  // updates the form input as the user types
  function handleChange(evt) {

    // look at checked if its our checkbox
    if (evt.target.name === 'ai') {
      let { name, checked } = evt.target;
      setFormData( formData => ({
        ...formData,
        [name]: checked
      }))

    // otherwise user value
    } else {
      let { name, value } = evt.target;
      setFormData( formData => ({
        ...formData,
        [name]: value
      }))
    }
  }

  // calls the createGame() callback on form submission
  function handleSubmit(evt) {
    // console.log("handleSubmit called");
    evt.preventDefault();
    createGame(formData);
  }

  return (
    <div className="GameCreateForm">
      <form onSubmit={ handleSubmit }>
        <div className="GameCreateForm-title">
          Create a New Game
        </div>
        <div className="GameCreateForm-element">
          <label className="GameCreateForm-label" htmlFor="gameCreateForm-name">Board Width:</label>
          <input
            className="GameCreateForm-input"
            id="gameCreateForm-width"
            name="width"
            value={formData.width}
            onChange={handleChange}>
          </input>
        </div>
        <div className="GameCreateForm-element">
          <label className="GameCreateForm-label" htmlFor="gameCreateForm-name">Board Height:</label>
          <input
            className="GameCreateForm-input"
            id="gameCreateForm-height"
            name="height"
            value={formData.height}
            onChange={handleChange}>
          </input>
        </div>
        <div><button className="GameCreateForm-button">Create</button></div>
      </form>
    </div>
  );
}

export default GameCreateForm;