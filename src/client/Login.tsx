import { Card, CardContent } from "@/components/ui/card";
import "../../styles/index.css";
import { LoginForm } from "@/components/app/login-form";

export function Login() {
    return (
        <div className="container mx-auto relative z-10">
            <LoginForm className="" isRegister={false}></LoginForm>
        </div>
    );
}

export default Login;
