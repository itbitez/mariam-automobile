"use client";

import { useEffect, useRef, useState } from "react";
import { happy, media } from "@/lib/admin-api";
import MediaLibrary from "@/components/media-library";

const MAX_BYTES = 5 * 1024 * 1024;

const I = {
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  up: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  down: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * Happy Customers gallery manager.
 *
 * Rows live in the `happy_customers` table and photos reuse the existing
 * car-photos bucket, so the media library can pick from images already uploaded
 * for cars as well as new ones.
 */
export default function HappyView({ toast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error: err } = await happy.list();
      if (!alive) return;
      if (err) setError(err.message);
      else setRows(data?.rows || []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** Append new photos to the end of the gallery. */
  async function addUrls(urls) {
    if (!urls.length) return;
    // Ordering is assigned server side so two admins adding at once cannot
    // collide on the same sort_order.
    const { data, error: err } = await happy.add(urls);
    if (err) return toast({ msg: "Could not save: " + err.message, type: "err" });

    const created = data?.rows || [];
    if (!created.length) return toast({ msg: "Saved nothing — please try again.", type: "err" });

    setRows((r) => [...r, ...created]);
    toast({ msg: `Added ${created.length} photo${created.length > 1 ? "s" : ""}.`, type: "ok" });
  }

  async function uploadDirect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const ok = files.filter((f) => f.size <= MAX_BYTES);
    if (ok.length < files.length) {
      toast({ msg: `Skipped ${files.length - ok.length} file(s) over 5 MB.`, type: "err" });
    }
    if (!ok.length) return;

    setUploading(true);
    const { data, error: upErr } = await media.upload(ok);
    setUploading(false);

    if (upErr) return toast({ msg: "Upload failed: " + upErr.message, type: "err" });
    if (data?.skipped?.length) toast({ msg: data.skipped.join("; "), type: "err" });
    await addUrls((data?.media || []).map((m) => m.url));
  }

  async function saveCaption(id, caption) {
    const { error: err } = await happy.update(id, { caption });
    if (err) toast({ msg: "Caption not saved: " + err.message, type: "err" });
  }

  async function move(id, dir) {
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;

    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    // Renumber from zero so the order is stable no matter what it was before.
    const renumbered = next.map((r, k) => ({ ...r, sort_order: k }));
    setRows(renumbered);

    setBusy(id);
    for (const r of [renumbered[i], renumbered[j]]) {
      const { error: err } = await happy.update(r.id, { sortOrder: r.sort_order });
      if (err) toast({ msg: "Reorder failed: " + err.message, type: "err" });
    }
    setBusy(null);
  }

  async function remove(id) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 3000);
      return;
    }
    setConfirmId(null);
    setBusy(id);
    const { error: err } = await happy.remove(id);
    setBusy(null);
    if (err) return toast({ msg: "Delete failed: " + err.message, type: "err" });
    setRows((r) => r.filter((x) => x.id !== id));
    toast({ msg: "Photo removed from the gallery.", type: "ok" });
  }

  if (loading) return <div className="card hv-pad">Loading gallery…</div>;

  if (error) {
    const missing = /relation .* does not exist|could not find the table|schema cache/i.test(error);
    return (
      <section>
        <div className="topbar">
          <div>
            <h1>Happy Customers</h1>
            <div className="crumb">Photo gallery shown on the public Happy Customers page.</div>
          </div>
        </div>
        <div className="auth-err" style={{ display: "block" }}>
          {missing
            ? "The happy_customers table does not exist yet. Open phpMyAdmin and run mysql/01-schema.sql, then reload this page."
            : "Could not load the gallery: " + error}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Happy Customers</h1>
          <div className="crumb">
            Photos shown on the public{" "}
            <a href="/happy-customers" target="_blank" rel="noopener noreferrer">
              Happy Customers
            </a>{" "}
            page. The live site picks up changes within a minute.
          </div>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={() => setPickerOpen(true)} disabled={uploading}>
            {I.media}Media library
          </button>
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <span className="spin" /> : I.plus}
            {uploading ? "Uploading…" : "Upload photos"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={uploadDirect}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card hv-pad hv-empty">
          <p>No photos yet. Upload your first handover photo and it will appear on the site straight away.</p>
        </div>
      ) : (
        <div className="hv-grid">
          {rows.map((r, i) => (
            <div className={`hv-card${busy === r.id ? " is-busy" : ""}`} key={r.id}>
              <div className="hv-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image_url} alt="" loading="lazy" />
              </div>

              <div className="hv-body">
                <label className="hv-label" htmlFor={`cap-${r.id}`}>
                  Caption <span>(optional)</span>
                </label>
                <input
                  id={`cap-${r.id}`}
                  type="text"
                  defaultValue={r.caption || ""}
                  placeholder="e.g. Rakib · Corolla Cross Z"
                  maxLength={90}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (r.caption || "")) {
                      setRows((list) => list.map((x) => (x.id === r.id ? { ...x, caption: v } : x)));
                      saveCaption(r.id, v);
                    }
                  }}
                />

                <div className="hv-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => move(r.id, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    title="Move earlier"
                  >
                    {I.up}
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => move(r.id, 1)}
                    disabled={i === rows.length - 1}
                    aria-label="Move later"
                    title="Move later"
                  >
                    {I.down}
                  </button>
                  <button
                    className={`btn btn-sm${confirmId === r.id ? " btn-danger" : ""}`}
                    onClick={() => remove(r.id)}
                  >
                    {I.trash}
                    {confirmId === r.id ? "Sure?" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaLibrary
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onInsert={(urls) => addUrls(urls.filter(Boolean))}
        onNotify={toast}
      />
    </section>
  );
}
