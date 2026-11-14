"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteItem, moveItem, publishItem, saveItem, translateItem } from "../actions";
import { deFields, SPECS } from "~/lib/cms-fields";
import type { Kind } from "~/lib/server/store";
import { FieldInput } from "./fields";
import { ShadcnSelect } from "./shadcn-select";
import {
  ArrowLeftIcon,
  CheckIcon,
  DeviceDesktopIcon,
  DeviceMobileIcon,
  RefreshIcon,
  ExternalLinkIcon,
  TabletIcon,
  EditIcon,
  PlusIcon,
  LayersIcon,
  GripVerticalIcon,
  GlobeIcon,
  FolderIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  SparklesIcon,
  AwardIcon,
  FileTextIcon,
  StickyNoteIcon,
} from "./icons";

export interface CollectionItemSummary {
  key: string;
  title: string;
  live: boolean;
  deleted?: boolean;
}

type Props = {
  kind: Kind;
  keyValue: string | null;
  data: Record<string, unknown>;
  de: Record<string, unknown>;
  machine: boolean;
  live: boolean;
  deleted: boolean;
  collectionItems?: CollectionItemSummary[];
};

type Save = "idle" | "saving" | "saved" | "error";

const BLOCK_TYPES: Array<{
  kind: Kind;
  label: string;
  description: string;
  icon: typeof FolderIcon;
}> = [
  { kind: "project", label: "Project", description: "Featured build, tool, or client delivery", icon: FolderIcon },
  { kind: "role", label: "Work Experience", description: "Company, employment dates, responsibilities", icon: BriefcaseIcon },
  { kind: "education", label: "Education", description: "Degree, university, honours or coursework", icon: GraduationCapIcon },
  { kind: "skillgroup", label: "Skill Group", description: "Category of technical capabilities & tools", icon: SparklesIcon },
  { kind: "certificate", label: "Certificate", description: "Official accreditation, credential, or exam", icon: AwardIcon },
  { kind: "post", label: "Blog Article", description: "Long-form technical article or guide", icon: FileTextIcon },
  { kind: "note", label: "Quick Note", description: "TIL insight, code snippet or reflection", icon: StickyNoteIcon },
];

const matchKindAndKey = (route: string): { kind: Kind; key?: string } | null => {
  const clean = route.replace(/^\/(en|de)(\/|$)/, "/").split("?")[0].split("#")[0];
  const parts = clean.split("/").filter(Boolean);

  if (clean.startsWith("/certifications")) {
    return { kind: "certificate" };
  }
  if (clean.startsWith("/projects")) {
    return { kind: "project", key: parts[1] };
  }
  if (clean.startsWith("/experience")) {
    return { kind: "role" };
  }
  if (clean.startsWith("/skills")) {
    return { kind: "skillgroup" };
  }
  if (clean.startsWith("/blog")) {
    return { kind: "post", key: parts[1] };
  }
  if (clean.startsWith("/notes")) {
    return { kind: "note", key: parts[1] };
  }
  return null;
};

