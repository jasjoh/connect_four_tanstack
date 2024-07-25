import React from "react";
import { useEffect, useState } from "react";
import { delay, delayWithHandle } from "../utils";

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

  useEffect(function startExtendedLoadingTimerOnMount() {
    const delayResult = delayWithHandle(5000);
    async function startExtendedLoadingTimer() : Promise<void> {
      // console.log("startExtendedLoadingTimerOnMount() called thus component is being re-mounted");
      await delayResult.promise;
      console.log("delay() result after awaiting:", delayResult)
      console.log("delay occurred; setting extended true");
      setExtendedLoading(true);
    }
    startExtendedLoadingTimer();
    return () => {
      if (delayResult.timeout !== null) { clearTimeout(delayResult.timeout) }
    }
  }, [])

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