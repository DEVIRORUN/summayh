import { TestimonialCard } from "@/components/axiom/TestimonialCard";
import { type TestimonialCardProps } from "@/components/axiom/TestimonialCard";

const MOCK_TESTIMONIALS = [
  {
    quote: "Finding skilled Nigerian student designers here saved our startup timeline. The delivery was fast, communicative, and pristine quality.",
    author: {
      name: "Tunde Alabi",
      role: "Tech Founder, Lagos",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171746.png",
    },
  },
  {
    quote: "The video editor I hired from this platform completely revamped our marketing reels. High-tier results at affordable pricing structures.",
    author: {
      name: "Chidi Okafor",
      role: "Creative Director",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171802.png",
    },
  },
  {
    quote: "Super straightforward process. I launched my copywriting needs on a Tuesday evening and had a final converting copy draft in hand by Friday morning.",
    author: {
      name: "Blessing Amadi",
      role: "E-commerce Merchant",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171814.png",
    },
  },
];

export function TestimonialSection() {
  return (
    <section className="w-full py-12 border-t border-zinc-800 bg-zinc-950/30">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trusted by hundreds of teams</h2>
          <p className="text-sm text-muted-foreground">See what clients say about local freelancing talent</p>
        </div>

        {/* Responsive Grid layout containing the individual cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TESTIMONIALS.map((item, index) => (
            <TestimonialCard 
              key={`testimonial-${index}`}
              quote={item.quote}
              author={item.author}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