/** Full-screen Drag & Drop Visual Website Builder Studio with Resizable Preview */
export function Editor(p: Props) {
  const spec = SPECS[p.kind];
  const router = useRouter();
  const [data, setData] = useState(p.data);
  const [de, setDe] = useState(p.de);
  const [machine, setMachine] = useState(p.machine);
  const [tab, setTab] = useState<"en" | "de">("en");
  const [sidebarTab, setSidebarTab] = useState<"content" | "add" | "reorder">("content");
  const [save, setSave] = useState<Save>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Resizable Panels State
  const [sidebarWidth, setSidebarWidth] = useState<number>(480);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile" | "custom">("desktop");
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const [isResizingFrame, setIsResizingFrame] = useState(false);

  const previewPaneRef = useRef<HTMLDivElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);

  const key = useRef<string | null>(p.keyValue);
  const [savedKey, setSavedKey] = useState<string | null>(p.keyValue);
  const frame = useRef<HTMLIFrameElement>(null);
  const saved = useRef(JSON.stringify({ d: p.data, e: p.de, m: p.machine }));

  // Reorder items state
  const [itemsList, setItemsList] = useState<CollectionItemSummary[]>(p.collectionItems ?? []);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const initialPreview = spec.preview(String(data[spec.keyField] ?? p.keyValue ?? ""));
  const [previewRoute, setPreviewRoute] = useState(initialPreview);

  // Restore saved sidebar width
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("cms_studio_sidebar_width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= 340 && parsed <= 900) {
          setSidebarWidth(parsed);
        }
      }
    } catch {}
  }, []);

  const reload = useCallback(() => {
    try {
      frame.current?.contentWindow?.location.reload();
    } catch {
      /* cross-origin only if misconfigured */
    }
  }, []);

  const persist = useCallback(async () => {
    setSave("saving");
    const snap = JSON.stringify({ d: data, e: de, m: machine });
    const r = await saveItem(p.kind, key.current, data, de, machine);
    if (r.ok) {
      saved.current = snap;
      setErrors([]);
      setSave("saved");
      if (key.current === null) {
        key.current = r.key;
        setSavedKey(r.key);
        router.replace(`/admin/content/${p.kind}/${encodeURIComponent(r.key)}`);
      }
      reload();
    } else {
      setErrors(r.errors);
      setSave("error");
    }
    return r.ok;
  }, [p.kind, data, de, machine, router, reload]);

  // Autosave 900ms after the last change.
  useEffect(() => {
    if (JSON.stringify({ d: data, e: de, m: machine }) === saved.current) return;
    setSave("idle");
    const t = setTimeout(() => void persist(), 900);
    return () => clearTimeout(t);
  }, [data, de, machine, persist]);

  const setField = (name: string, v: unknown) => setData((d) => ({ ...d, [name]: v }));
  const setDeField = (name: string, v: unknown) => {
    setDe((d) => ({ ...d, [name]: v }));
    setMachine(true);
  };

  async function publish() {
    setBusy(true);
    setInfo("");
    if (!(await persist())) return setBusy(false);
    const r = await publishItem(p.kind, key.current!);
    setBusy(false);
    setInfo(r.ok ? "Published. Visitors see it within moments." : r.errors.join(" "));
    if (r.ok) router.refresh();
  }

  async function translate() {
    setBusy(true);
    setInfo("Translating…");
    const r = await translateItem(p.kind, data);
    setBusy(false);
    if (!r.ok) return setInfo(r.errors.join(" "));
    setDe((d) => ({ ...d, ...r.de }));
    setMachine(true);
    setInfo("Translated by Gemini. Read it before you publish.");
  }

  async function remove(deleted: boolean) {
    if (!key.current) return;
    if (deleted && !confirm("Remove this from the site? You can restore it later.")) return;
    setBusy(true);
    const r = await deleteItem(p.kind, key.current, deleted);
    setBusy(false);
    if (r.ok) router.push(`/admin/content/${p.kind}`);
  }

  const setLang = (lang: "en" | "de") => {
    document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
    reload();
  };

  // Drag and drop reordering
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const next = [...itemsList];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(idx, 0, moved);
    setDraggedIdx(idx);
    setItemsList(next);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    reload();
  };

  const handleMove = async (itemKey: string, dir: -1 | 1) => {
    await moveItem(p.kind, itemKey, dir);
    const idx = itemsList.findIndex((i) => i.key === itemKey);
    if (idx === -1) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= itemsList.length) return;
    const next = [...itemsList];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setItemsList(next);
    reload();
  };

  // Resizable Panels Handlers
  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);

    const onMouseMove = (ev: MouseEvent) => {
      const maxW = Math.max(340, window.innerWidth - 420);
      const newW = Math.max(340, Math.min(maxW, ev.clientX));
      setSidebarWidth(newW);
    };

    const onMouseUp = (ev: MouseEvent) => {
      setIsResizingSidebar(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      const maxW = Math.max(340, window.innerWidth - 420);
      const finalW = Math.max(340, Math.min(maxW, ev.clientX));
      try {
        localStorage.setItem("cms_studio_sidebar_width", String(finalW));
      } catch {}
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const startFrameResize = useCallback((e: React.MouseEvent, _side: "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingFrame(true);
    setDevice("custom");

    const onMouseMove = (ev: MouseEvent) => {
      if (!previewPaneRef.current) return;
      const rect = previewPaneRef.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distFromCenter = Math.abs(ev.clientX - center);
      let targetW = Math.round(distFromCenter * 2);

      // Snapping to common device presets
      if (Math.abs(targetW - 768) < 18) {
        targetW = 768;
      } else if (Math.abs(targetW - 390) < 18) {
        targetW = 390;
      } else if (targetW >= rect.width - 32) {
        targetW = Math.round(rect.width);
      }

      const clamped = Math.max(320, Math.min(Math.round(rect.width), targetW));
      setFrameWidth(clamped);
    };

    const onMouseUp = () => {
      setIsResizingFrame(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  // Bi-directional Navigation Sync
  const syncToPath = useCallback(
    async (rawPath: string) => {
      const clean = rawPath.replace(/^\/(en|de)(\/|$)/, "/").split("?")[0].split("#")[0];
      const target = matchKindAndKey(clean);
      setPreviewRoute(clean);
      if (!target) return;

      if (target.kind !== p.kind || (target.key && target.key !== p.keyValue)) {
        if (p.keyValue !== null && JSON.stringify({ d: data, e: de, m: machine }) !== saved.current) {
          try {
            await persist();
          } catch {
            /* ignore auto-persist error when switching sections */
          }
        }
        const dest = target.key
          ? `/admin/content/${target.kind}/${encodeURIComponent(target.key)}`
          : `/admin/content/${target.kind}/new`;
        window.location.href = dest;
      }
    },
    [p.kind, p.keyValue, data, de, machine, persist]
  );

  const handleRouteChange = useCallback(
    (newRoute: string) => {
      void syncToPath(newRoute);
    },
    [syncToPath]
  );

  const handleFrameLoad = useCallback(() => {
    try {
      const frameWin = frame.current?.contentWindow;
      const frameDoc = frame.current?.contentDocument;
      if (!frameWin || !frameDoc) return;

      // 1. Initial check when iframe loads
      const currentPath = frameWin.location.pathname;
      if (currentPath && currentPath !== "/api/admin/preview") {
        const clean = currentPath.replace(/^\/(en|de)(\/|$)/, "/").split("?")[0].split("#")[0];
        const target = matchKindAndKey(clean);
        if (target && (target.kind !== p.kind || (target.key && target.key !== p.keyValue))) {
          void syncToPath(clean);
          return;
        }
      }

      // 2. Click listener on all links inside the iframe preview (capturing phase)
      const handleDocumentClick = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement | null)?.closest("a");
        if (!anchor || !anchor.href) return;
        try {
          const url = new URL(anchor.href, frameWin.location.href);
          if (url.origin === window.location.origin) {
            void syncToPath(url.pathname);
          }
        } catch {
          /* ignore invalid url */
        }
      };

      frameDoc.addEventListener("click", handleDocumentClick, { capture: true });

      // 3. Patch pushState & replaceState for Next.js soft client-side routing inside the iframe
      const origPushState = frameWin.history.pushState.bind(frameWin.history);
      // eslint-disable-next-line react-hooks/immutability
      frameWin.history.pushState = (...args) => {
        const res = origPushState(...args);
        try {
          const nextUrl = args[2];
          if (typeof nextUrl === "string") {
            const url = new URL(nextUrl, frameWin.location.href);
            void syncToPath(url.pathname);
          } else if (frameWin.location.pathname) {
            void syncToPath(frameWin.location.pathname);
          }
        } catch {}
        return res;
      };

      const origReplaceState = frameWin.history.replaceState.bind(frameWin.history);
      frameWin.history.replaceState = (...args) => {
        const res = origReplaceState(...args);
        try {
          const nextUrl = args[2];
          if (typeof nextUrl === "string") {
            const url = new URL(nextUrl, frameWin.location.href);
            void syncToPath(url.pathname);
          } else if (frameWin.location.pathname) {
            void syncToPath(frameWin.location.pathname);
          }
        } catch {}
        return res;
      };

      // 4. Listen to popstate (back / forward navigation inside the preview)
      frameWin.addEventListener("popstate", () => {
        if (frameWin.location.pathname) {
          void syncToPath(frameWin.location.pathname);
        }
      });
    } catch {
      // Cross-origin fallback
    }
  }, [p.kind, p.keyValue, syncToPath]);

  const enSteps = (Array.isArray(data.path) ? data.path : []) as { note?: string }[];
  const titleText = savedKey
    ? String(data[spec.titleField] ?? savedKey)
    : `New ${spec.label.toLowerCase()}`;

  const currentDisplayWidth = useMemo(() => {
    if (frameWidth !== null) return frameWidth;
    if (device === "tablet") return 768;
    if (device === "mobile") return 390;
    return "100%";
  }, [frameWidth, device]);

  const routeOptions = useMemo(() => {
    const list = [
      { label: "Home", value: "/", hint: "/" },
      { label: "Projects", value: "/projects", hint: "/projects" },
      { label: "Experience", value: "/experience", hint: "/experience" },
      { label: "Skills", value: "/skills", hint: "/skills" },
      { label: "Certificates", value: "/certifications", hint: "/certifications" },
      { label: "Writing", value: "/blog", hint: "/blog" },
      { label: "Notes", value: "/notes", hint: "/notes" },
    ];
    if (!list.some((r) => r.value === previewRoute)) {
      list.push({
        label: `${spec.label} Preview`,
        value: previewRoute,
        hint: previewRoute,
      });
    }
    return list;
  }, [previewRoute, spec.label]);

  return (
    <div className="cms-doc-view cms-studio-mode">
      {/* Studio Top Control Bar */}
      <header className="cms-studio-topbar">
        {/* Left: Document Info */}
        <div className="cms-studio-topbar-left">
          <Link
            href={`/admin/content/${p.kind}`}
            className="cms-studio-back-btn"
            title={`Back to ${spec.plural}`}
          >
            <ArrowLeftIcon width={13} height={13} />
            <span>{spec.plural}</span>
          </Link>

          <div className="cms-studio-title-box">
            <h1 className="cms-doc-title">{titleText}</h1>
            <span className={`pill ${p.live ? "live" : "draft"}`}>
              <span className={`tablecn-dot ${p.live ? "live" : "draft"}`} />
              {p.live ? "published" : "draft"}
            </span>
          </div>

          {/* Autosave Status Badge */}
          <div aria-live="polite">
            {save === "saving" && (
              <span className="cms-studio-save-badge saving">Saving…</span>
            )}
            {save === "saved" && (
              <span className="cms-studio-save-badge">
                <CheckIcon width={12} height={12} />
                Draft saved
              </span>
            )}
            {save === "error" && (
              <span className="cms-studio-save-badge error">Not saved</span>
            )}
          </div>
        </div>

        {/* Center: Live Site Navigation & Viewport Controls */}
        <div className="cms-studio-topbar-center">
          {/* shadcn Route Selector */}
          <ShadcnSelect
            value={previewRoute}
            onChange={handleRouteChange}
            options={routeOptions}
            icon={<GlobeIcon width={13} height={13} style={{ color: "var(--green)" }} />}
          />

          {/* Viewport Device Switcher with Live Dimensions */}
          <div className="cms-studio-devices" role="group" aria-label="Device Viewport">
            <button
              type="button"
              className={`cms-studio-device-btn ${device === "desktop" && frameWidth === null ? "active" : ""}`}
              onClick={() => {
                setDevice("desktop");
                setFrameWidth(null);
              }}
              title="Desktop View (100%)"
              aria-label="Desktop view"
            >
              <DeviceDesktopIcon width={13} height={13} />
            </button>
            <button
              type="button"
              className={`cms-studio-device-btn ${device === "tablet" || frameWidth === 768 ? "active" : ""}`}
              onClick={() => {
                setDevice("tablet");
                setFrameWidth(768);
              }}
              title="Tablet View (768px)"
              aria-label="Tablet view"
            >
              <TabletIcon width={13} height={13} />
            </button>
            <button
              type="button"
              className={`cms-studio-device-btn ${device === "mobile" || frameWidth === 390 ? "active" : ""}`}
              onClick={() => {
                setDevice("mobile");
                setFrameWidth(390);
              }}
              title="Mobile View (390px)"
              aria-label="Mobile view"
            >
              <DeviceMobileIcon width={13} height={13} />
            </button>
            <span
              className="cms-studio-device-dimension-badge"
              title="Current preview viewport width"
            >
              {typeof currentDisplayWidth === "number" ? `${currentDisplayWidth}px` : "100%"}
            </span>
          </div>

          {/* Reload Live Preview */}
          <button
            type="button"
            className="cms-studio-icon-btn"
            onClick={reload}
            title="Reload live preview"
          >
            <RefreshIcon width={13} height={13} />
          </button>

          {/* Open live in new tab */}
          <a
            href={`/api/admin/preview?path=${encodeURIComponent(previewRoute)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-studio-icon-btn"
            title="Open preview in new tab ↗"
          >
            <ExternalLinkIcon width={12} height={12} />
          </a>
        </div>

        {/* Right: Actions, Language & Publish */}
        <div className="cms-studio-topbar-right">
          {/* Unified Language Switcher Tabs */}
          <div className="cms-studio-lang-tabs" role="tablist" aria-label="Language">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "en"}
              className={`cms-studio-lang-tab ${tab === "en" ? "active" : ""}`}
              onClick={() => {
                setTab("en");
                setLang("en");
              }}
            >
              English
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "de"}
              className={`cms-studio-lang-tab ${tab === "de" ? "active" : ""}`}
              onClick={() => {
                setTab("de");
                setLang("de");
              }}
            >
              Deutsch{machine && Object.keys(de).length ? " (machine)" : ""}
            </button>
          </div>

          {tab === "de" && (
            <button
              type="button"
              className="ghost"
              style={{ height: 30, fontSize: 11.5, padding: "0 10px" }}
              onClick={translate}
              disabled={busy}
            >
              Translate with Gemini
            </button>
          )}

          {savedKey && !p.deleted && (
            <button
              type="button"
              className="danger cms-studio-remove-btn"
              onClick={() => remove(true)}
              disabled={busy}
            >
              Remove from site
            </button>
          )}

          {savedKey && p.deleted && (
            <button
              type="button"
              className="ghost"
              style={{ height: 30, fontSize: 12, padding: "0 10px" }}
              onClick={() => remove(false)}
              disabled={busy}
            >
              Restore
            </button>
          )}

          <button
            type="button"
            className="btn cms-studio-publish-btn"
            onClick={publish}
            disabled={busy || (savedKey === null && save !== "saved")}
          >
            Publish
          </button>
        </div>
      </header>

      {/* Split Studio Body: Left Builder Drawer, Right Live Website */}
      <div className="cms-studio-body">
        {/* Left Visual Builder Drawer */}
        <aside
          className="cms-builder-sidebar"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Studio Navigation Tabs */}
          <nav className="cms-builder-tabs" role="tablist" aria-label="Builder Modes">
            <button
              type="button"
              className={`cms-builder-tab ${sidebarTab === "content" ? "active" : ""}`}
              onClick={() => setSidebarTab("content")}
            >
              <EditIcon width={13} height={13} />
              <span>Edit Content</span>
            </button>
            <button
              type="button"
              className={`cms-builder-tab ${sidebarTab === "add" ? "active" : ""}`}
              onClick={() => setSidebarTab("add")}
            >
              <PlusIcon width={13} height={13} />
              <span>Add Blocks</span>
            </button>
            <button
              type="button"
              className={`cms-builder-tab ${sidebarTab === "reorder" ? "active" : ""}`}
              onClick={() => setSidebarTab("reorder")}
            >
              <LayersIcon width={13} height={13} />
              <span>Reorder ({itemsList.length})</span>
            </button>
          </nav>

          {/* Drawer Content */}
          <div className="cms-builder-panel">
            {/* TAB 1: Edit Content */}
            {sidebarTab === "content" && (
              <>
                {info && <div className="cms-info-banner" role="status">{info}</div>}

                {errors.length > 0 && (
                  <ul className="err" role="alert">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}

                {tab === "en" &&
                  spec.fields.map((f) => {
                    const isKey = f.name === spec.keyField;
                    return (
                      <div key={f.name} className="shadcn-form-item">
                        <div className="shadcn-form-label-row">
                          <label className="shadcn-form-label" htmlFor={`f-${f.name}`}>
                            {f.label}
                          </label>
                          {isKey && savedKey !== null && (
                            <span className="shadcn-form-locked-pill">Permanent Key</span>
                          )}
                        </div>
                        <FieldInput
                          field={f}
                          value={data[f.name]}
                          onChange={(v) => setField(f.name, v)}
                          locked={isKey && savedKey !== null}
                        />
                        {f.help && <p className="shadcn-form-help">{f.help}</p>}
                      </div>
                    );
                  })}

                {tab === "de" && (
                  <>
                    <div className="cms-de-notice">
                      <label className="cms-toggle-label" style={{ marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          className="cms-checkbox"
                          checked={!machine}
                          onChange={(e) => setMachine(!e.target.checked)}
                        />
                        <span className="cms-toggle-text">I reviewed this German</span>
                      </label>
                      <p className="cms-field-help" style={{ margin: 0 }}>
                        Anything left empty falls back to English on the site.
                      </p>
                    </div>

                    {deFields(p.kind).map((f) =>
                      f.type === "steps" ? (
                        <div key={f.name} className="cms-field-group">
                          <span className="cms-field-label">{f.label} (German notes)</span>
                          <div className="cms-steps-list">
                            {enSteps.map((s, i) => {
                              const cur = (Array.isArray(de.path) ? de.path : []) as string[];
                              return (
                                <label key={i} className="cms-field-group">
                                  <span className="cms-field-help">Original: {s.note}</span>
                                  <textarea
                                    rows={2}
                                    value={cur[i] ?? ""}
                                    placeholder="German translation for this step..."
                                    onChange={(e) => {
                                      const next = [...cur];
                                      next[i] = e.target.value;
                                      setDeField("path", next);
                                    }}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div key={f.name} className="shadcn-form-item">
                          <label className="shadcn-form-label" htmlFor={`f-${f.name}`}>
                            {f.label}
                          </label>
                          <FieldInput
                            field={f}
                            value={de[f.name]}
                            onChange={(v) => setDeField(f.name, v)}
                            hint={typeof data[f.name] === "string" ? (data[f.name] as string) : undefined}
                          />
                        </div>
                      ),
                    )}
                  </>
                )}

                <div className="cms-form-bottom-actions">
                  <span className="cms-field-help">
                    Autosaved as drafts. Press Publish to push to live.
                  </span>
                  <span className={`pill ${p.live ? "live" : "draft"}`}>
                    <span className={`tablecn-dot ${p.live ? "live" : "draft"}`} />
                    {p.live ? "published" : "draft"}
                  </span>
                </div>
              </>
            )}

            {/* TAB 2: Add New Stuff / Blocks */}
            {sidebarTab === "add" && (
              <>
                <p className="cms-add-blocks-intro">
                  Select or drag a content block to add new entries to your website.
                </p>
                <div className="cms-add-blocks-grid">
                  {BLOCK_TYPES.map((b) => {
                    const IconComponent = b.icon;
                    return (
                      <Link
                        key={b.kind}
                        href={`/admin/content/${b.kind}/new`}
                        className="cms-add-block-card"
                        draggable
                      >
                        <div className="cms-add-block-info">
                          <div className="cms-add-block-icon">
                            <IconComponent width={18} height={18} />
                          </div>
                          <div className="cms-add-block-text">
                            <strong>{b.label}</strong>
                            <span>{b.description}</span>
                          </div>
                        </div>
                        <PlusIcon width={14} height={14} style={{ color: "var(--fg-3)" }} />
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 3: Reorder & Items */}
            {sidebarTab === "reorder" && (
              <>
                <p className="cms-add-blocks-intro">
                  Drag items by their handle or use arrows to reorder section content on the live site.
                </p>
                <div className="cms-reorder-list">
                  {itemsList.map((item, idx) => (
                    <div
                      key={item.key}
                      className={`cms-reorder-item ${
                        item.key === savedKey ? "active" : ""
                      } ${draggedIdx === idx ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="cms-reorder-item-left">
                        <span className="cms-reorder-handle" title="Drag to reorder">
                          <GripVerticalIcon width={14} height={14} />
                        </span>
                        <Link
                          href={`/admin/content/${p.kind}/${encodeURIComponent(item.key)}`}
                          className="cms-reorder-item-title"
                          title={`Edit ${item.title}`}
                        >
                          {item.title}
                        </Link>
                      </div>

                      <div className="cms-reorder-item-right">
                        <span className={`pill ${item.live ? "live" : "draft"}`} style={{ fontSize: 10, padding: "2px 6px" }}>
                          {item.live ? "live" : "draft"}
                        </span>
                        <button
                          type="button"
                          className="cms-reorder-btn"
                          disabled={idx === 0}
                          onClick={() => handleMove(item.key, -1)}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="cms-reorder-btn"
                          disabled={idx === itemsList.length - 1}
                          onClick={() => handleMove(item.key, 1)}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Splitter Resizer between Sidebar & Preview */}
        <div
          className={`cms-studio-resizer ${isResizingSidebar ? "active" : ""}`}
          onMouseDown={startSidebarResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize studio panels"
          title="Drag to resize builder and preview"
        >
          <div className="cms-studio-resizer-line" />
        </div>

        {/* Right Live Website Viewport (The Entire Website) */}
        <main
          ref={previewPaneRef}
          className="cms-studio-preview-pane"
          aria-label="Live preview"
        >
          <div
            ref={frameBoxRef}
            className={`cms-studio-frame-box ${device} ${
              isResizingFrame ? "resizing" : ""
            }`}
            style={
              frameWidth !== null
                ? { width: `${frameWidth}px`, maxWidth: "100%" }
                : undefined
            }
          >
            {/* Draggable resize handle on left */}
            <div
              className="cms-frame-resize-handle left"
              onMouseDown={(e) => startFrameResize(e, "left")}
              title="Drag to resize preview width"
              role="separator"
              aria-orientation="vertical"
            >
              <div className="cms-frame-resize-pill" />
            </div>

            <iframe
              ref={frame}
              title="Live preview of the site"
              src={`/api/admin/preview?path=${encodeURIComponent(previewRoute)}`}
              onLoad={handleFrameLoad}
            />

            {/* Draggable resize handle on right */}
            <div
              className="cms-frame-resize-handle right"
              onMouseDown={(e) => startFrameResize(e, "right")}
              title="Drag to resize preview width"
              role="separator"
              aria-orientation="vertical"
            >
              <div className="cms-frame-resize-pill" />
            </div>

            {/* Live pixel dimensions indicator during drag or custom width */}
            <div className="cms-frame-width-indicator">
              <span>{typeof currentDisplayWidth === "number" ? `${currentDisplayWidth}px` : currentDisplayWidth}</span>
            </div>
          </div>

          {/* Iframe shielding layer while dragging so mouse events are not swallowed */}
          {(isResizingFrame || isResizingSidebar) && (
            <div className="cms-frame-drag-overlay" />
          )}
        </main>
      </div>
    </div>
  );
}
