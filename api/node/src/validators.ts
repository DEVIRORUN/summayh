import schoolsData from "../../../frontend/src/data/schools.json";

type School = { school: string; value: string } 

const ALL_SCHOOLS: School[] = [...schoolsData.edu_ng, ...schoolsData.sch_ng];

const ALLOWED_SCHOOL_DOMAINS = new Set(
  ALL_SCHOOLS.map((s) => s.value.toLowerCase())
)

export const isValidEduEmail = (email: string): boolean => {
    if (!email || !email.includes("@")) return false;

    const domain = email.split("@")[1].toLowerCase();

  return ALLOWED_SCHOOL_DOMAINS.has(domain);
}