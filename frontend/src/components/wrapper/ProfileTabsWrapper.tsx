import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileNavigation() {
  return (
    <Tabs defaultValue="gigs" className="bg-background p-2 rounded-md">

      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="gigs">Active Gigs</TabsTrigger>
        <TabsTrigger value="reviews">Client Reviews</TabsTrigger>
      </TabsList>
      
      <TabsContent value="gigs" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
          <p>Displaying active freelance services...</p>
        </div>
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-4">
        <div className="space-y-4">
          <p>Displaying historical 5-star feedback...</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
