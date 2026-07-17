import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { GigCard, type GigCardProps } from "./GigCard";

interface FeaturedGigsCarouselProps {
    gigs: GigCardProps[];
}


export function FeaturedGigsCarousel({ gigs }: FeaturedGigsCarouselProps) {
    return (
        <Carousel>
            <CarouselContent>
                {gigs.map((g) => (
                    <CarouselItem key={g.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <GigCard {...g} variant="default"/>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}