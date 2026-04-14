import { PROJECTS } from "../constants";
import { PROJECT } from "../types";
import { formatMonthYear } from "../utils/date";

export function getProjects() {
  return [...PROJECTS].sort(sortProjects);
}

export function getFeaturedProjects() {
  return getProjects().slice(0, 3);
}

export function formatDuration(project: PROJECT) {
  const start = formatMonthYear(project.startDate);

  if (project.isOngoing) {
    return `${start} – Present`;
  }

  if (project.endDate) {
    return `${start} – ${formatMonthYear(project.endDate)}`;
  }

  return start;
}

function sortProjects(a: PROJECT, b: PROJECT) {
  if (a.isOngoing && !b.isOngoing) return -1;
  if (!a.isOngoing && b.isOngoing) return 1;

  if (a.isOngoing && b.isOngoing) {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  }

  return new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime();
}

