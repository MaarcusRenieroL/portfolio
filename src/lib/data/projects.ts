import { PROJECTS } from "../constants";
import { Project } from "../types";
import { formatMonthYear, getSafeTime } from "../utils/date";

export function getProjects() {
  return [...PROJECTS].sort(sortProjects);
}

export function getFeaturedProjects() {
  return getProjects().slice(0, 3);
}

export function formatDuration(project: Project) {
  const start = formatMonthYear(project.startDate);

  if (project.isOngoing) {
    return `${start} – Present`;
  }

  if (project.endDate) {
    return `${start} – ${formatMonthYear(project.endDate)}`;
  }

  return start;
}

function sortProjects(a: Project, b: Project) {
  if (a.isOngoing && !b.isOngoing) return -1;
  if (!a.isOngoing && b.isOngoing) return 1;

  if (a.isOngoing && b.isOngoing) {
    return getSafeTime(b.startDate) - getSafeTime(a.startDate);
  }

  const aTime = getSafeTime(a.endDate ?? a.startDate);
  const bTime = getSafeTime(b.endDate ?? b.startDate);

  return bTime - aTime;
}
