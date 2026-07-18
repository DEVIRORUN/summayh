
const backendUrl = process.env.NODE_API_URL || "http://localhost:3000";

export interface TestimonialData {
    quote: string;
    author: { name: string; avatar: string; role?: string };
    sellerId?: string;
}

export async function getTestimonial(sellerId?: string): Promise<TestimonialData[]> {
    try {
        const url = sellerId
            ?  `${backendUrl}/api/testimonial/${sellerId}`
            :  `${backendUrl}/api/testimonial/featured`;

        const res = await fetch(url, {
            next: { 
                revalidate: 900,
                tags: sellerId ? [`testimonials-summayh-${sellerId}`] : ["testimonials-summayh-featured"]
            }, // no update till 15mins
            
        });

        if (!res.ok) return [];
        const data = await res.json();

        const resolvedData = data?.results || data;
        return (resolvedData || []) as TestimonialData[];
    } catch (error) {
        console.error(sellerId ? `Failed to fetch testimonials for seller ${sellerId} server-side:` : "Failed to fetch testimonials server-side", error);
        return [];
    }
}
        