import { Card, CardContent } from "@/components/ui/card";
import "../../styles/index.css";
import { LoginForm } from "@/components/login-form";

export function Register() {
    return (
        <div className="container mx-auto relative z-10">
            <LoginForm className="" isRegister={true} ></LoginForm>
        </div>
    );
}

export default Register;
