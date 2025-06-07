/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Login } from "./Login";
import { Register } from "./Register";
import { Error404 } from "./Error404";
import ChatScreen from "./Chat";
import "../../styles/globals.css";

const elem = document.getElementById("root")!;

/**
 * Simple client-side router based on window.location.pathname
 */
function Router() {
    const path = window.location.pathname;
    switch (path) {
        case "/login":
            return <Login />;
        case "/register":
            return <Register />;
        case "/chat":
            return <ChatScreen />;
        case "/":
            return <App />;
        default:
            return <Error404 />;
    }
}

createRoot(elem).render(
    <StrictMode>
        <Router />
    </StrictMode>
);
