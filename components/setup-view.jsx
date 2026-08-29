"use client";

import { useCallback, useEffect, useState } from "react";


const CHECKS = [
  { key: "cars", label: "Cars", what: "Your vehicle listings." },
  { key: "home_content", label: "Homepage content", what: "Editable text for every homepage section." },
  { key: "site_settings", label: "Site settings", what: "Phone, WhatsApp, address and opening hours." },
  {
    key: "calc_settings",
    label: "Calculator settings",
    what: "Slider ranges for the finance estimator. Without this the calculator uses built-in defaults and cannot be saved.",
  },
  {
    key: "leads",
    label: "Leads",
    what: "Stores every enquiry submitted from the website. Without this, enquiries cannot be saved.",
  },
  { key: "happy_customers", label: "Happy Customers", what: "Photos on the public Happy Customers page." },
  { key: "media", label: "Media library", what: "Catalogue of uploaded images. Replaces the old storage bucket listing." },
  { key: "admin_users", label: "Admin users", what: "Who can sign in here. Create one with: npm run admin:create" },
];

const SCHEMA_FILE = "mysql/01-schema.sql";

const I = {
  ok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  bad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16h.01" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  ),
};

export default function SetupView({ toast }) {
  const [state, setState] = useState({});
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(null);
  const [uploads, setUploads] = useState(null);

  const run = useCallback(async () => {
    setRunning(true);
    const next = {};
    // One server-side call now covers every table — the browser has no
    // database access to probe with any more.
    const res = await fetch("/api/admin/health", { credentials: "same-origin" });
    const body = await res.json().catch(() => null);

    if (!body || body.ok === false) {
      for (const c of CHECKS) next[c.key] = { ok: false, msg: body?.error || "Could not reach the database" };
    } else {
      for (const chk of body.checks || []) {
        next[chk.table] = chk.ok ? { ok: true, rows: chk.rows } : { ok: false, msg: chk.error };
      }
      setUploads(body.uploads || null);
    }
    setState(next);

    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const missing = CHECKS.filter((c) => state[c.key] && !state[c.key].ok);

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
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
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    toast?.({ msg: "Copied to clipboard.", type: "ok" });
  }

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Database setup</h1>
          <div className="crumb">
            Checks that every table this admin panel needs exists in your MySQL database.
          </div>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={run} disabled={running}>
            {running ? <span className="spin" /> : I.refresh}
            {running ? "Checking…" : "Re-check"}
          </button>
        </div>
      </div>

      {!running && missing.length === 0 && (
        <div className="setup-ok">
          {I.ok}
          <div>
            <b>Everything is set up</b>
            <span>All tables are present. Nothing to do here.</span>
          </div>
        </div>
      )}

      {!running && missing.length > 0 && (
        <div className="note" style={{ background: "var(--warning-soft)", borderColor: "#fcd34d", color: "var(--warning-ink)" }}>
          {I.bad}
          <span>
            <b>
              {missing.length} table{missing.length > 1 ? "s are" : " is"} missing.
            </b>{" "}
            Open <b>hPanel → phpMyAdmin → SQL</b>, paste <b>{SCHEMA_FILE}</b>, and press Go. It only
            needs doing once.
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Tables</h2>
            <p>Each row is checked against your live database.</p>
          </div>
        </div>

        <div className="setup-list">
          {CHECKS.map((c) => {
            const s = state[c.key];
            return (
              <div className={"setup-row" + (s && !s.ok ? " bad" : "")} key={c.key}>
                <span className={"setup-dot" + (s ? (s.ok ? " ok" : " bad") : "")}>
                  {s ? (s.ok ? I.ok : I.bad) : <span className="spin" />}
                </span>
                <span className="setup-txt">
                  <b>{c.label}</b>
                  <span>{c.what}</span>
                  {s && !s.ok && <em>Run {SCHEMA_FILE}</em>}
                  {s && s.ok && s.rows !== undefined && <em>{s.rows} row{s.rows === 1 ? "" : "s"}</em>}
                </span>
                <span className={"pill " + (s ? (s.ok ? "ok" : "bad") : "info")}>
                  {s ? (s.ok ? "Ready" : "Missing") : "Checking"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!running && missing.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div>
              <h2>What to run</h2>
              <p>Open hPanel → phpMyAdmin → SQL and paste this file from your project.</p>
            </div>
          </div>
          <div className="setup-files">
            <div className="setup-file">
              <code>{SCHEMA_FILE}</code>
              <button className="btn btn-sm" onClick={() => copy(SCHEMA_FILE, SCHEMA_FILE)}>
                {copied === SCHEMA_FILE ? I.ok : I.copy}
                {copied === SCHEMA_FILE ? "Copied" : "Copy path"}
              </button>
            </div>
          </div>
          <div className="hint" style={{ marginTop: 12 }}>
            Safe to run more than once — it only creates what is missing.
          </div>
        </div>
      )}

      {!running && uploads && (
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Image storage</h2>
              <p>Uploads are written outside the app folder so a redeploy cannot delete them.</p>
            </div>
          </div>
          <div className="setup-list">
            <div className={"setup-row" + (uploads.ok ? "" : " bad")}>
              <span className={"setup-dot " + (uploads.ok ? "ok" : "bad")}>{uploads.ok ? I.ok : I.bad}</span>
              <span className="setup-txt">
                <b>Upload folder</b>
                <span>{uploads.path}</span>
                {uploads.ok ? (
                  <em>
                    {uploads.files} file{uploads.files === 1 ? "" : "s"} stored
                  </em>
                ) : (
                  <em>{uploads.error}</em>
                )}
              </span>
              <span className={"pill " + (uploads.ok ? "ok" : "bad")}>{uploads.ok ? "Writable" : "Not writable"}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
