import React from "react";
import { Player } from "../server.js";

import "./PlayerList.css";

import { PlayerListing } from "./PlayerListing";

interface PlayerListProps {
  playerList: Player[];
  action: ((str: string) => void) | undefined;
  actionType: string | undefined;
}


/** Displays a list of players with a dynamic action based on the context of
 * where the player list is being displayed.
 *
 * Props:
 *  - action: callback function to call when a user performs the dynamic action
 *  - actionType: the type of dynamic action ('deletePlayer', 'addPlayer', 'removePlayer')
 *  - playerList: an array [] of players to display in a list
 *  -- player object like:  *
 *    id: string;
      name: string;
      color: string;
      ai: boolean;
      createdOn: timestamp;
 *
 * State:
 *  - none
 *
 * PlayerListAndCreate -> PlayerList
 *
 * PlayerList -> PlayerListing
 * */
export function PlayerList({ playerList, action, actionType }: PlayerListProps): JSX.Element {
  // console.log("PlayerList re-rendered");

  let titleText = '';
  switch (actionType) {
    case 'removePlayer':
      titleText = 'Game Players';
      break;
    case 'deletePlayer':
      titleText = 'Existing Players';
      break;
    case 'addPlayer':
      titleText = 'Available Players';
      break;
    default:
      titleText = 'Game Players';
      break;
  }

  return (
    <div className="PlayerList">
      <div className="PlayerList-title">
        {titleText}
      </div>
      {/* <div className="PlayerList-subTitle">
        Click a Row to View Details, Manage and Play
      </div> */}
      <table className="PlayerList-table">
        <thead className="PlayerList-thead">
          <tr>
            <td className="PlayerList-td">{`ID`}</td>
            <td className="PlayerList-td">{`Name`}</td>
            <td className="PlayerList-td">{`Color`}</td>
            <td className="PlayerList-td">{`AI Flag`}</td>
            <td className="PlayerList-td">{`Created On`}</td>
            <td className="PlayerList-td"></td>
          </tr>
        </thead>
        <tbody className="PlayerList-tbody">
          {
            playerList.map((p, index) => <PlayerListing
              key={index}
              player={p}
              action={action}
              actionType={actionType} />)
          }
        </tbody>
      </table>
    </div>
  );
}