import { Carousel, CarouselItem, CarouselContent, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { GigCard, type GigCardProps } from "./GigCard";

interface RelatedGigsCarouselProps {
  gigs: GigCardProps[];
}

export function RelatedGigsCarousel({ gigs }: RelatedGigsCarouselProps) {
  return (
    <Carousel className="relative w-full">
      <CarouselContent className="-ml-4">
        {gigs.map((g) => (
          <CarouselItem key={g.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
            <GigCard {...g} variant="compact" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2  z-10"/>
      <CarouselNext className="abslute right-2 z-10"/>
    </Carousel>
  );
}