import { RatingInline } from "@/components/axiom/RatingInline";
import { PriceTag } from "@/components/axiom/PriceTag";
import { SellerMiniRow } from "@/components/axiom/SellerMiniRow";
import { EmptyStateWrapper } from "@/components/wrapper/EmptyStateWrapper";
import { OrderStatusTimeline } from "@/components/axiom/OrderStatusTimeline";
import { StatsRow } from "@/components/axiom/StatsRow";
import { CheckCircle2, Clock, Calendar } from "lucide-react";
import { FeatureListItem } from "@/components/axiom/FeatureListItem";
import { PricingSection } from "@/components/wrapper/PricingWrapper";
import { GigsSection } from "@/components/wrapper/GigCardWrapper";
import OrdersPage from "@/components/wrapper/OrderCardWrapper";
import MockUploadContainer from "@/components/wrapper/UploadContainer";
import { EarningsSummary } from "@/components/wrapper/Dashboardsummary";
import MockOrders from "@/components/wrapper/MockTable";
import MockFilterSidebarContainer from "@/components/wrapper/MockFilterSidebarContainer";
import MockSortContainer from "@/components/wrapper/MockSortContainer";
import GalleryDemoPage from "@/components/wrapper/GigGalleryMock";
import MockGigAccordionContainer from "@/components/wrapper/MockGigAccordion";
import MockReviewSummaryContainer from "@/components/wrapper/ReviewSummaryMock";
import MockCarouselContainer from "@/components/wrapper/GigCarouselWrapper";
import ShareDemoPage from "@/components/wrapper/ShareModalWrapper";
import { HeroWrapper } from "@/components/wrapper/HeroWrapper";
import { SearchManager } from "@/components/wrapper/SearchWrapper";
import { TestimonialSection } from "@/components/wrapper/TestimonialWrapper";
import { ProfileNavigation } from "@/components/wrapper/ProfileTabsWrapper";

export default function Home() {

  const normalSteps = [
    { id: "placed", label: "Order Placed", status: "completed" as const, timestamp: "Jul 10, 9:02 AM" },
    { id: "progress", label: "In Progress", status: "current" as const },
    { id: "delivered", label: "Delivered", status: "upcoming" as const },
    { id: "completed", label: "Completed", status: "upcoming" as const },
  ];

  // Fully completed order
  const completedSteps = [
    { id: "placed", label: "Order Placed", status: "completed" as const, timestamp: "Jul 1, 10:14 AM" },
    { id: "progress", label: "In Progress", status: "completed" as const, timestamp: "Jul 2, 3:40 PM" },
    { id: "delivered", label: "Delivered", status: "completed" as const, timestamp: "Jul 5, 11:00 AM" },
    { id: "completed", label: "Completed", status: "completed" as const, timestamp: "Jul 6, 8:22 AM" },
  ];

  // Disputed order (branch off, fewer steps, ends in failed)
  const disputedSteps = [
    { id: "placed", label: "Order Placed", status: "completed" as const, timestamp: "Jul 8, 1:00 PM" },
    { id: "progress", label: "In Progress", status: "completed" as const, timestamp: "Jul 9, 4:15 PM" },
    { id: "disputed", label: "Disputed", status: "failed" as const, timestamp: "Jul 11, 2:30 PM" },
  ];

  return (
    <main className="min-h-screen py-5 flex flex-col items-center gap-1.5 justify-center">
      <h1>I need money more than anything</h1>
      <RatingInline  avgRating={4.34} reviewCount={45} size={"lg"} />
      <PriceTag  price={5000} showFrom={true} size="lg"  />
      <SellerMiniRow  
        avatar="https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/WIN_20260712_16_10_11_Pro.jpg" 
        name="Abdulmalik ahmed" 
        isOnline={true} 
        level={"apex"} 
        compact={true} />
        <ShareDemoPage />
        <HeroWrapper />
        <SearchManager />
        <PricingSection />
        <EarningsSummary />
        {/* <Calender /> */}
        <ProfileNavigation />
        <MockUploadContainer />
        {/* <MockOrders /> */}
        <MockSortContainer />
        <TestimonialSection />
        <MockReviewSummaryContainer />
        {/* <MockCarouselContainer /> */}
        <MockFilterSidebarContainer />
        <GalleryDemoPage />
        <MockGigAccordionContainer />
        <GigsSection 
          url="https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/logo-test.jpg"
          avatar="https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/seller-avatar.webp"/>
        <OrdersPage />
        <FeatureListItem label="Source files included" included={true} />
        <FeatureListItem label="Commercial license" included={false} />
        <EmptyStateWrapper />
        {/* <OrderStatusTimeline steps={normalSteps} variant="line" orientation="horizontal" /> */}
        <OrderStatusTimeline steps={normalSteps} variant="line" orientation="vertical" />
        <OrderStatusTimeline steps={disputedSteps} variant="line" orientation="horizontal" />
        <OrderStatusTimeline steps={disputedSteps} variant="boxes" orientation="horizontal" />
        <OrderStatusTimeline steps={normalSteps} variant="boxes" orientation="vertical" /> 
        <StatsRow
          layout="grid"
          stats={[
            { 
              label: "Orders Completed", 
              value: "152", 
              icon: <CheckCircle2 className="w-5 h-5" /> 
            },
            { 
              label: "Response Time", 
              value: "2 hrs", 
              icon: <Clock className="w-5 h-5" /> 
            },
            { 
              label: "Member Since", 
              value: "Jan 2024", 
              icon: <Calendar className="w-5 h-5" /> 
            },
          ]}
        />
    </main>
  )
}
