
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// import TierFormBlock

interface TierFormData {
  customName?: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
}

const CATEGORIES = [
  { id: "280a8a86-8337-40d9-b07a-edbb6fa1bb67", name: "Graphics & Design" },
  { id: "8c40fa99-78ca-45a4-8601-6644edd057d4", name: "Programming & Tech" },
  { id: "69ab473a-756c-4336-ad47-e48f79a9fb6b", name: "Writing & Translation" },
  { id: "8850e6b0-51f0-4f11-8c18-95562f592cf7", name: "Video & Animation" },
  { id: "0ba4d4df-2d51-41f3-8343-b54f3a430f4a", name: "Digital Marketing" },
  { id: "3750552b-3d63-4e68-bccb-126fc7ef5d0c", name: "Academic Help" },
  { id: "ba507311-894e-4b40-a4fd-69ba4bc8f8a8", name: "Tutoring & Lessons" },
  { id: "cb6b0215-091d-4746-8373-97ae90fe6b82", name: "Data" },
  { id: "081d51cb-1311-427d-837a-12515108c724", name: "Music & Audio" },
  { id: "229eb672-53fd-4f7e-ad00-47fc8f4a75fc", name: "Fashion & Tailoring" },
  { id: "aac89440-f7a8-4e6f-b8a8-0e80480fb9c2", name: "Food & Baking" },
  { id: "ddcbd34f-61ad-4aad-940e-dfc1ecd3ae16", name: "Events & Styling" },
  {
    id: "009ea243-84c7-479f-bd2d-1bfd52b0be3e",
    name: "Home & Campus Services",
  },
  { id: "dfe2e928-6273-4219-92e3-92dde838e776", name: "Photography" },
  {
    id: "485b2ef3-2737-4620-8531-b748ef4459be",
    name: "Social Media Management",
  },
  { id: "2fec3dd2-82df-4379-9b26-5badf5dfa264", name: "Business & Consulting" },
  { id: "cdffe34e-7868-4e48-95c7-55a2b6787058", name: "Logo Design" },
  { id: "029645f3-c199-434e-a8fc-9d4b8e077bab", name: "Flyer & Poster Design" },
  { id: "c731d918-a613-4350-b8e9-ca229356c871", name: "Business Cards" },
  { id: "bbaac0a8-0717-4fac-9e7b-2caa5081ca91", name: "Social Media Graphics" },
  {
    id: "b3051af9-132d-44d8-bfa5-d80a9c3b3e17",
    name: "T-Shirt & Merch Design",
  },
  { id: "01224c06-f87c-44d6-8407-40289baff60f", name: "Book & E-book Covers" },
  { id: "dd215e89-1588-4920-9e1d-a6aaf329c145", name: "Resume / CV Design" },
  { id: "c1b6a868-2f4d-48ce-99ba-824a14214aa2", name: "Presentation Design" },
  { id: "786d9b4d-be45-42a9-aa54-2ccf19b87348", name: "Illustration" },
  { id: "07302ab8-dd2c-452b-87f4-b4418ddb59e1", name: "UI/UX Design" },
  { id: "e5eafa25-44f0-4d43-ac54-7009989fd054", name: "Web Development" },
  {
    id: "611ae376-3dcc-4e5e-8748-8388e1c4f0e4",
    name: "Mobile App Development",
  },
  { id: "1256ea6f-27a8-4c00-86d9-725150859cbd", name: "WordPress" },
  { id: "c3662b70-31ec-4a5e-96f0-fd1c6bb89990", name: "Software Testing & QA" },
  { id: "62d089d3-a43e-4c89-bee9-6ccd3f385b49", name: "Database Design" },
  {
    id: "7c61c5a9-d801-4b48-aec1-38a278abc765",
    name: "AI & Chatbot Development",
  },
  {
    id: "f07e0c94-7a4c-4ed1-9d83-7b022219a112",
    name: "Project / Final Year Project Help",
  },
  {
    id: "8bb4c64e-81c3-40d2-9767-4121850ba63f",
    name: "Tech Support & Troubleshooting",
  },
  {
    id: "b841fca6-4d69-4765-ac61-d7f71f536ff1",
    name: "Article & Blog Writing",
  },
  {
    id: "68859bcf-f1c0-49be-af32-770116392cd7",
    name: "Proofreading & Editing",
  },
  { id: "d2a985c2-fb43-486b-a41e-3b15e3cee858", name: "CV & Resume Writing" },
  { id: "d546e984-a98b-49db-88a7-476e18671ffc", name: "Translation" },
  {
    id: "f962089d-6c9a-4206-86e2-b6f46d51d42e",
    name: "Book Writing & Ghostwriting",
  },
  {
    id: "794591a5-7346-4827-8211-ff467b95a44e",
    name: "Speech & Script Writing",
  },
  { id: "614950c7-32ad-4292-b3ed-efeb6742c31b", name: "Copywriting" },
  { id: "615372ee-881e-4675-be49-849d393aa37e", name: "Video Editing" },
  { id: "4d609ebc-d60d-45f5-a5fc-19ef828c1590", name: "Anime / AMV Editing" },
  {
    id: "9843c71f-b47c-413a-9782-c0bd43cad7ee",
    name: "Short-Form / Reels Editing",
  },
  { id: "b964bf89-233f-4167-bae8-6283c3875ff0", name: "Whiteboard Animation" },
  { id: "f607bc40-761b-41cd-823f-13746ca50385", name: "Intro & Outro Videos" },
  { id: "d35b103f-ca25-40ff-9c18-e2bdbab2c0c7", name: "Motion Graphics" },
  {
    id: "b971206e-55c9-48a4-b941-61bb9c821d29",
    name: "Wedding / Event Video Editing",
  },
  { id: "8cafdac8-1227-43c1-91bd-a5a4bd48a1ae", name: "2D/3D Animation" },
  {
    id: "33e182e1-b51d-4574-bf9c-3fd6d5f9c772",
    name: "Social Media Marketing",
  },
  { id: "4bb92bb3-f55f-4c9d-b8c1-aa1f48879ee5", name: "SEO" },
  { id: "bd5ee96f-0a44-4222-b83b-04ccd2906f62", name: "Content Strategy" },
  {
    id: "09f9e5e4-fc21-40e3-85c9-4f3951b32606",
    name: "Influencer / Brand Promo",
  },
  { id: "7e074cc1-3021-4eb8-92c8-a7b88acfca68", name: "Email Marketing" },
  { id: "fec01cb9-ca5c-437d-937c-957a90df50bd", name: "Assignment Help" },
  {
    id: "f27122e5-ad31-4f1f-8d02-4f25defc3bd3",
    name: "Project & Thesis Writing",
  },
  {
    id: "82c32e4e-b4f2-4435-8d87-d0d33fd24ca4",
    name: "Past Questions & Study Guides",
  },
  { id: "df935113-8d9f-467d-bcaa-da18ccca7f75", name: "Lab Report Writing" },
  {
    id: "b0901c0b-26cd-4c61-9aac-2ef7dd0f5bea",
    name: "Research & Literature Review",
  },
  {
    id: "8f54aced-0692-46cb-b089-3eaecce87907",
    name: "Exam Prep Materials (CBT-style)",
  },
  {
    id: "c85fe37d-d674-41af-82c9-9d8f0b28bf69",
    name: "Statistics & Data Analysis Help",
  },
  { id: "07aca771-03a2-4361-ae5d-f93cc1b44d13", name: "Mathematics Tutoring" },
  { id: "4c1b9e70-06bc-4abb-96d7-a88068944836", name: "Chemistry Tutoring" },
  { id: "ff9c43fd-7c00-4191-b6d3-93b8b61447cc", name: "Physics Tutoring" },
  { id: "38e65e35-4dda-4c49-9750-6f225ded2260", name: "Biology Tutoring" },
  {
    id: "3fdd1d4e-a709-4957-8d39-a0b15ec1be87",
    name: "English Language Tutoring",
  },
  {
    id: "6c97de73-4642-4eb1-9c1c-7629a87bfb7d",
    name: "Computer Science / Programming Tutoring",
  },
  {
    id: "d0b56737-284d-4959-9bd8-f628e9a5213a",
    name: "Economics & Accounting Tutoring",
  },
  {
    id: "b863cb17-fd11-40b8-b4b3-c07c4d29e4b4",
    name: "JAMB / WAEC / NECO Coaching",
  },
  {
    id: "e832d02b-3b55-4063-a610-d1a53ac2caa0",
    name: "Foreign Language Lessons (French, Arabic, etc.)",
  },
  {
    id: "e71ff3ed-77bc-4ac4-89c8-98ebecfe387f",
    name: "Quran / Islamic Studies Tutoring",
  },
  {
    id: "81e7d925-6cf5-4ca6-b162-9ace07cca442",
    name: "Music Lessons (Instrument/Vocal)",
  },
  { id: "324f6731-9854-4697-a6ae-fcb2dc3fc4b4", name: "Data Entry" },
  { id: "e480883b-8f57-40c5-8188-6f46645dd4d1", name: "Data Analysis" },
  { id: "4db26078-1cde-4951-8a37-10703aaa6f9b", name: "Data Visualization" },
  {
    id: "32642be4-d166-4dce-896c-b56287c02f4b",
    name: "Survey & Form Processing",
  },
  { id: "14dbff41-ba42-477b-bbca-5888674f2105", name: "Voice Over" },
  { id: "a68c3611-1959-41d9-b8fb-2b8226ab3d1b", name: "Mixing & Mastering" },
  { id: "e2ac63f4-ea35-4961-a109-16aa967e3c70", name: "Beat Production" },
  { id: "247df638-b965-419d-a349-4523e4c8f2a0", name: "Podcast Editing" },
  { id: "ffcf74eb-36c0-4cfe-905d-7e65ee0ddabc", name: "Live Event DJ / MC" },
  {
    id: "4bf264aa-946c-464e-95f8-aa8942632c8c",
    name: "Custom Tailoring (Native/Ankara)",
  },
  {
    id: "2be951b4-164b-4caf-9b74-c56deb676a73",
    name: "Tailoring (Corporate/Western Wear)",
  },
  { id: "2aead515-4812-42f7-850d-45f90674d7bd", name: "Alterations & Repairs" },
  { id: "395e8b36-1453-4a20-b5f6-e5cb2c0272a7", name: "Embroidery & Beadwork" },
  { id: "a67f81eb-07dc-4025-9a0b-367fe7fae100", name: "Shoemaking & Cobbling" },
  {
    id: "61e5aaa6-e3ff-4da7-b54e-b0285e83e0c7",
    name: "Fashion Design Consultation",
  },
  {
    id: "f92fed45-e126-41a1-868d-fb8208274aba",
    name: "Birthday / Celebration Cakes",
  },
  {
    id: "8d76bc27-3c82-4901-8a88-6157e6a3fa31",
    name: "Cupcakes & Small Chops",
  },
  {
    id: "47ce6d66-7ce0-4833-b995-153438599036",
    name: "Meal Prep & Home Cooking",
  },
  { id: "d8408959-f0c1-4135-a2b6-6388158413d4", name: "Pastries & Snacks" },
  { id: "d2a37df6-8d41-440e-9fdf-4b7ba2211c60", name: "Drinks & Smoothies" },
  { id: "ae5ed628-f752-406d-822a-ebb5f300d122", name: "Catering for Events" },
  { id: "e821e062-75c4-4779-8753-54c23ecf986e", name: "Makeup Artistry" },
  {
    id: "cacb4ba1-632d-4e90-9468-5c94a46801ba",
    name: "Hair Styling & Braiding",
  },
  { id: "7ab5b523-e59f-4eee-8118-6c432f6d0e5d", name: "Nail Tech / Manicure" },
  {
    id: "dacfbe02-d54d-42ef-9e47-deb93a5ec9a7",
    name: "Event Planning & Decoration",
  },
  {
    id: "d386d471-d180-46b9-8b73-5dd333023adf",
    name: "MC / Hype Man Services",
  },
  {
    id: "35da9c8e-2d08-4d16-b525-34365f8f7090",
    name: "Event Photography & Coverage",
  },
  {
    id: "86b8188e-1e5d-440e-af3f-e2dbdef608c7",
    name: "Laundry & Dry Cleaning",
  },
  {
    id: "ceb8bf5e-a5fd-4020-bb88-c60f0e4b62ba",
    name: "Room Cleaning Services",
  },
  {
    id: "5d6783d9-3e7d-462c-a4cd-96c4c880a673",
    name: "Errand Running / Delivery",
  },
  { id: "d4d2dc79-7392-42d8-94a9-00f035ca59a2", name: "Phone & Gadget Repair" },
  { id: "c1c9e670-0ee6-4f6a-acf5-307595ecf69a", name: "Barbing / Haircuts" },
  {
    id: "89cc4587-7a74-436a-9a05-9530d19a9ffe",
    name: "Printing & Photocopy Services",
  },
  { id: "f984057a-3215-4554-8dc1-453f2018396a", name: "Portrait Photography" },
  { id: "f5dfcf08-d9fb-41b1-a564-0ec7f6e897c4", name: "Event Photography" },
  { id: "d550643e-ffea-424b-95b9-06954e4e2443", name: "Product Photography" },
  {
    id: "dcc45794-9e81-465d-ba4b-ad86d4b7a199",
    name: "Photo Editing / Retouching",
  },
  { id: "942d5f34-be80-4d1b-b028-94f97e76647f", name: "Instagram Management" },
  { id: "7ca9ed59-b33b-4d1c-b55c-fe965e8c712f", name: "TikTok Management" },
  {
    id: "8fa46502-16a7-43a1-8900-d3b16472d507",
    name: "YouTube Channel Management",
  },
  {
    id: "1303a2cc-a7df-4ac1-8bb2-39f7ca6bcc1a",
    name: "Content Calendar & Scheduling",
  },
  {
    id: "14c68a4a-20a2-4bfb-9213-76f81d00294a",
    name: "Community / DM Management",
  },
  { id: "453f323a-81b4-4e3c-ad7a-86423626f42a", name: "Business Plan Writing" },
  { id: "9613e87c-2b51-43c4-9593-0727dbd7b854", name: "Pitch Deck Creation" },
  {
    id: "19ec7216-8ddb-44d0-959b-e5cacacc982a",
    name: "Bookkeeping & Accounting",
  },
  {
    id: "60f2c4be-6b63-4ad1-aad4-d30ae08d3295",
    name: "Virtual Assistant Services",
  },
  { id: "5c3235cf-e334-4df4-a6b6-5fcf2d5f8856", name: "Market Research" },
];

