interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}
