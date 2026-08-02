export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb / Top Bar Skeleton */}
      <div className="h-4 w-48 bg-muted rounded mb-6" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gig Details Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Title */}
          <div className="h-8 w-3/4 bg-muted rounded" />
          
          {/* Seller Minimal Info */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>

          {/* Large Gallery / Image Container */}
          <div className="aspect-video w-full bg-muted rounded-lg" />

          {/* Description Section */}
          <div className="space-y-3 pt-4">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
          </div>
        </div>

        {/* Right Column: Sidebar (GigOrderPanel Skeleton) */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 bg-card space-y-6 shadow-sm">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg h-10" />

            {/* Price & Plan Name */}
            <div className="flex justify-between items-center">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
            </div>

            {/* Short description */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
            </div>

            {/* Delivery / Revisions icons */}
            <div className="flex gap-4">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>

            {/* Order Action Button */}
            <div className="h-11 w-full bg-muted rounded-lg" />
          </div>
        </div>

      </div>
    </div>
  );
}