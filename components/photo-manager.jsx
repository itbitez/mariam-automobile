"use client";

import { useEffect, useRef, useState } from "react";
import MediaLibrary, { MEDIA_BUCKET } from "@/components/media-library";
import { getSupabaseClient } from "@/lib/supabase-client";

const supabase = getSupabaseClient();
const MAX_BYTES = 5 * 1024 * 1024;

const I = {
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1z" />
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
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  ),
  broken: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15l5-5 4 4" />
      <path d="M17 21L3 7" />
    </svg>
  ),
};

function PhotoCard({ url, index, isCover, onRemove, onMove, canLeft, canRight }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef(null);

  // A cached or already-failed image can finish loading before React attaches
  // onError, so re-check the element once it is mounted.
  useEffect(() => {
    setBroken(false);
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, [url]);

  return (
    <div className="photo-card">
      {broken ? (
        <div className="broken">
          {I.broken}
          <span>Image did not load</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={url}
          alt={`Photo ${index + 1}`}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}

      {isCover && <span className="cover-tag">Cover</span>}

      <div className="ops">
        <button type="button" title="Move left" aria-label="Move left" disabled={!canLeft} onClick={() => onMove(-1)}>
          {I.left}
        </button>
        <button type="button" title="Move right" aria-label="Move right" disabled={!canRight} onClick={() => onMove(1)}>
          {I.right}
        </button>
        {!isCover && (
          <button type="button" title="Make cover photo" aria-label="Make cover photo" onClick={() => onMove(-index)}>
            {I.star}
          </button>
        )}
        <button type="button" className="danger" title="Remove" aria-label="Remove" onClick={onRemove}>
          {I.trash}
        </button>
      </div>
    </div>
  );
}

/**
 * Photo list for the car form. `photos` is a plain array of URL strings — the
 * shape the `cars.photos` column already stores.
 */
export default function PhotoManager({ photos, onChange, onNotify }) {
  const [libOpen, setLibOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef(null);

  const list = (photos || []).filter((p) => String(p).trim());

  function add(urls) {
    const fresh = urls.filter((u) => u && !list.includes(u));
    if (!fresh.length) {
      onNotify?.({ msg: "Those images are already on this car.", type: "err" });
      return;
    }
    onChange([...list, ...fresh]);
  }

  function removeAt(i) {
    const next = list.slice();
    next.splice(i, 1);
    onChange(next);
  }

  function moveBy(i, delta) {
    const target = Math.max(0, Math.min(list.length - 1, i + delta));
    if (target === i) return;
    const next = list.slice();
    const [item] = next.splice(i, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  async function uploadDirect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const ok = files.filter((f) => f.size <= MAX_BYTES);
    if (ok.length < files.length) {
      onNotify?.({ msg: `Skipped ${files.length - ok.length} file(s) over 5 MB.`, type: "err" });
    }
    if (!ok.length) return;

    setUploading(true);
    const urls = [];
    for (const file of ok) {
      const path =
        Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) {
        onNotify?.({ msg: "Upload failed: " + error.message, type: "err" });
        continue;
      }
      urls.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
    if (urls.length) {
      add(urls);
      onNotify?.({ msg: `Uploaded ${urls.length} photo${urls.length > 1 ? "s" : ""}.`, type: "ok" });
    }
  }

  return (
    <>
      {list.length === 0 ? (
        <div className="photo-empty">
          No photos yet. The first photo you add becomes the cover image shown on the cars page.
        </div>
      ) : (
        <div className="photo-grid">
          {list.map((p, i) => (
            <PhotoCard
              key={p + i}
              url={p}
              index={i}
              isCover={i === 0}
              canLeft={i > 0}
              canRight={i < list.length - 1}
              onMove={(d) => moveBy(i, d)}
              onRemove={() => removeAt(i)}
            />
          ))}
          <button type="button" className="photo-add" onClick={() => setLibOpen(true)}>
            {I.plus}
            Add photos
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setLibOpen(true)}>
          {I.library}
          Media library
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={uploading}
          onClick={() => fileRef.current && fileRef.current.click()}
        >
          {uploading ? <span className="spin" /> : I.plus}
          {uploading ? "Uploading…" : "Quick upload"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={uploadDirect} />
      </div>

      <div className="url-row">
        <input
          type="url"
          placeholder="…or paste an image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (urlDraft.trim()) {
                add([urlDraft.trim()]);
                setUrlDraft("");
              }
            }
          }}
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={!urlDraft.trim()}
          onClick={() => {
            add([urlDraft.trim()]);
            setUrlDraft("");
          }}
        >
          Add URL
        </button>
      </div>

      <MediaLibrary
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onInsert={add}
        onNotify={onNotify}
      />
    </>
  );
}
