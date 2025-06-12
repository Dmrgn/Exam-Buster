"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { GithubIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pb } from '@/lib/db';
import type { UserRecord, PlanRecord, UserUsage, PlanLimits } from '@/lib/subscription';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

/**
 * Dashboard landing page.
 */
export default function App() {
    if (!localStorage.getItem("pocketbase_auth")) window.location.replace("/login");

    const [user, setUser] = useState<UserRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Ensure the user is authenticated
                if (pb.authStore.isValid) {
                    // Fetch the user record with expanded plan
                    const currentUser = await pb.collection('users').getOne<UserRecord>(pb.authStore.model!.id, {
                        expand: 'plan',
                    });
                    setUser(currentUser);
                } else {
                    // Redirect to login if not authenticated (should be caught by the initial check, but good practice)
                    window.location.replace("/login");
                }
            } catch (err: any) {
                console.error("Failed to fetch user data:", err);
                setError("Failed to load user data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>; // Or a loading spinner component
    }

    if (error) {
        return <div>Error: {error}</div>; // Or an error message component
    }

    if (!user) {
        return <div>User data not available.</div>; // Should not happen if not loading or error
    }

    const usage: UserUsage = user.usage;
    const plan: PlanRecord | undefined = user.expand?.plan;
    const limits: PlanLimits = plan?.limits || {};

    // Data for the chart
    const chartData = [
        { feature: 'Chat', usage: usage.chat || 0, limit: limits.chat || 0 },
        { feature: 'PDF View', usage: usage["pdf view"] || 0, limit: limits["pdf view"] || 0 },
        { feature: 'Image View', usage: usage["image view"] || 0, limit: limits["image view"] || 0 },
        { feature: 'Image Gen', usage: usage["image gen"] || 0, limit: limits["image gen"] || 0 },
        { feature: 'Graphing', usage: usage.graphing || 0, limit: limits.graphing || 0 },
        { feature: 'Exam Buster', usage: usage["exam buster"] || 0, limit: limits["exam buster"] || 0 },
        { feature: 'File Upload (MB)', usage: usage["file upload"] || 0, limit: limits["file upload"] || 0 },
    ].filter(item => item.limit > 0); // Only show features with a defined limit

    const chartConfig = {
        usage: {
            label: 'Usage',
            color: 'hsl(var(--chart-1))',
        },
        limit: {
            label: 'Limit',
            color: 'hsl(var(--chart-2))',
        },
        'PDF View': {
            label: 'PDF View',
            color: 'hsl(var(--chart-3))',
        },
        'Image View': {
            label: 'Image View',
            color: 'hsl(var(--chart-4))',
        },
        'Image Gen': {
            label: 'Image Gen',
            color: 'hsl(var(--chart-5))',
        },
        'Graphing': {
            label: 'Graphing',
            color: 'hsl(var(--chart-6))',
        },
        'Exam Buster': {
            label: 'Exam Buster',
            color: 'hsl(var(--chart-7))',
        },
        'File Upload (MB)': {
            label: 'File Upload (MB)',
            color: 'hsl(var(--chart-8))',
        },
    } satisfies ChartConfig;


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
                            {chartData.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Your Usage</h3>
                                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                        <BarChart accessibilityLayer data={chartData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="feature"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                style={{
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                style={{
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Bar dataKey="usage" fill="var(--color-chart-1)" radius={4} />
                                            <Bar dataKey="limit" fill="var(--color-chart-2)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
