import { Card, CardContent } from "@/components/ui/card";
import "../../styles/index.css";

export function Error404() {
    return (
        <div className="container mx-auto p-8 text-center relative z-10">
            <Card className="bg-card/50 backdrop-blur-sm border-muted">
                <CardContent className="pt-6">
                    <h1 className="text-5xl font-bold my-4 leading-tight">Error 404</h1>
                    <p>
                        Page Not Found.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Error404;
