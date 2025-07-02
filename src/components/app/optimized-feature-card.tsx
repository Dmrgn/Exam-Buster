import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LazyVideo } from "./lazy-video"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import type { ReactNode } from "react"

interface OptimizedFeatureCardProps {
    icon: ReactNode
    title: string
    description: string
    videoSrc: string
    videoPoster?: string
}

export function OptimizedFeatureCard({ icon, title, description, videoSrc, videoPoster }: OptimizedFeatureCardProps) {
    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: "100px",
    })

    return (
        <Card
            ref={ref}
            className="bg-secondary-bg border-secondary-bg/60 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 relative overflow-hidden group"
        >
            {/* Only render video when card is in view */}
            {isIntersecting && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                    <LazyVideo src={videoSrc} poster={videoPoster} className="w-full h-full object-cover" />
                </div>
            )}

            <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-accent/15 rounded-lg flex items-center justify-center mb-4">{icon}</div>
                <CardTitle className="text-contrast">{title}</CardTitle>
                <CardDescription className="text-muted-text">{description}</CardDescription>
                <Button variant="ghost" className="mt-4 text-accent hover:text-accent/80 p-0 h-auto font-normal">
                    Watch Demo →
                </Button>
            </CardHeader>
        </Card>
    )
}
