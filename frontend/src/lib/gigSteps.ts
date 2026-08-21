export type CreationState = "DRAFT_BASICS" | "DRAFT_DESCRIPTION" | "DRAFT_TIERS" | "DRAFT_REQUIREMENTS" | "DRAFT_GALLERY" | "PUBLISH";

export const STEP_ROUTES: Record<CreationState, string> = {
  DRAFT_BASICS: "description",
  DRAFT_DESCRIPTION: "pricing",
  DRAFT_TIERS: "requirements",
  DRAFT_REQUIREMENTS: "gallery",
  DRAFT_GALLERY: "publish",
  PUBLISH: "publish",
}

export const STEP_ORDER = Object.keys(STEP_ROUTES) as CreationState[];