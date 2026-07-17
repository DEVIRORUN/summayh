import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ProfileTabsProps {
  tabs: { id: string; label: string; content: ReactNode }[]; // content is ReactNode so the parent page
                                                                // decides what renders in each tab — this
                                                                // component only handles the tab-switching UI
  defaultTab?: string;
}

export function ProfileTabs({ tabs, defaultTab }: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab ?? tabs[0]?.id}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id}>{t.content}</TabsContent>
      ))}
    </Tabs>
  );
}