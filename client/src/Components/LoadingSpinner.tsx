import React from "react";
import { useEffect, useState } from "react";
import { delay } from "../utils";

import "./LoadingSpinner.css"

/** A simple loading spinner to display while awaiting network requests
 *
 * Props:
 *  - None
 *
 * State:
 *  - None
 *
 * The following components all call the LoadingSpinner
 * - GameList
 * - GameDetails
 * - PlayerListAndCreate
 * - PlayGame
 * - AddPlayerToGameModal
 *
 * */
export function LoadingSpinner() : JSX.Element {
  // console.log("LoadingSpinner re-rendered");

  const [extendedLoading, setExtendedLoading] = useState(false);

  useEffect(function startExtendedLoadingTimerOnMount() : void {
    async function startExtendedLoadingTimer() : Promise<void> {
      // console.log("startExtendedLoadingTimerOnMount() called thus component is being re-mounted");
      await delay(5000);
      console.log("delay occurred; setting extended true");
      setExtendedLoading(true);
    }
    startExtendedLoadingTimer();
  }, [])

  console.log("rendering; extendedLoading:", extendedLoading);

  return (
    <div className="LoadingSpinner">
      <div className="LoadingSpinner-spinner"></div>
      { !extendedLoading ?        (
          <div className="LoadingSpinner-text">Loading ...</div> ) :
        ( <div className="LoadingSpinner-text">Extended loading detected - server warming up - please wait 120s and reload page if necessary ...</div> )
      }
    </div>
  );
}