import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, BookOpen, Calculator, FileText, Zap, Infinity } from "lucide-react"
import { OptimizedFeatureCard } from "@/components/app/optimized-feature-card"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <FileText className="w-6 h-6 text-accent" />,
            title: "Smart Flashcards",
            description:
                "Generate adaptive flashcards from theorems, definitions, and complex concepts with spaced repetition",
            videoSrc: "/videos/flashcards-demo.mp4",
            videoPoster: "/images/flashcards-poster.jpg",
        },
        {
            icon: <Calculator className="w-6 h-6 text-accent" />,
            title: "Diagram Labeling",
            description:
                "AI-powered diagram analysis and labeling for geometric proofs, data structures, and statistical plots",
            videoSrc: "/videos/diagrams-demo.mp4",
            videoPoster: "/images/diagrams-poster.jpg",
        },
        {
            icon: <BookOpen className="w-6 h-6 text-accent" />,
            title: "Study Guides",
            description: "Comprehensive study guides tailored to your curriculum with step-by-step breakdowns",
            videoSrc: "/videos/studyguides-demo.mp4",
            videoPoster: "/images/studyguides-poster.jpg",
        },
        {
            icon: <Infinity className="w-6 h-6 text-accent" />,
            title: "Proof Assistant",
            description: "Work through complex mathematical proofs with AI guidance, from epsilon-delta to advanced theorems",
            videoSrc: "/videos/proofs-demo.mp4",
            videoPoster: "/images/proofs-poster.jpg",
        },
        {
            icon: <FileText className="w-6 h-6 text-accent" />,
            title: "LaTeX Editor",
            description: "Built-in LaTeX editor with real-time rendering for mathematical notation and academic writing",
            videoSrc: "/videos/latex-demo.mp4",
            videoPoster: "/images/latex-poster.jpg",
        },
        {
            icon: <Zap className="w-6 h-6 text-accent" />,
            title: "Textbook Integration",
            description:
                "Reference specific sections, theorems, and examples from your textbooks with contextual AI assistance",
            videoSrc: "/videos/textbook-demo.mp4",
            videoPoster: "/images/textbook-poster.jpg",
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b border-secondary-bg/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <span className="text-background font-bold text-lg">δ</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">Delsilon</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-muted-text hover:text-accent transition-colors">
                                Features
                            </a>
                            <a href="#pricing" className="text-muted-text hover:text-accent transition-colors">
                                Pricing
                            </a>
                            <Button
                                variant="outline"
                                className="border-muted-text text-muted-text hover:bg-muted-text hover:text-background bg-transparent"
                                onClick={()=>navigate("/login")}
                            >
                                Sign In
                            </Button>
                            <Button onClick={()=>navigate("/register")} className="bg-accent hover:bg-accent/90 text-background">Get Started</Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">Powered by Cerebras Ultra-Fast AI</Badge>
                        <h1 className="text-5xl md:text-7xl font-bold text-contrast mb-6 leading-tight">
                            Master Math with
                            <span className="text-primary block">AI-Powered Precision</span>
                        </h1>
                        <p className="text-xl text-muted-text mb-8 max-w-3xl mx-auto leading-relaxed">
                            From epsilon-delta proofs to complex algorithms, Delsilon transforms how math, CS, and statistics students
                            learn. Generate flashcards, label diagrams, create study guides, and work through proofs with
                            lightning-fast AI reasoning.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-background px-8 py-3 text-lg">
                                Start Learning Free
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-contrast px-8 py-3 text-lg bg-transparent"
                            >
                                Watch Demo
                            </Button>
                        </div>
                        <div className="flex items-center justify-center space-x-8 text-muted-text">
                            <div className="flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-accent" />
                                <span>100x faster responses</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calculator className="w-5 h-5 text-accent" />
                                <span>LaTeX editor built-in</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <BookOpen className="w-5 h-5 text-accent" />
                                <span>Textbook integration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Optimized Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-bg/40">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-contrast mb-4">Everything You Need to Excel</h2>
                        <p className="text-xl text-muted-text max-w-2xl mx-auto">
                            Comprehensive AI tools designed specifically for rigorous mathematical and computational studies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <OptimizedFeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                videoSrc={feature.videoSrc}
                                videoPoster={feature.videoPoster}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Speed Comparison Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-contrast mb-4">Lightning-Fast AI Reasoning</h2>
                        <p className="text-xl text-muted-text max-w-2xl mx-auto">
                            Powered by ultra-fast inference, get answers in milliseconds, not seconds
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <Card className="bg-secondary-bg border-accent/40 relative overflow-hidden">
                                <CardHeader className="text-center">
                                    <div className="w-16 h-16 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Zap className="w-8 h-8 text-accent" />
                                    </div>
                                    <CardTitle className="text-2xl text-contrast">Delsilon</CardTitle>
                                    <CardDescription className="text-muted-text">Ultra-fast inference engine</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-5xl font-bold text-accent mb-2">0.12s</div>
                                    <p className="text-muted-text mb-4">Average response time</p>
                                    <div className="w-full bg-secondary-bg/60 rounded-full h-3 mb-4">
                                        <div className="bg-accent h-3 rounded-full animate-pulse" style={{ width: "15%" }}></div>
                                    </div>
                                    <Badge className="bg-accent/10 text-accent border-accent/20">100x Faster</Badge>
                                </CardContent>
                            </Card>

                            {/* ChatGPT */}
                            <Card className="bg-secondary-bg border-secondary-bg/60 relative">
                                <CardHeader className="text-center">
                                    <div className="w-16 h-16 bg-muted-text/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calculator className="w-8 h-8 text-muted-text" />
                                    </div>
                                    <CardTitle className="text-2xl text-muted-text">ChatGPT</CardTitle>
                                    <CardDescription className="text-muted-text/70">Standard AI response</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-5xl font-bold text-muted-text mb-2">1.8s</div>
                                    <p className="text-muted-text/70 mb-4">Average response time</p>
                                    <div className="w-full bg-secondary-bg/60 rounded-full h-3 mb-4">
                                        <div className="bg-muted-text/60 h-3 rounded-full" style={{ width: "100%" }}></div>
                                    </div>
                                    <Badge className="bg-muted-text/10 text-muted-text/70 border-muted-text/20">Baseline</Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent mb-2">750ms</div>
                                <p className="text-muted-text">Faster proof generation</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent mb-2">12x</div>
                                <p className="text-muted-text">Quicker LaTeX rendering</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent mb-2">0.08s</div>
                                <p className="text-muted-text">Diagram analysis speed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-bg/40">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-contrast mb-4">Trusted by Students & Educators</h2>
                        <p className="text-xl text-muted-text max-w-2xl mx-auto">
                            See how Delsilon is transforming mathematical learning across top universities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Testimonial 1 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">SM</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Sarah Martinez</h4>
                                        <p className="text-muted-text text-sm">Mathematics Major, MIT</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "The epsilon-delta proof assistant is incredible. What used to take me hours to understand now clicks
                                    in minutes. The step-by-step breakdowns are exactly what I needed for Real Analysis."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>

                        {/* Testimonial 2 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">DK</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Dr. Kevin Liu</h4>
                                        <p className="text-muted-text text-sm">Professor, Stanford CS</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "I've integrated Delsilon into my algorithms course. Students are finally grasping complex proofs and
                                    the LaTeX integration makes their assignments so much cleaner. Game changer."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>

                        {/* Testimonial 3 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">AR</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Alex Rodriguez</h4>
                                        <p className="text-muted-text text-sm">Statistics PhD, UC Berkeley</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "The diagram labeling for statistical plots saved me countless hours on my dissertation. The AI
                                    understands complex statistical concepts better than any tool I've used."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>

                        {/* Testimonial 4 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">EP</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Emma Park</h4>
                                        <p className="text-muted-text text-sm">Computer Science, Carnegie Mellon</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "Delsilon's textbook integration is phenomenal. I can reference specific theorems from Cormen while
                                    working through algorithm proofs. It's like having a TA available 24/7."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>

                        {/* Testimonial 5 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">MJ</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Marcus Johnson</h4>
                                        <p className="text-muted-text text-sm">Applied Math, Caltech</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "The flashcard generation from my differential equations textbook is spot-on. It picks up on the most
                                    important concepts and creates perfect study materials automatically."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>

                        {/* Testimonial 6 */}
                        <Card className="bg-secondary-bg border-secondary-bg/60">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-accent font-bold">LW</span>
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-semibold">Dr. Lisa Wang</h4>
                                        <p className="text-muted-text text-sm">Mathematics Professor, Harvard</p>
                                    </div>
                                </div>
                                <p className="text-muted-text mb-4">
                                    "My students' proof-writing has improved dramatically since using Delsilon. The AI guidance helps them
                                    understand the logical structure without giving away the answers."
                                </p>
                                <div className="flex text-accent">{"★".repeat(5)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-contrast mb-4">Choose Your Learning Path</h2>
                        <p className="text-xl text-muted-text max-w-2xl mx-auto">
                            Flexible plans designed for every stage of your academic journey
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <Card className="bg-secondary-bg border-secondary-bg/60 relative">
                            <CardHeader className="text-center pb-8">
                                <CardTitle className="text-2xl text-contrast">Free</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-contrast">$0</span>
                                    <span className="text-muted-text">/month</span>
                                </div>
                                <CardDescription className="text-muted-text mt-2">Perfect for getting started</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 h-full flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">10 AI queries per day</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Basic flashcard generation</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">LaTeX editor access</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Community support</span>
                                    </div>
                                </div>
                                <Button onClick={()=>navigate("/register")}  className="w-full mt-8 bg-primary hover:bg-primary/90 text-contrast border-0">
                                    Get Started Free
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Student Plan */}
                        <Card className="bg-secondary-bg border-accent/50 relative scale-105 shadow-xl shadow-accent/20">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-accent text-background px-4 py-1">Most Popular</Badge>
                            </div>
                            <CardHeader className="text-center pb-8">
                                <CardTitle className="text-2xl text-contrast">Student</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-contrast">$5</span>
                                    <span className="text-muted-text">/month</span>
                                </div>
                                <CardDescription className="text-muted-text mt-2">Ideal for individual students</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Unlimited AI queries</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Advanced study guides</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Diagram labeling</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Proof assistance</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Textbook integration</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Priority support</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-8 bg-accent hover:bg-accent/90 text-background">Start Student Plan</Button>
                            </CardContent>
                        </Card>

                        {/* Academic Plan */}
                        <Card className="bg-secondary-bg border-secondary-bg/60 relative">
                            <CardHeader className="text-center pb-8">
                                <CardTitle className="text-2xl text-primary">Academic</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-primary">$10</span>
                                    <span className="text-muted-text">/month</span>
                                </div>
                                <CardDescription className="text-muted-text mt-2">For researchers and educators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Everything in Student</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Advanced LaTeX features</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Collaboration tools</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Custom integrations</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">API access</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent" />
                                        <span className="text-contrast">Dedicated support</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-contrast border-0">
                                    Choose Academic
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-bg/40">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold text-contrast mb-6">Ready to Transform Your Studies?</h2>
                        <p className="text-xl text-muted-text mb-8">
                            Join thousands of students already mastering complex mathematics with AI-powered precision
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-background px-8 py-3 text-lg">
                                Start Free Today
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-contrast px-8 py-3 text-lg bg-transparent"
                            >
                                Schedule Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-secondary-bg/30">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <span className="text-background font-bold text-lg">δ</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">Delsilon</span>
                        </div>
                        <div className="flex space-x-6 text-muted-text">
                            <a href="#" className="hover:text-accent transition-colors">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-accent transition-colors">
                                Terms
                            </a>
                            <a href="#" className="hover:text-accent transition-colors">
                                Support
                            </a>
                            <a href="#" className="hover:text-accent transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-secondary-bg/30 text-center text-muted-text">
                        <p>&copy; 2024 Delsilon. Empowering mathematical minds with AI precision.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
