import React from "react";
import { useState } from "react";
import { AxiosError } from "axios";

import * as C4Server from "../server";

// import "./AccountLoginForm.css";
import { useAuthUserMutation } from "../hooks";

import { LoadingSpinner } from "./LoadingSpinner";

interface AccountLoginFormData {
  username: string;
  password: string;
}

/** A form for creating a new game
 *
 * Props:
 *  - createGame(): A callback function for form submission
 *
 * State:
 *  - None
 *
 * GameList -> AccountLoginForm
 * */

export function AccountLoginForm(): JSX.Element {
  // console.log("AccountLoginForm re-rendered");

  const [server, setServer] = useState<C4Server.Server>(C4Server.Server.getInstance());

  const [formData, setFormData] = useState<AccountLoginFormData>({
    username: '',
    password: ''
  });

  const authUserMutation = useAuthUserMutation(server);

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
  async function handleSubmit(evt: React.FormEvent) {
    // console.log("handleSubmit called");
    evt.preventDefault();
    await authUserMutation.mutateAsync(
        { username: formData.username, password: formData.password }
    );
  }

  if (authUserMutation.isPending) return (<LoadingSpinner />);

  if (authUserMutation.error) {
    if (authUserMutation.error instanceof AxiosError) {

    }
    return (<div>'An unexpected error has occurred ...'</div>);
  }

  return (
    <div className="Common-form">
      <form onSubmit={handleSubmit}>
        <div className="Common-formTitle">
          Please enter your login credentials
        </div>
        <div className="Common-formElement">
          <label className="AccountLoginForm-label" htmlFor="AccountLoginForm-name">Username:</label>
          <input
            className="AccountLoginForm-input"
            id="AccountLoginForm-username"
            name="username"
            value={formData.username}
            onChange={handleChange}>
          </input>
        </div>
        <div className="Common-formElement">
          <label className="AccountLoginForm-label" htmlFor="AccountLoginForm-name">Password:</label>
          <input
            className="AccountLoginForm-input"
            id="AccountLoginForm-password"
            name="password"
            value={formData.password}
            onChange={handleChange}>
          </input>
        </div>
        <div><button className="Common-formButton">Login</button></div>
      </form>
    </div>
  );
}