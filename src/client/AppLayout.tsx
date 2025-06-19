import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Login } from "./Login";
import { Register } from "./Register";
import { Error404 } from "./Error404";
import ChatScreen from "./Chat";
import Prep from "./Prep";
import "../../styles/globals.css";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app/app-sidebar";
import { pb } from "@/lib/db";

export default function AppLayout() {
    if (!pb?.authStore?.isValid) window.location.replace(`${window.location.origin}/login`);

    return (<div className="flex flex-col items-center justify-center w-[98vw]">
        <StrictMode>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            {/* <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/">Apps</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        {isEditingName ? (
                                            <Input
                                                value={newChatName}
                                                onChange={handleNameChange}
                                                onBlur={handleNameBlur}
                                                onKeyPress={handleNameKeyPress}
                                                autoFocus
                                                className="h-6 text-base"
                                            />
                                        ) : (
                                            <BreadcrumbPage onClick={handleNameClick} className="cursor-pointer">
                                                {chat ? chat.name : "Loading..."}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb> */}
                        </div>
                    </header>
                    <div className="flex flex-col items-center w-full my-auto z-10">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </StrictMode>
    </div>)
} 