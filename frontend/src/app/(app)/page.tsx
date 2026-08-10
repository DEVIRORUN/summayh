export const dynamic = "force-dynamic";

import { HeroSearchHandler } from "@/components/shared/HeroSearchHandler";
import {
  Code,
  Video,
  PenTool,
  Megaphone,
  Music,
  Camera,
  Wallet,
  ShieldCheck,
  Headphones,
  Cpu,
  Cloud,
  Search,
  FileText,
  ShoppingBag,
  NotebookPen,
  BarChart3,
  Shield,
  Palette,
  Layout,
  Share2,
} from "lucide-react";
import { getTrendingCategories } from "@/lib/categories";
import { getTestimonial } from "@/lib/testimonial";
import { CategoryGrid } from "@/components/axiom/Category";
import { HowItWorksSteps } from "@/components/axiom/HowItWorks";
import { TestimonialCard } from "@/components/axiom/TestimonialCard";
import { TrustBadgesRow } from "@/components/axiom/TrustBadgeRow";

async function getHomepageData() {
  try {
    const trendingCategory = await getTrendingCategories();
    const testimonials = await getTestimonial();

    return { trendingCategory, testimonials };
  } catch (error) {
    console.error(error);
    return { trendingCategory: [], testimonials: [] }
  }
}

const iconClass = "w-6 h-6";
// Categories
const categories = [
  { id: "1", name: "Web Dev", icon: <Code className={iconClass} />, href: "/search?category=web-dev" },
  { id: "2", name: "AI & Automation", icon: <Cpu className={iconClass} />, href: "/search?category=ai-automation" },
  { id: "3", name: "Data Analytics", icon: <BarChart3 className={iconClass} />, href: "/search?category=data-analytics" },
  { id: "4", name: "Cybersecurity", icon: <Shield className={iconClass} />, href: "/search?category=cybersecurity" },
  { id: "5", name: "Cloud & DevOps", icon: <Cloud className={iconClass} />, href: "/search?category=cloud-devops" },
  { id: "6", name: "SEO", icon: <Search className={iconClass} />, href: "/search?category=seo" },
  { id: "7", name: "Marketing", icon: <Megaphone className={iconClass} />, href: "/search?category=marketing" },
  { id: "8", name: "Copywriting", icon: <PenTool className={iconClass} />, href: "/search?category=copywriting" },
  { id: "9", name: "Video Editing", icon: <Video className={iconClass} />, href: "/search?category=video-editing" },
  { id: "10", name: "Design", icon: <Palette className={iconClass} />, href: "/search?category=design" },
  { id: "11", name: "UX/UI Design", icon: <Layout className={iconClass} />, href: "/search?category=ux-ui-design" },
  { id: "12", name: "Technical Writing", icon: <FileText className={iconClass} />, href: "/search?category=technical-writing" },
  { id: "13", name: "E-commerce", icon: <ShoppingBag className={iconClass} />, href: "/search?category=ecommerce" },
  { id: "14", name: "Social Media", icon: <Share2 className={iconClass} />, href: "/search?category=social-media" },
  { id: "15", name: "Content Writing", icon: <NotebookPen className={iconClass} />, href: "/search?category=content-writing" },
];

const howItWorksSteps = [
  {
    icon: <Code className={iconClass} />,
    title: "Post or find a gig",
    description: "Browse curated gigs or post custom project requirements.",
  },
  {
    icon: <ShieldCheck className={iconClass} />,
    title: "Pay securely",
    description: "Funds are held safely in escrow until you verify delivery.",
  },
  {
    icon: <Wallet className={iconClass} />,
    title: "Get it done",
    description: "Receive high-quality work and seamlessly release funds.",
  },
]

const trustBadges = [
  {
    icon: <ShieldCheck className="w-4 h-4" />, label: "Secure escrow payments." },
  { icon: <Wallet className="w-4 h-4" />, label: "Verified sellers." },
  { icon: <Headphones className="w-4 h-4" />, label: "24/7 support." },
];

export default async function HomePage() {
  const { testimonials } = await getHomepageData(); // trendignCtegories later

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground flex flex-col gap-16 pb-16">
      <div className="w-full border-b border-border bg-card/30 py-8 sm:py-12">
        <HeroSearchHandler />
      </div>

      {/* Categories Grid Selection */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-xl font-heading font-medium tracking-tight text-foreground">
            Explore top talents and specialized services.
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore top talents and specialized services
          </p>
        </div>
        <div className="w-full min-w-0">
          <CategoryGrid variant="inline" categories={categories} /> {/* trendingCategory */}
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-10">
          <h2 className="text-lg font-heading font-medium tracking-tight text-foreground">
            How SUMMAYH works
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Simple, transparent, and secure from start to finish.
          </p>
        </div>
        <div className="w-full min-w-0">
          <HowItWorksSteps steps={howItWorksSteps} /> {/* trendingCategory */}
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-10">
          <h2 className="text-2xl font-heading font-medium tracking-tight text-foreground">
            What people are saying
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} quote={t.quote} author={t.author}/>
        ))}
        </div>
      </section>

      <section className="w-full border-t border-border pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-w-0">
          <TrustBadgesRow badges={trustBadges} />
        </div>
      </section>
    </main>
  );
}
