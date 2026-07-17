// MockReviewSummaryContainer.tsx
"use client";

import { ReviewSummaryBar } from "../theorems/ReviewSummaryBar"; 

export default function MockReviewSummaryContainer() {
  // Mock data setup matching your exact component prop interfaces
  const mockBreakdownData = [
    { stars: 5, count: 96 },
    { stars: 4, count: 18 },
    { stars: 3, count: 4 },
    { stars: 2, count: 1 },
    { stars: 1, count: 1 },
  ];

  return (
    <div className="w-full max-w-md p-6 bg-card rounded-xl border shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
        Seller Rating
      </h3>
      
      <ReviewSummaryBar 
        avgRating={4.8} 
        totalReviews={120} 
        breakdown={mockBreakdownData} 
      />
    </div>
  );
}
