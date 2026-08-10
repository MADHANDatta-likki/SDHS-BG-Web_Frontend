export type VolunteerStatusTone = "active" | "inactive" | "dropped";

export function volunteerStatusTone(status: string): VolunteerStatusTone {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") return "active";
  if (normalized === "DROPPED") return "dropped";
  return "inactive";
}
