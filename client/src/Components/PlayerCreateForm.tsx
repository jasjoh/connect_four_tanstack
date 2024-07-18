import React from "react";
import { useState } from "react";
import "./PlayerCreateForm.css"
import { NewPlayer } from "../server";

export interface PlayerCreateFormData {
  ai: boolean;
  color: string;
  name: string;
}

/** A form for creating a new player
 *
 * Props:
 *  - createPlayer(): A callback function for form submission
 *
 * State:
 *  - None
 *
 * PlayerListAndCreate -> PlayerCreateForm */

export function PlayerCreateForm(
  { createPlayer }: { createPlayer: (formData: PlayerCreateFormData) => void }
) : JSX.Element {
  // console.log("PlayerCreateForm re-rendered");

  const [formData, setFormData] = useState({
    name: "",
    color: "#3c3c3c",
    ai: false
  });

  // updates the form input as the user types
  function handleChange(evt : React.ChangeEvent) {

      const htmlTarget = evt.target as HTMLFormElement;

      // look at checked if its our checkbox
      if (htmlTarget.name === 'ai') {
        let { name, checked } = htmlTarget;
        setFormData( formData => ({
          ...formData,
          [name]: checked
        }))

      // otherwise user value
      } else {
        let { name, value } = htmlTarget;
        setFormData( formData => ({
          ...formData,
          [name]: value
        }))
      }
  }

  function handleSubmit(evt : React.FormEvent) {
    // console.log("handleSubmit called");
    evt.preventDefault();
    createPlayer(formData as NewPlayer);
  }

  return (
    <div className="PlayerCreateForm">
      <div className="PlayerCreateForm-title">
        Create a New Player
      </div>
      <form onSubmit={ handleSubmit }>
        <div className="PlayerCreateForm-element">
          <label className="PlayerCreateForm-label" htmlFor="playerCreateForm-name">Player Name:</label>
          <input
            className="PlayerCreateForm-inputName"
            id="playerCreateForm-name"
            name="name"
            value={formData.name}
            onChange={handleChange}>
          </input>
        </div>
        <div className="PlayerCreateForm-element">
          <label className="PlayerCreateForm-label" htmlFor="playerCreateForm-color">Color:</label>
          <input
            className="PlayerCreateForm-inputColor"
            type="color"
            id="playerCreateForm-color"
            name="color"
            value={formData.color}
            onChange={handleChange}>
          </input>
        </div>
        <div className="PlayerCreateForm-element">
          <label className="PlayerCreateForm-label" htmlFor="playerCreateForm-ai">Make AI Player:</label>
          <input
            className="PlayerCreateForm-inputCheckBox"
            type="checkbox"
            id="playerCreateForm-ai"
            name="ai"
            value={formData.ai.toString()}
            onChange={handleChange}>
          </input>
        </div>
        <div><button className="PlayerCreateForm-button">Add Player</button></div>
      </form>
    </div>
  );
}