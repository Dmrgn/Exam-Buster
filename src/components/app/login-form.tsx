import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react";
import { pb } from "@/lib/db";
import { getInitialUsage } from "../../lib/subscription"; // Added for initial usage
import { useNavigate } from "react-router-dom"

export function LoginForm({
    className,
    isRegister,
}: { className: string | undefined, isRegister: boolean }) {

    const navigate = useNavigate();
    
    // if already logged in then redirect
    useEffect(()=>{
        if (pb.authStore?.token) {
            navigate("/class/1");
        }
    }, [])

    const [errorMessage, setErrorMessage] = useState();
    async function login(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
            const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
            const authData = await pb.collection("users").authWithPassword(email, password);
            navigate("/class/1");
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    async function register(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
            const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
            const passwordConfirm = (event.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement).value;
            const newUser = await pb
                .collection('users')
                .create({
                    email,
                    password,
                    passwordConfirm,
                });

            // Authenticate the new user
            const authData = await pb.collection("users").authWithPassword(email, password);
            
            // Set default plan and initial usage for the new user
            const defaultPlanId = "j2ty5q282cortmn"; // "pro" plan ID
            const initialUsageData = getInitialUsage();
            await pb.collection('users').update(newUser.id, {
                plan: defaultPlanId,
                usage: initialUsageData
            });
            window.location.replace("/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    return (
        <div className={cn("flex flex-col w-full gap-6 items-center", className)}>
            <Card className="md:min-w-md">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">{isRegister ? 'Register' : 'Login'}</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={isRegister ? register : login}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input name="password" id="password" type="password" required />
                                {isRegister && (
                                    <>
                                        <div className="flex items-center">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        </div>
                                        <Input name="confirmPassword" id="confirmPassword" type="password" required />
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    {isRegister ? 'Register' : 'Login'}
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>
                        {isRegister ? (
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{' '}
                                <a href="/login" className="underline underline-offset-4">
                                    Log in
                                </a>
                            </div>
                        ) : (
                            <div className="mt-4 text-center text-sm">
                                Don't have an account?{' '}
                                <a href="/register" className="underline underline-offset-4">
                                    Register
                                </a>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
