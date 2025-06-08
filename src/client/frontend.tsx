import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Login } from "./Login";
import { Register } from "./Register";
import { Error404 } from "./Error404";
import ChatScreen from "./Chat";
import "../../styles/globals.css";

const elem = document.getElementById("root")!;

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
