import React from "react";
import { useState } from "react";

import { NewGameDimensions } from "../server";

import "./GameCreateForm.css";

interface GameCreateFormData {
  width: string;
  height: string;
}

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

export function GameCreateForm(
  { createGame }: { createGame: (dimensions: NewGameDimensions) => void; }
): JSX.Element {
  // console.log("GameCreateForm re-rendered");

  const [formData, setFormData] = useState<GameCreateFormData>({
    width: '6',
    height: '6'
  });

  // updates the form input as the user types
  function handleChange(evt: React.ChangeEvent) {

    const htmlTarget = evt.target as HTMLFormElement;

    let { name, value } = htmlTarget;
    setFormData(formData => ({
      ...formData,
      [name]: value
    }));
  }

  // calls the createGame() callback on form submission
  function handleSubmit(evt: React.FormEvent) {
    // console.log("handleSubmit called");
    evt.preventDefault();
    createGame({ width: Number(formData.width), height: Number(formData.height) });
  }

  return (
    <div className="GameCreateForm">
      <form onSubmit={handleSubmit}>
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