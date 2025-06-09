"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { GithubIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Dashboard landing page.
 */
export default function App() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='w-full'>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className='flex flex-col items-center w-full my-auto z-10'>
                    <Card className="bg-card/50 backdrop-blur-sm border-muted min-h-[80%] max-w-[1200px] w-[97%]">
                        <CardHeader>
                            <CardTitle>Exam Buster Dashboard</CardTitle>
                            <CardDescription>Use the sidebar to access Prep Plans or AI Chat.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Welcome! Select an option from the sidebar to get started:
                            </p>
                            <ul className="list-disc list-inside mt-2">
                                <li>Prep Plans: Upload assignments and view study plans</li>
                                <li>AI Chat: Interactive chat with AI assistant</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}