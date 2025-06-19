import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Login } from "./Login";
import { Register } from "./Register";
import { Error404 } from "./Error404";
import ChatScreen from "./Chat";
import Prep from "./Prep";
import "../../styles/globals.css";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app/app-sidebar";

export default function LoginLayout() {
    return (<div className="flex flex-col items-center justify-center w-[98vw]">
        <StrictMode>
            <Outlet />
        </StrictMode>
    </div>)
} 