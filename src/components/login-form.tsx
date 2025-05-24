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
import { useState } from "react";
import { pb } from "@/lib/db";

export function LoginForm({
    className,
    isRegister,
}: { className: string | undefined, isRegister: boolean }) {

    const [errorMessage, setErrorMessage] = useState();
    async function login(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const email = event.currentTarget.elements.email.value;
            const password = event.currentTarget.elements.password.value;
            const authData = await pb.collection("users").authWithPassword(email, password);
            window.location.replace("/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    async function register(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const email = event.currentTarget.elements.email.value;
            const password = event.currentTarget.elements.password.value;
            const passwordConfirm = event.currentTarget.elements.confirmPassword.value;
            const newUser = await pb
                .collection('users')
                .create({
                    email,
                    password,
                    passwordConfirm
                });
            const authData = await pb.collection("users").authWithPassword(email, password);
                window.location.replace("/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card>
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
                                {(() => {
                                    if (isRegister)
                                        return (<>
                                            <div className="flex items-center">
                                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            </div>
                                            <Input name="confirmPassword" id="confirmPassword" type="password" required />
                                        </>)
                                    return <></>;
                                })()}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    {isRegister ? 'Register' : 'Login'}
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>
                        {(() => {
                            if (isRegister)
                                return (<div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <a href="/login" className="underline underline-offset-4">
                                        Log in
                                    </a>
                                </div>)
                            return <div className="mt-4 text-center text-sm">
                                Don't have an account?{" "}
                                <a href="/register" className="underline underline-offset-4">
                                    Register
                                </a>
                            </div>
                        })()
                        }
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
