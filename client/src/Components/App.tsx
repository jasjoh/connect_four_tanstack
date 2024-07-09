import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import "./App.css";

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
export function App() : JSX.Element {
// const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App">
          <NavBar />
          <RoutesList />
          <ReactQueryDevtools initialIsOpen />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
