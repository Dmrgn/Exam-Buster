import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Login } from "./Login";
import { Register } from "./Register";
import { Error404 } from "./Error404";
import ChatScreen from "./Chat";
import Prep from "./Prep";
import "../../styles/globals.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import LoginLayout from "./LoginLayout";

const elem = document.getElementById("root")!;

createRoot(elem).render(
    <BrowserRouter>
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<Error404 />} />
                <Route path="class/:classId">
                    <Route index element={<App />} />
                    <Route path="prep" element={<Prep />} />
                    <Route path="chat/:chatId">
                        <Route index element={<ChatScreen />} />
                    </Route>
                </Route>
            </Route>
            <Route element={<LoginLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
        </Routes>
    </BrowserRouter>
);
