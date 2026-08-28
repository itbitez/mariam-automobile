"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const I = {
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  ),
  left: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  right: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
};

function prettySize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function prettyDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || "");
  return m ? m[1].toUpperCase() : "—";
}

/**
 * Full-size viewer with a details sidebar.
 * `item` is { url, name, label?, size?, width?, height?, createdAt?, readOnly? }.
 */
export default function MediaLightbox({ item, onClose, onDelete, onPrev, onNext, hasPrev, hasNext }) {
  const [copied, setCopied] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [dims, setDims] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setCopied(false);
    setConfirmDel(false);
    setDims(null);
  }, [item?.url]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!item) return null;

  const absolute = typeof window !== "undefined" && item.url.startsWith("/")
    ? window.location.origin + item.url
    : item.url;

  async function copy() {
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      // Clipboard API is blocked in some contexts — fall back to a temp input.
      const el = document.createElement("textarea");
      el.value = absolute;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const width = item.width || dims?.w;
  const height = item.height || dims?.h;

  // Portaled to <body> so no ancestor stacking context can trap it.
  return createPortal(
    <div className="lb-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb" role="dialog" aria-modal="true" aria-label={item.name}>
        <div className="lb-stage">
          {hasPrev && (
            <button type="button" className="lb-nav prev" aria-label="Previous image" onClick={onPrev}>
              {I.left}
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.name}
            onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
          />
          {hasNext && (
            <button type="button" className="lb-nav next" aria-label="Next image" onClick={onNext}>
              {I.right}
            </button>
          )}
        </div>

        <aside className="lb-side">
          <div className="lb-side-head">
            <h3>Image details</h3>
            <button type="button" className="ibtn" aria-label="Close" onClick={onClose}>
              {I.x}
            </button>
          </div>

          <div className="lb-body">
            {item.label && <div className="lb-label">{item.label}</div>}
            <p className="lb-name" title={item.name}>
              {item.name}
            </p>

            <dl className="lb-meta">
              <div>
                <dt>Dimensions</dt>
                <dd>{width && height ? `${width} × ${height} px` : "—"}</dd>
              </div>
              <div>
                <dt>File size</dt>
                <dd>{prettySize(item.size)}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{extOf(item.name)}</dd>
              </div>
              <div>
                <dt>{item.readOnly ? "Source" : "Uploaded"}</dt>
                <dd>{item.readOnly ? "Bundled with site" : prettyDate(item.createdAt)}</dd>
              </div>
            </dl>

            <div className="lb-field">
              <label htmlFor="lb-url">Image link</label>
              <textarea id="lb-url" readOnly value={absolute} rows={3} onFocus={(e) => e.target.select()} />
            </div>

            <button type="button" className={"btn btn-sm lb-copy" + (copied ? " done" : "")} onClick={copy}>
              {copied ? I.check : I.copy}
              {copied ? "Link copied" : "Copy link"}
            </button>

            <a className="btn btn-sm" href={item.url} target="_blank" rel="noopener noreferrer">
              {I.ext}
              Open in new tab
            </a>
          </div>

          <div className="lb-foot">
            {item.readOnly ? (
              <span className="lb-locked">
                {I.lock}
                Part of the site design — delete it from the project files, not here.
              </span>
            ) : (
              <button
                type="button"
                className={"btn btn-sm " + (confirmDel ? "btn-danger" : "")}
                disabled={deleting}
                onClick={async () => {
                  if (!confirmDel) {
                    setConfirmDel(true);
                    clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => setConfirmDel(false), 4000);
                    return;
                  }
                  setDeleting(true);
                  const ok = await onDelete(item);
                  setDeleting(false);
                  if (ok) onClose();
                  else setConfirmDel(false);
                }}
              >
                {deleting ? <span className="spin" /> : I.trash}
                {deleting ? "Deleting…" : confirmDel ? "Click again to delete permanently" : "Delete permanently"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