function TierFormBlock({
  label,
  data,
  onChange,
  showCustomName = false,
}: {
  label: string;
  data: TierFormData;
  onChange: (field: keyof TierFormData, value: string | number) => void;
  showCustomName?: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <h3 className="font-medium">{label} tier</h3>

      {showCustomName && (
        <Input
          placeholder="Custom name (optional)"
          value={data.customName || ""}
          onChange={(e) => onChange("customName", e.target.value)}
        />
      )}

      <Textarea
        placeholder="What's included in this tier?"
        value={data.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={2}
        required
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Price (₦)</Label>
          <Input
            type="number"
            value={data.price}
            onChange={(e) => onChange("price", Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Delivery (days)</Label>
          <Input
            type="number"
            value={data.deliveryDays}
            onChange={(e) => onChange("deliveryDays", Number(e.target.value))}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Revisons</Label>
          <Input
            type="number"
            value={data.revisionCount}
            onChange={(e) => onChange("revisionCount", Number(e.target.value))}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateGigPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsinput, setTagsInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"DIGITAL" | "LIVE">("DIGITAL");

  // GigTiers
  const [basic, setBasic] = useState<TierFormData>({
    description: "",
    price: 0,
    deliveryDays: 1,
    revisionCount: 1,
  });
  const [standard, setStandard] = useState<TierFormData>({
    description: "",
    price: 0,
    deliveryDays: 1,
    revisionCount: 1,
  });
  const [premium, setPremium] = useState<TierFormData>({
    description: "",
    price: 0,
    deliveryDays: 1,
    revisionCount: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function updateTier(
    setter: React.Dispatch<React.SetStateAction<TierFormData>>,
    field: keyof TierFormData,
    value: string | number,
  ) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    const payload = {
      title,
      description,
      tags: tagsinput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean), //removing white spaces in tags
      categoryId,
      deliveryMode,
      tiers: { basic, standard, premium },
    };

    try {
      const res = await fetch("/api/gig/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "[In Page]: Failed to create gig");
      }

      const {data: gig} = await res.json();
      router.push(`/gigs/${gig.id}`); // frontend url not BE
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "[In Page]: Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-xl font-semibold mb-6">Create a gig</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Tags (comma-separated)</Label>
          <Input
            value={tagsinput}
            onChange={(e) => setTagsInput(e.target.value)}
            required
            placeholder="logo, branding, minimalist"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Delivery Mode</Label>
          <Select value={deliveryMode} onValueChange={(v: "DIGITAL" | "LIVE") => setDeliveryMode(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIGITAL">Recorded / Async Delivery</SelectItem>
              <SelectItem value="LIVE">Live Video Session</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TierFormBlock
          label="Basic"
          data={basic}
          onChange={(field, val) => updateTier(setBasic, field, val)}
        />
        <TierFormBlock
          label="Standard"
          data={standard}
          onChange={(field, val) => updateTier(setStandard, field, val)}
          showCustomName
        />
        <TierFormBlock
          label="Premium"
          data={premium}
          onChange={(field, val) => updateTier(setPremium, field, val)}
          showCustomName
        />

        {error && <span className="text-xs text-red-500">{error}</span>}

        <Button className="cursor-pointer bg-foreground hover:bg-muted-foreground duration-150" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating gig..." : "Create gig"}
        </Button>
      </form>
    </div>
  );
}
