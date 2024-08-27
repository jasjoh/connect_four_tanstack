import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import "./App.css";

// import { userContext } from "../contexts";
import { RoutesList } from "./RoutesList";
import { NavBar } from "./NavBar";

const queryClient = new QueryClient();

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
export function App(): JSX.Element {

  return (
    <QueryClientProvider client={queryClient}>
      {/* <userContext.Provider value={null}> */}
        <BrowserRouter>
          <div className="App">
            <NavBar />
            <RoutesList />
            <ReactQueryDevtools initialIsOpen />
          </div>
        </BrowserRouter>
      {/* </userContext.Provider> */}
    </QueryClientProvider>
  );
}
