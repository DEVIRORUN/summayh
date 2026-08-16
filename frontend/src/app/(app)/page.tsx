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
  { id: "cdffe34e-7868-4e48-95c7-55a2b6787058", name: "Logo Design", icon: <Palette className={iconClass} />, href: "/search?category=cdffe34e-7868-4e48-95c7-55a2b6787058" },
  { id: "e5eafa25-44f0-4d43-ac54-7009989fd054", name: "Web Development", icon: <Code className={iconClass} />, href: "/search?category=e5eafa25-44f0-4d43-ac54-7009989fd054" },
  { id: "611ae376-3dcc-4e5e-8748-8388e1c4f0e4", name: "Mobile App Development", icon: <Cpu className={iconClass} />, href: "/search?category=611ae376-3dcc-4e5e-8748-8388e1c4f0e4" },
  { id: "615372ee-881e-4675-be49-849d393aa37e", name: "Video Editing", icon: <Video className={iconClass} />, href: "/search?category=615372ee-881e-4675-be49-849d393aa37e" },
  { id: "9843c71f-b47c-413a-9782-c0bd43cad7ee", name: "Reels Editing", icon: <Video className={iconClass} />, href: "/search?category=9843c71f-b47c-413a-9782-c0bd43cad7ee" },
  { id: "4d609ebc-d60d-45f5-a5fc-19ef828c1590", name: "Anime / AMV Editing", icon: <Video className={iconClass} />, href: "/search?category=4d609ebc-d60d-45f5-a5fc-19ef828c1590" },
  { id: "280a8a86-8337-40d9-b07a-edbb6fa1bb67", name: "Graphics & Design", icon: <Palette className={iconClass} />, href: "/search?category=280a8a86-8337-40d9-b07a-edbb6fa1bb67" },
  { id: "029645f3-c199-434e-a8fc-9d4b8e077bab", name: "Flyer & Poster Design", icon: <Layout className={iconClass} />, href: "/search?category=029645f3-c199-434e-a8fc-9d4b8e077bab" },
  { id: "bbaac0a8-0717-4fac-9e7b-2caa5081ca91", name: "Social Media Graphics", icon: <Share2 className={iconClass} />, href: "/search?category=bbaac0a8-0717-4fac-9e7b-2caa5081ca91" },
  { id: "b841fca6-4d69-4765-ac61-d7f71f536ff1", name: "Article & Blog Writing", icon: <FileText className={iconClass} />, href: "/search?category=b841fca6-4d69-4765-ac61-d7f71f536ff1" },
  { id: "f27122e5-ad31-4f1f-8d02-4f25defc3bd3", name: "Project & Thesis Writing", icon: <NotebookPen className={iconClass} />, href: "/search?category=f27122e5-ad31-4f1f-8d02-4f25defc3bd3" },
  { id: "f07e0c94-7a4c-4ed1-9d83-7b022219a112", name: "Final Year Project Help", icon: <NotebookPen className={iconClass} />, href: "/search?category=f07e0c94-7a4c-4ed1-9d83-7b022219a112" },
  { id: "6c97de73-4642-4eb1-9c1c-7629a87bfb7d", name: "CS / Programming Tutoring", icon: <Code className={iconClass} />, href: "/search?category=6c97de73-4642-4eb1-9c1c-7629a87bfb7d" },
  { id: "4c1b9e70-06bc-4abb-96d7-a88068944836", name: "Chemistry Tutoring", icon: <NotebookPen className={iconClass} />, href: "/search?category=4c1b9e70-06bc-4abb-96d7-a88068944836" },
  { id: "07aca771-03a2-4361-ae5d-f93cc1b44d13", name: "Mathematics Tutoring", icon: <NotebookPen className={iconClass} />, href: "/search?category=07aca771-03a2-4361-ae5d-f93cc1b44d13" },
  { id: "e71ff3ed-77bc-4ac4-89c8-98ebecfe387f", name: "Quran / Islamic Studies", icon: <NotebookPen className={iconClass} />, href: "/search?category=e71ff3ed-77bc-4ac4-89c8-98ebecfe387f" },
  { id: "09f9e5e4-fc21-40e3-85c9-4f3951b32606", name: "Influencer / Brand Promo", icon: <Megaphone className={iconClass} />, href: "/search?category=09f9e5e4-fc21-40e3-85c9-4f3951b32606" },
  { id: "f92fed45-e126-41a1-868d-fb8208274aba", name: "Birthday Cakes", icon: <ShoppingBag className={iconClass} />, href: "/search?category=f92fed45-e126-41a1-868d-fb8208274aba" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card/40 border border-border rounded-lg p-6 sm:p-10">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">New</span>
            <h2 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-foreground">
              Live 1-on-1 sessions, right in your browser
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Book real-time video sessions with sellers for tutoring, code reviews,
              design walkthroughs, and more — no scheduling headaches, no third-party
              apps. Just book a slot and join when it's time.
            </p>
          </div>
          <div className="aspect-video w-full rounded-md bg-muted/50 border border-border flex items-center justify-center">
            {/* placeholder — swap for a screenshot/demo GIF of your live session UI once ready */}
            <span className="text-xs text-muted-foreground">Live session preview</span>
          </div>
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
