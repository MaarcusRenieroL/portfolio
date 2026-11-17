import { z } from "zod";

/**
 * zod for code that also runs in the browser. Our CSP forbids eval, and zod probes for it
 * (`Function("")`) unless JIT is off, which Chrome records as a CSP violation. Jitless parsing
 * is plenty fast for a form.
 */
z.config({ jitless: true });

export { z };
