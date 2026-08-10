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
  {
    id: "1",
    name: "Web Dev",
    icon: <Code className="w-6 h-6" />,
    href: "/search?category=web-dev",
  },
  {
    id: "2",
    name: "AI & Automation",
    icon: <Cpu className="w-6 h-6" />,
    href: "/search?category=ai-automation",
  },
  {
    id: "3",
    name: "Data Analytics",
    icon: <BarChart3 className="w-6 h-6" />,
    href: "/search?category=data-analytics",
  },
  {
    id: "4",
    name: "Cybersecurity",
    icon: <Shield className="w-6 h-6" />,
    href: "/search?category=cybersecurity",
  },
  {
    id: "5",
    name: "Cloud & DevOps",
    icon: <Cloud className="w-6 h-6" />,
    href: "/search?category=cloud-devops",
  },
  {
    id: "6",
    name: "SEO",
    icon: <Search className="w-6 h-6" />,
    href: "/search?category=seo",
  },
  {
    id: "7",
    name: "Marketing",
    icon: <Megaphone className="w-6 h-6" />,
    href: "/search?category=marketing",
  },
  {
    id: "8",
    name: "Copywriting",
    icon: <PenTool className="w-6 h-6" />,
    href: "/search?category=copywriting",
  },
  {
    id: "9",
    name: "Video Editing",
    icon: <Video className="w-6 h-6" />,
    href: "/search?category=video-editing",
  },
  {
    id: "10",
    name: "Design",
    icon: <Palette className="w-6 h-6" />,
    href: "/search?category=design",
  },
  {
    id: "11",
    name: "UX/UI Design",
    icon: <Layout className="w-6 h-6" />,
    href: "/search?category=ux-ui-design",
  },
  {
    id: "12",
    name: "Technical Writing",
    icon: <FileText className="w-6 h-6" />,
    href: "/search?category=technical-writing",
  },
  {
    id: "13",
    name: "E-commerce",
    icon: <ShoppingBag className="w-6 h-6" />,
    href: "/search?category=ecommerce",
  },
  {
    id: "14",
    name: "Social Media",
    icon: <Share2 className="w-6 h-6" />,
    href: "/search?category=social-media",
  },
  {
    id: "15",
    name: "Content Writing",
    icon: <NotebookPen className="w-6 h-6" />,
    href: "/search?category=content-writing",
  },
];

const howItWorksSteps = [
  {
    icon: <Code className={iconClass} />,
    title: "Post of find a gig",
    description: "Browse gigs or post what you need done.",
  },
  {
    icon: <ShieldCheck className={iconClass} />,
    title: "Pay securely",
    description: "Funds are held in escrow until you approve delivery..",
  },
  {
    icon: <Wallet className={iconClass} />,
    title: "Get it done",
    description: "Receive your work and release payment to the seller.",
  },
];

const trustBadges = [
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: "Secure escrow payments.",
  },
  { icon: <Wallet className="w-4 h-4" />, label: "Verified sellers." },
  { icon: <Headphones className="w-4 h-4" />, label: "24/7 support." },
];

export default async function HomePage() {
  const { trendingCategory, testimonials } = await getHomepageData();

  return (
    <main className="flex flex-col gap-16 pb-16">
      <HeroSearchHandler />

      <section className="px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-4">Browse categories</h2>
        <CategoryGrid variant="inline" categories={categories} /> {/* trendingCategory */}
      </section>

      <section className="px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-8 text-center">
          How SUMMAYH works
        </h2>
        <HowItWorksSteps steps={howItWorksSteps} /> {/* trendingCategory */}
      </section>

      <section className="px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-8 text-center">What people are saying</h2>
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} quote={t.quote} author={t.author}/>
        ))}
      </section>

      <TrustBadgesRow badges={trustBadges} />
    </main>
  );
}
