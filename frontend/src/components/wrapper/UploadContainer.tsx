// MockUploadContainer.tsx
"use client";

import { useState } from "react";
import { DeliverableUplaod } from "@/components/axiom/DeliverableUpload"; 

interface MockFile {
  name: string;
  url: string;
}

export default function MockUploadContainer() {
  // 1. Simulate state to track files returned after "upload"
  const [uploadedFiles, setUploadedFiles] = useState<MockFile[]>([
    { name: "brand_guidelines_v1.pdf", url: "#" },
    { name: "extremely_long_filename_that_will_showcase_the_truncate_class_working_perfectly.zip", url: "#" }
  ]);

  // 2. Mock handler that acts like an API update loop
  const handleUpload = (newFiles: File[]) => {
    const formattedFiles = newFiles.map((file) => ({
      name: file.name,
      url: "#", // Dummy URL placeholder for local UI testing
    }));
    
    setUploadedFiles((prev) => [...prev, ...formattedFiles]);
    console.log("Files received in parent component:", newFiles);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-card rounded-xl shadow-sm border">
      <h2 className="text-sm font-semibold mb-3">Project Deliverables</h2>
      <DeliverableUplaod 
        onUpload={handleUpload} 
        uploadedFiles={uploadedFiles} 
        maxFiles={5} 
      />
    </div>
  );
}
