"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "../axiom/ShareModal";


export default function ShareDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-sm items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-md w-full border border-zinc-800 p-6 rounded-xl bg-zinc-900/50 space-y-4 text-center">
        <h2 className="text-lg font-bold">Expert UI/UX Web Design Service</h2>
        <p className="text-sm text-zinc-400">High-quality, responsive web application landing page layouts.</p>
        
        {/* Button that triggers the modal state change */}
        <Button onClick={() => setIsModalOpen(true)} className="w-full">
          Open Share Modal
        </Button>
      </div>

      {/* Mounting the modal component */}
      <ShareModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        url="https://gigs.dev"
        title="Expert UI/UX Web Design Service"
      />
    </div>
  );
}