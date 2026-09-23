"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  HeartPulse,
  Sparkles,
  Calendar,
  MessageCircle,
  ShieldCheck,
  User,
  ArrowRight,
  Clock,
  Star,
  Activity,
  CheckCircle2,
  Phone,
  Droplets,
  Wind,
  Flame,
  ChevronRight,
  Award,
  Users,
  Stethoscope,
  LayoutDashboard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const [activeDosha, setActiveDosha] = useState<"vata" | "pitta" | "kapha">("vata")
  const { isAuthenticated, user } = useAuth()

  // Helper to ensure booking links prompt login first if unauthenticated
  const getBookingHref = (path: string = "/appointments") => {
    if (isAuthenticated) {
      return path
    }
    return `/login?redirect=${encodeURIComponent(path)}`
  }

  const therapies = [
    {
      id: "abhyanga",
      name: "Abhyanga",
      category: "Full Body Rejuvenation",
      duration: "60 mins",
      rating: "4.9",
      description: "Traditional herbal warm oil massage restoring vitality, improving circulation, and balancing nervous system energy.",
      icon: Droplets,
      tag: "Most Popular",
    },
    {
      id: "shirodhara",
      name: "Shirodhara",
      category: "Stress & Mind Relief",
      duration: "45 mins",
      rating: "5.0",
      description: "Continuous stream of medicated oils poured gently on the forehead (ajna chakra) to soothe anxiety, insomnia, and migraines.",
      icon: Sparkles,
      tag: "Deep Relaxation",
    },
    {
      id: "basti",
      name: "Basti Karma",
      category: "Colon & Vata Detox",
      duration: "90 mins",
      rating: "4.8",
      description: "Herbal medicated enema therapy addressing chronic joint issues, digestive toxicity, and holistic internal cleansing.",
      icon: Activity,
      tag: "Core Detox",
    },
    {
      id: "nasya",
      name: "Nasya Therapy",
      category: "ENT & Clarity",
      duration: "30 mins",
      rating: "4.9",
      description: "Therapeutic administration of herbal oils through nasal passages to alleviate sinuses, cervical tension, and mental fog.",
      icon: Wind,
      tag: "Sensory Revival",
    },
    {
      id: "virechana",
      name: "Virechana",
      category: "Pitta Purification",
      duration: "120 mins",
      rating: "4.9",
      description: "Controlled therapeutic purgation cleansing liver, gallbladder, and skin from accumulated metabolic toxins.",
      icon: Flame,
      tag: "Metabolic Reset",
    },
  ]

  const doshaProfiles = {
    vata: {
      name: "Vata (Air & Ether)",
      traits: "Creative, Energetic, Quick-Thinking",
      imbalance: "Dry skin, insomnia, anxiety, joint stiffness, bloating",
      treatment: "Abhyanga with warm sesame oil, Shirodhara, calming herbs & Basti",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300",
    },
    pitta: {
      name: "Pitta (Fire & Water)",
      traits: "Focused, Driven, Sharp Intellect, Strong Digestion",
      imbalance: "Acidity, skin inflammations, irritability, high body heat",
      treatment: "Virechana, cooling coconut oil treatments, Takradhara & herbal detox",
      badgeColor: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300",
    },
    kapha: {
      name: "Kapha (Earth & Water)",
      traits: "Calm, Loving, Strong Stamina, Grounded",
      imbalance: "Sluggishness, sinus congestion, weight gain, low metabolism",
      treatment: "Udwarthanam (dry powder massage), Nasya, stimulating steam therapies",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300",
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Banner */}
      <div className="bg-primary/10 border-b border-primary/20 text-xs sm:text-sm py-2 px-4 text-center text-foreground flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span>Experience Authentic 5,000-Year-Old Vedic Healing & Teleconsultation</span>
        <Link href={getBookingHref("/appointments")} className="underline font-semibold hover:text-primary ml-1 inline-flex items-center">
          Book Session <ChevronRight className="h-3 w-3 inline" />
        </Link>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/60 transition-all">
        <div className="container mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-foreground">VedPulse</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">AyurCare</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Panchakarma & Wellness Platform</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#therapies" className="text-muted-foreground hover:text-primary transition-colors">Therapies</a>
            <a href="#dosha-guide" className="text-muted-foreground hover:text-primary transition-colors">Dosha Guide</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#specialists" className="text-muted-foreground hover:text-primary transition-colors">Our Vaidyas</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link href={user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}>
                <Button variant="ghost" size="sm" className="font-medium text-xs hover:text-primary gap-1.5">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Portal:</span> {user.name.split(" ")[0]}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium hover:text-primary">
                  <User className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}

            <Link href={getBookingHref("/appointments")}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium">
                <Calendar className="h-4 w-4 mr-1.5" />
                Book Consult
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-card/60 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Harmonize Mind, Body & Soul
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Holistic Healing Powered by <span className="text-primary underline decoration-accent/60 decoration-wavy">Panchakarma</span> & Modern Care
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              VedPulse connects you with certified Ayurvedic physicians, personalized detox regimens, real-time therapy scheduling, and dedicated health progress tracking.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href={getBookingHref("/appointments")}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold h-12 px-7 text-base">
                  Book Appointment
                  <Calendar className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10 h-12 px-7 text-base">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  {isAuthenticated ? "Go to Dashboard" : "Sign In / Register"}
                </Button>
              </Link>
              <Link href="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-card hover:bg-accent/40 text-foreground hover:text-primary border-border shadow-xs font-semibold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                  Ask AyurBot Chat
                </Button>
              </Link>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
              <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-xs text-muted-foreground font-medium">Rejuvenation Sessions</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                <div className="text-2xl font-bold text-primary">98.4%</div>
                <div className="text-xs text-muted-foreground font-medium">Patient Relief Rate</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                <div className="text-2xl font-bold text-primary">25+</div>
                <div className="text-xs text-muted-foreground font-medium">Certified Vaidyas</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-xs text-muted-foreground font-medium">Natural Medicated Oils</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Portals Section */}
      <section className="py-12 bg-card/40 border-y border-border/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-foreground">Choose Your Portal</h2>
            <p className="text-sm text-muted-foreground">Direct access tailored for patients and Ayurvedic practitioners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Patient Portal Card */}
            <Card className="hover:border-primary/60 transition-all shadow-sm hover:shadow-md group relative overflow-hidden bg-card">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Patient Portal</CardTitle>
                <CardDescription>
                  Track Panchakarma therapies, view progress charts, upload test reports, and consult your doctor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Daily therapy routine & Diet chart</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Real-time appointment slots & notifications</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Teleconsultation chat with your Vaidya</li>
                </ul>
                <div className="pt-2 flex gap-2">
                  <Link href="/patient/dashboard" className="flex-1">
                    <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                      Open Dashboard
                    </Button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full text-xs">
                      Sign In / Register
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Portal Card */}
            <Card className="hover:border-primary/60 transition-all shadow-sm hover:shadow-md group relative overflow-hidden bg-card">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/15 rounded-full blur-2xl group-hover:bg-secondary/25 transition-all" />
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-secondary/20 text-secondary-foreground flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-6 w-6 text-foreground" />
                </div>
                <CardTitle className="text-xl">Doctor & Vaidya Portal</CardTitle>
                <CardDescription>
                  Manage active consultations, prescribe personalized herbal regimens, and monitor recovery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Patient clinical queue & medical history</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Customizable Panchakarma care plans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Direct teleconsultation & report review</li>
                </ul>
                <div className="pt-2 flex gap-2">
                  <Link href="/doctor/dashboard" className="flex-1">
                    <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                      Doctor Console
                    </Button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full text-xs">
                      Doctor Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Therapies Section */}
      <section id="therapies" className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Authentic Treatments</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Core Panchakarma Therapies</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-lg">
                Time-tested bio-purification procedures engineered to cleanse cellular toxins and re-establish equilibrium.
              </p>
            </div>
            <Link href={getBookingHref("/appointments")} className="mt-4 md:mt-0">
              <Button variant="outline" className="border-primary/40 hover:bg-primary/10">
                View Schedule & Book <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapies.map((therapy) => {
              const IconComp = therapy.icon
              return (
                <Card key={therapy.id} className="hover:shadow-md transition-all hover:border-primary/60 flex flex-col justify-between bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[11px] font-medium bg-accent/40 text-foreground">
                        {therapy.tag}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{therapy.name}</CardTitle>
                    <p className="text-xs text-primary font-medium">{therapy.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{therapy.description}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/70 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{therapy.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">{therapy.rating}</span>
                      </div>
                    </div>
                    <Link href={getBookingHref(`/appointments?therapy=${encodeURIComponent(therapy.name)}`)} className="block pt-1">
                      <Button variant="outline" size="sm" className="w-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                        Book {therapy.name}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Dosha Guide */}
      <section id="dosha-guide" className="py-16 bg-card/60 border-y border-border/70">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Ayurvedic Wisdom</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Discover Your Tridosha Balance</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Select a constitution below to understand common imbalance indicators and suggested restorative therapies.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center gap-2 p-1.5 bg-background rounded-xl border border-border mb-8 shadow-xs">
              {(["vata", "pitta", "kapha"] as const).map((dosha) => (
                <button
                  key={dosha}
                  onClick={() => setActiveDosha(dosha)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeDosha === dosha
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dosha}
                </button>
              ))}
            </div>

            <Card className="border-2 border-primary/30 shadow-md bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-foreground">{doshaProfiles[activeDosha].name}</CardTitle>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${doshaProfiles[activeDosha].badgeColor}`}>
                    Active Dosha Insight
                  </span>
                </div>
                <CardDescription className="text-xs pt-1">
                  <strong>Natural Strengths:</strong> {doshaProfiles[activeDosha].traits}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3.5 rounded-lg bg-background/80 border border-border/80">
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wide block mb-1">
                    Common Signs of Imbalance
                  </span>
                  <p className="text-xs text-muted-foreground">{doshaProfiles[activeDosha].imbalance}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-accent/20 border border-accent/40">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                    Recommended Panchakarma Treatment
                  </span>
                  <p className="text-xs text-foreground font-medium">{doshaProfiles[activeDosha].treatment}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Need a customized prakriti assessment?</span>
                  <Link href="/chat">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                      Consult Vaidya Online
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Simple Process</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Journey to Wellness</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Four streamlined steps to complete cellular rejuvenation and harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-base mb-1.5">Consultation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect with an Ayurvedic physician online or at the center for pulse analysis and health evaluation.
              </p>
            </div>

            <div className="text-center p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-base mb-1.5">Tailored Plan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive a custom Panchakarma itinerary, prescribed herbal concoctions, and a sattvic diet regime.
              </p>
            </div>

            <div className="text-center p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-base mb-1.5">Therapy Sessions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Experience authentic Abhyanga, Shirodhara, and detoxification with certified therapists.
              </p>
            </div>

            <div className="text-center p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-base mb-1.5">Post-Care & Progress</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track long-term vitality, diet adjustments, and recovery insights via your patient dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vaidyas & Specialists */}
      <section id="specialists" className="py-16 bg-card/40 border-t border-border/70">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Expert Practitioners</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Meet Our Senior Vaidyas</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Experienced doctors dedicated to classical Ayurveda and patient-centric healing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6 bg-card hover:border-primary/50 transition-all shadow-xs">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base text-foreground">Dr. Rajesh Sharma</h3>
              <p className="text-xs text-primary font-medium mb-1">Chief Panchakarma Specialist</p>
              <p className="text-xs text-muted-foreground mb-4">BAMS, MD (Ayurveda) • 15+ Yrs Experience</p>
              <Link href={getBookingHref("/appointments?doctor=dr-sharma")}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Book with Dr. Sharma
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-6 bg-card hover:border-primary/50 transition-all shadow-xs">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base text-foreground">Dr. Priya Patel</h3>
              <p className="text-xs text-primary font-medium mb-1">Ayurvedic Physician & Nutritionist</p>
              <p className="text-xs text-muted-foreground mb-4">BAMS, Ph.D. • 12+ Yrs Experience</p>
              <Link href={getBookingHref("/appointments?doctor=dr-patel")}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Book with Dr. Patel
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-6 bg-card hover:border-primary/50 transition-all shadow-xs">
              <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base text-foreground">Dr. Amit Singh</h3>
              <p className="text-xs text-primary font-medium mb-1">Detox & Rejuvenation Specialist</p>
              <p className="text-xs text-muted-foreground mb-4">BAMS • 10+ Yrs Experience</p>
              <Link href={getBookingHref("/appointments?doctor=dr-singh")}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Book with Dr. Singh
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Callout */}
      <section className="py-14 bg-gradient-to-r from-primary/15 via-accent/30 to-primary/15 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Ready to Begin Your Healing Journey?</h2>
          <p className="text-sm text-muted-foreground">
            Schedule an appointment today or consult with our Ayurvedic doctors directly from the portal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href={getBookingHref("/appointments")}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
                <Calendar className="h-4 w-4 mr-2" /> Book a Consultation
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-6 border-primary/40">
                <User className="h-4 w-4 mr-2 text-primary" /> {isAuthenticated ? "Go to Dashboard" : "Sign In / Register"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/80 py-10 mt-auto text-xs text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="font-bold text-base text-foreground">VedPulse</span>
              </div>
              <p className="text-xs leading-relaxed">
                Empowering modern holistic health through authentic Vedic traditions and modern digital management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-[11px]">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href={getBookingHref("/appointments")} className="hover:text-primary transition-colors">Book Appointment</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Patient & Doctor Login</Link></li>
                <li><Link href="/chat" className="hover:text-primary transition-colors">AyurBot Chat</Link></li>
                <li><a href="#therapies" className="hover:text-primary transition-colors">Panchakarma Therapies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-[11px]">Portals</h4>
              <ul className="space-y-2">
                <li><Link href="/patient/dashboard" className="hover:text-primary transition-colors">Patient Dashboard</Link></li>
                <li><Link href="/doctor/dashboard" className="hover:text-primary transition-colors">Doctor Console</Link></li>
                <li><Link href={getBookingHref("/appointments")} className="hover:text-primary transition-colors">Therapy Schedule</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-[11px]">Helpline & Support</h4>
              <p className="text-xs text-muted-foreground mb-2">Available Mon - Sat, 8:00 AM - 8:00 PM</p>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Phone className="h-3.5 w-3.5 text-primary" /> +91 (800) 123-VEDA
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} VedPulse Ayurvedic Care. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-[11px]">Classical Panchakarma Certified</span>
              <span>•</span>
              <span className="text-[11px]">ISO 9001:2015 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
