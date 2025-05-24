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

const elem = document.getElementById("root")!;
const route = window.location.pathname;
console.log(route);
function Path({route}) {
    switch(route) {
        case "/":
            return <App />
        case "/login":
            return <Login />
        case "/register":
            return <Register />
        default:
            return <Error404 />
    }
}
const app = (
    <StrictMode>
        <Path route={route} ></Path>
    </StrictMode>
);

createRoot(elem).render(app);
