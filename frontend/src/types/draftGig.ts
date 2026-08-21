export type CreationState =
  | "DRAFT_BASICS"
  | "DRAFT_DESCRIPTION"
  | "DRAFT_TIERS"
  | "DRAFT_REQUIREMENTS"
  | "DRAFT_GALLERY"
  | "PUBLISH";

export type GigDeliveryMode = "DIGITAL" | "LIVE";
export type TierLabel = "BASIC" | "STANDARD" | "PREMIUM";

export interface DraftGigCategory {
    id: string;
    name: string;
    slug: string;
}

export interface QuantityPricingBand {
    id: string;
    gigTierId: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
    discountPercentage: number;
}

export interface DraftGigTier {
  id: string;
  gigId: string;
  label: TierLabel;
  customName: string | null;
  description: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  sessionLengthMin: number | null;
  breakLengthMin: number | null;
  totalSessions: number | null;
  quantityPricing: QuantityPricingBand[];
}


export interface DraftGigFAQ {
  id: string;
  gigId: string;
  question: string;
  answer: string;
  order: number;
}

export interface DraftGigRequirementTemplate {
  id: string;
  gigId: string;
  question: string;
  inputType: 
    "FREE_TEXT" |
    "MULTIPLE_CHOICE" |
    "FILE_UPLOAD" |
    "YES_NO" ;
  options: string[];
  isRequired: boolean;
  order: number;
}

export interface DraftGig {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  state: "DRAFT" | "ACTIVE" | "PAUSED" | "INACTIVE";
  coverImage: string | null;
  images: string[];
  video: string | null;
  avgRating: number;
  totalReviews: number;
  minPrice: number | null;
  maxPrice: number | null;
  creationState: CreationState;
  deliveryMode: GigDeliveryMode;
  isRookiePeriod: boolean;
  rookieExpiredAt: string | null;

  category: DraftGigCategory;
  tiers: DraftGigTier[];
  gigFAQs: DraftGigFAQ[];
  requirementTemplates: DraftGigRequirementTemplate[];
}