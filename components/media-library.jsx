"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { media as mediaApi } from "@/lib/admin-api";
import MediaLightbox from "@/components/media-lightbox";
import SITE_IMAGES from "@/lib/data/site-images.json";

const MAX_BYTES = 5 * 1024 * 1024;

const I = {
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v13" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
};

/**
 * Uploads used to be objects in a Storage bucket whose public URL was derived
 * from the filename. They are now files on disk catalogued in the `media`
 * table, and each row carries its own served URL — so there is nothing left to
 * derive.
 */

function prettySize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

/**
 * Shared browse + upload surface. Used both as the picker inside the modal and
 * as the standalone Media page in the sidebar.
 */
export function MediaBrowser({ selected, onToggle, onNotify, selectable = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [source, setSource] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await mediaApi.list();
    if (err) {
      setError(err.message);
      setItems([]);
    } else {
      setItems(data?.media || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) {
      onNotify?.({ msg: `Skipped ${tooBig.length} file(s) over 5 MB.`, type: "err" });
    }
    const ok = files.filter((f) => f.size <= MAX_BYTES);
    if (!ok.length) return;

    setUploading(ok.length);
    const { data, error: err } = await mediaApi.upload(ok);
    setUploading(0);
    await load();

    if (err) {
      onNotify?.({ msg: "Upload failed: " + err.message, type: "err" });
      return;
    }
    const n = data?.media?.length || 0;
    if (data?.skipped?.length) onNotify?.({ msg: data.skipped.join("; "), type: "err" });
    if (n) onNotify?.({ msg: `Uploaded ${n} image${n > 1 ? "s" : ""}.`, type: "ok" });
  }

  /** Returns true when the file is actually gone, so the lightbox can close. */
  async function remove(item) {
    // Site images ship with the app and have no media row to delete.
    if (!item?.id) {
      onNotify?.({ msg: "That image is part of the site build and cannot be deleted here.", type: "err" });
      return false;
    }
    const { error: err } = await mediaApi.remove(item.id);
    if (err) {
      onNotify?.({ msg: "Delete failed: " + err.message, type: "err" });
      return false;
    }
    setItems((list) => list.filter((f) => f.id !== item.id));
    onNotify?.({ msg: "Image deleted permanently.", type: "ok" });
    return true;
  }

  // One shape for both sources so the grid and lightbox stay simple.
  const uploads = useMemo(
    () =>
      items.map((f) => ({
        id: f.id,
        url: f.url,
        name: f.filename,
        size: f.size_bytes,
        createdAt: f.created_at,
        readOnly: false,
      })),
    [items]
  );

  const siteImages = useMemo(() => SITE_IMAGES.map((s) => ({ ...s, readOnly: true })), []);

  // "All" is the default so nothing is hidden behind a tab.
  const shown = useMemo(() => {
    if (source === "uploads") return uploads;
    if (source === "site") return siteImages;
    return [...uploads, ...siteImages];
  }, [source, uploads, siteImages]);

  const lightboxItem = lightboxIndex >= 0 ? shown[lightboxIndex] : null;

  return (
    <>
      <div className="src-tabs" role="tablist">
        {[
          { key: "all", label: "All images", n: uploads.length + siteImages.length },
          { key: "uploads", label: "Your uploads", n: uploads.length },
          { key: "site", label: "Site images", n: siteImages.length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={source === t.key}
            className={source === t.key ? "on" : ""}
            onClick={() => {
              setSource(t.key);
              setLightboxIndex(-1);
            }}
          >
            {t.label}
            <span>{t.n}</span>
          </button>
        ))}
      </div>

      <p className="src-hint">
        {source === "uploads"
          ? "Photos you have uploaded. These can be deleted."
          : source === "site"
            ? "Images that ship with the website — logos, the hero photo and the original car pictures. Usable on any car, but they cannot be deleted from here."
            : "Everything available to use on a car: your uploads plus the images built into the website."}
      </p>

      <div
        className={"drop-zone" + (dragOver ? " over" : "")}
        hidden={source === "site"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        {uploading > 0 ? (
          <div className="up-progress" style={{ justifyContent: "center" }}>
            <span className="spin" />
            Uploading… {uploading} left
          </div>
        ) : (
          <>
            {I.upload}
            <b>Drag images here to upload</b>
            <span>
              or{" "}
              <button
                type="button"
                className="btn btn-sm"
                style={{ verticalAlign: "middle" }}
                onClick={() => fileRef.current && fileRef.current.click()}
              >
                browse your computer
              </button>{" "}
              — JPG, PNG or WebP up to 5 MB each
            </span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {loading && source !== "site" && (
        <div className="up-progress" style={{ padding: "20px 0" }}>
          <span className="spin" />
          Loading media…
        </div>
      )}

      {error && source !== "site" && (
        <div className="auth-err" style={{ marginBottom: 16 }}>
          Could not read your uploads: {error}
        </div>
      )}

      {!loading && !error && shown.length === 0 && (
        <div className="photo-empty">No images yet — upload your first one above.</div>
      )}

      {shown.length > 0 && (
        <div className="media-grid">
          {shown.map((m, i) => {
            const isSel = selected?.includes(m.url);
            return (
              <div key={m.url} className={"media-item" + (isSel ? " sel" : "")} title={m.label || m.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.name} loading="lazy" />

                {/* Clicking the image opens the viewer; selection is its own control. */}
                <button
                  type="button"
                  className="mi-open"
                  aria-label={`View ${m.name}`}
                  onClick={() => setLightboxIndex(i)}
                />

                {selectable && (
                  <button
                    type="button"
                    className="tick"
                    aria-label={isSel ? `Deselect ${m.name}` : `Select ${m.name}`}
                    aria-pressed={isSel}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle?.(m.url);
                    }}
                  >
                    {I.check}
                  </button>
                )}

                {m.readOnly && <span className="src-badge">Site</span>}
                <span className="cap">{m.label || prettySize(m.size)}</span>
              </div>
            );
          })}
        </div>
      )}

      <MediaLightbox
        item={lightboxItem}
        onClose={() => setLightboxIndex(-1)}
        onDelete={(item) => remove(item)}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex >= 0 && lightboxIndex < shown.length - 1}
        onPrev={() => setLightboxIndex((i) => Math.max(0, i - 1))}
        onNext={() => setLightboxIndex((i) => Math.min(shown.length - 1, i + 1))}
      />
    </>
  );
}

/** Modal picker — choose one or more images to add to a car. */
export default function MediaLibrary({ open, onClose, onInsert, onNotify }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (url) =>
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));

  // Portaled to <body> so no ancestor stacking context can trap it.
  return createPortal(
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Media library">
        <div className="modal-head">
          <div>
            <h2>Media library</h2>
            <p>Upload new photos or pick from images you have already uploaded.</p>
          </div>
          <button type="button" className="ibtn" aria-label="Close" onClick={onClose}>
            {I.x}
          </button>
        </div>

        <div className="modal-body">
          <MediaBrowser selected={selected} onToggle={toggle} onNotify={onNotify} />
        </div>

        <div className="modal-foot">
          <span className="count">
            {selected.length ? `${selected.length} image${selected.length > 1 ? "s" : ""} selected` : "Nothing selected"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selected.length}
              onClick={() => {
                onInsert(selected);
                onClose();
              }}
            >
              {I.image}
              Add to car
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
