/**
 * System pages, one per failure this site can actually produce:
 * a missing route (404), a render error (500), and the maintenance flag (503).
 * They only appear when that failure happens; there is no page to browse to.
 * The trace is the little "request log" the page plays back, line by line.
 */

export type Tone = "ok" | "warn" | "bad" | "dim";
export type TraceLine = { text: string; tone?: Tone };
export type Action = "retry" | "home" | "projects" | "contact";

export type Status = {
  code: string;
  name: string;
  title: string;
  body: string;
  trace: TraceLine[];
  actions: Action[];
};

export const NOT_FOUND: Status = {
  code: "404",
  name: "Not found",
  title: "Got lost again?",
  body: "This page doesn't exist, or it moved. Try the tabs above, or head back home.",
  trace: [
    { text: "request received", tone: "ok" },
    { text: "matching routes", tone: "dim" },
    { text: "no route matched", tone: "warn" },
    { text: "answered 404", tone: "bad" },
  ],
  actions: ["home", "projects"],
};

export const SERVER_ERROR: Status = {
  code: "500",
  name: "Server error",
  title: "Something broke on my side.",
  body: "The page hit an error while rendering. It's logged. Trying again usually fixes it.",
  trace: [
    { text: "request received", tone: "ok" },
    { text: "rendering page", tone: "dim" },
    { text: "unhandled exception", tone: "bad" },
    { text: "answered 500", tone: "bad" },
  ],
  actions: ["retry", "home", "contact"],
};

export const NOT_FOUND_DE: Status = {
  code: "404",
  name: "Nicht gefunden",
  title: "Schon wieder verlaufen?",
  body: "Diese Seite gibt es nicht oder sie ist umgezogen. Nutzen Sie die Tabs oben oder gehen Sie zurück zur Startseite.",
  trace: [
    { text: "Anfrage erhalten", tone: "ok" },
    { text: "Routen werden abgeglichen", tone: "dim" },
    { text: "keine Route passt", tone: "warn" },
    { text: "mit 404 geantwortet", tone: "bad" },
  ],
  actions: ["home", "projects"],
};

export const SERVER_ERROR_DE: Status = {
  code: "500",
  name: "Serverfehler",
  title: "Auf meiner Seite ist etwas kaputtgegangen.",
  body: "Beim Rendern der Seite ist ein Fehler aufgetreten. Er ist protokolliert. Ein erneuter Versuch hilft meist.",
  trace: [
    { text: "Anfrage erhalten", tone: "ok" },
    { text: "Seite wird gerendert", tone: "dim" },
    { text: "nicht behandelte Ausnahme", tone: "bad" },
    { text: "mit 500 geantwortet", tone: "bad" },
  ],
  actions: ["retry", "home", "contact"],
};

export const MAINTENANCE: Status = {
  code: "503",
  name: "Maintenance",
  title: "Down for maintenance.",
  body: "I'm updating this site on purpose. Nothing is lost, and it comes back as soon as the work is done.",
  trace: [
    { text: "request received", tone: "ok" },
    { text: "maintenance flag is on", tone: "warn" },
    { text: "serving the holding page", tone: "dim" },
    { text: "answered 503", tone: "bad" },
  ],
  actions: ["retry"],
};
