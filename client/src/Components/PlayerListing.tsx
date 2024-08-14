import React from "react";

import "./PlayerListing.css";
import { Player } from "../server";

interface PlayerListingProps {
  player: Player;
  action: ((str: string) => void) | undefined;
  actionType: string | undefined;
}

/** Displays a specific player listing
 *
 * Props:
 *  - action: callback function to call when a user performs the dynamic action
 *  - actionType: the type of dynamic action ('deletePlayer', 'addPlayer', 'removePlayer')
 *  - player: A player object like: *
 *    id: string;
      name: string;
      color: string;
      ai: boolean;
      createdOn: timestamp;

 * State:
 *  - None
 *
 * PlayerList -> PlayerListing
 * */
export function PlayerListing({ player, action, actionType }: PlayerListingProps): JSX.Element {
  // console.log("PlayerListing re-rendered");

  let buttonText = '';

  switch (actionType) {
    case 'deletePlayer':
      buttonText = 'DELETE';
      break;
    case 'removePlayer':
      buttonText = 'REMOVE';
      break;
    case 'addPlayerToGame':
      buttonText = 'ADD TO GAME';
      break;
    default:
      break;
  }

  /** calls the callback function when a user clicks on the button representing
   * the dynamic action associated with this listing
  */
  function buttonClick(): void {
    // console.log(`action button clicked; calling provided action callback`);
    action!(player.id);
  }

  return (
    <tr className="PlayerListing-tr">
      <td className="PlayerListing-td">{`${player.id}`}</td>
      <td className="PlayerListing-td">{`${player.name}`}</td>
      <td className="PlayerListing-td"
        id="PlayerListing-td-color"
        style={{
          backgroundColor: `${player.color}`,
          width: `20px`
        }}
      >{`${player.color}`}</td>
      <td className="PlayerListing-td">{`${player.ai}`}</td>
      <td className="PlayerListing-td">{`${player.createdOn}`}</td>
      {action ?
        (
          <td className="PlayerListing-td-button" onClick={buttonClick}>
            <button>{buttonText}</button>
          </td>
        ) : (
          <td className="PlayerListing-td"></td>
        )
      }
    </tr>
  );
}