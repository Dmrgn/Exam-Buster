import { useEffect, useRef, useState } from "react"

interface LazyVideoProps {
    src: string
    className?: string
    poster?: string
}

export function LazyVideo({ src, className = "", poster }: LazyVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        // Load video when it comes into view
                        if (!isLoaded) {
                            video.load()
                            setIsLoaded(true)
                        }
                    } else {
                        setIsInView(false)
                        // Pause video when out of view to save resources
                        video.pause()
                    }
                })
            },
            {
                threshold: 0.1, // Trigger when 10% of video is visible
                rootMargin: "50px", // Start loading 50px before entering viewport
            },
        )

        observer.observe(video)

        return () => {
            observer.disconnect()
        }
    }, [isLoaded])

    const handleMouseEnter = () => {
        const video = videoRef.current
        if (video && isInView && isLoaded) {
            video.play().catch(() => {
                // Handle autoplay restrictions gracefully
                console.log("Autoplay prevented")
            })
        }
    }

    const handleMouseLeave = () => {
        const video = videoRef.current
        if (video) {
            video.pause()
            video.currentTime = 0 // Reset to beginning
        }
    }

    return (
        <video
            ref={videoRef}
            className={className}
            muted
            loop
            playsInline
            preload="none" // Don't preload until needed
            poster={poster}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onLoadedData={() => setIsLoaded(true)}
        >
            <source src={src} type="video/mp4" />
            <source src={src.replace(".mp4", ".webm")} type="video/webm" />
        </video>
    )
}
