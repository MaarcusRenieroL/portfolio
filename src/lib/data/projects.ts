import { PROJECTS } from "../constants";
import { Project } from "../types";
import { formatMonthYear, getSafeTime } from "../utils/date";

export function getProjects() {
  return [...PROJECTS].sort(sortProjects);
}

export function getFeaturedProjects() {
  return getProjects().filter((project) => project.highlight);
}

export function getProject(id: string) {
  return PROJECTS.find((project) => project.id === id) ?? null;
}

export function getProjectNeighbors(id: string) {
  const projects = getProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: projects[index - 1] ?? null,
    next: projects[index + 1] ?? null,
  };
}

export function formatDuration(project: Project) {
  const start = formatMonthYear(project.startDate);

  if (project.isOngoing) {
    return `${start} – present`;
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
