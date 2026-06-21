import { WORK_EXPERIENCES } from "../constants";
import { WorkExperience } from "../types";
import { formatMonthYear, getSafeTime } from "../utils/date";

export function getExperiences() {
  return [...WORK_EXPERIENCES].sort((a, b) => {
    if (a.isOngoing && !b.isOngoing) return -1;
    if (!a.isOngoing && b.isOngoing) return 1;

    return getSafeTime(b.startDate) - getSafeTime(a.startDate);
  });
}

export function formatExperienceDuration(experience: WorkExperience) {
  const start = formatMonthYear(experience.startDate);

  if (experience.isOngoing) {
    return `${start} – present`;
  }

  if (experience.endDate) {
    return `${start} – ${formatMonthYear(experience.endDate)}`;
  }

  return start;
}
