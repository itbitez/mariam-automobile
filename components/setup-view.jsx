"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

const supabase = getSupabaseClient();

const CHECKS = [
  {
    key: "cars",
    label: "Cars",
    what: "Your vehicle listings.",
    probe: () => supabase.from("cars").select("id").limit(1),
    file: "supabase/setup.sql",
  },
  {
    key: "home_content",
    label: "Homepage content",
    what: "Editable text for every homepage section.",
    probe: () => supabase.from("home_content").select("id").limit(1),
    file: "supabase/setup.sql",
  },
  {
    key: "site_settings",
    label: "Site settings",
    what: "Phone, WhatsApp, address and opening hours.",
    probe: () => supabase.from("site_settings").select("id").limit(1),
    file: "supabase/setup.sql",
  },
  {
    key: "calc_settings",
    label: "Calculator settings",
    what: "Slider ranges for the finance estimator. Without this the calculator uses built-in defaults and cannot be saved.",
    probe: () => supabase.from("calc_settings").select("id").limit(1),
    file: "supabase/migration-calc-settings.sql",
  },
  {
    key: "leads",
    label: "Leads",
    what: "Stores every enquiry submitted from the website. Without this, enquiries cannot be saved.",
    probe: () => supabase.from("leads").select("id").limit(1),
    file: "supabase/migration-leads.sql",
  },
];

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

  const run = useCallback(async () => {
    setRunning(true);
    const next = {};
    for (const c of CHECKS) {
      try {
        const { error } = await c.probe();
        next[c.key] = error ? { ok: false, msg: error.message } : { ok: true };
      } catch (e) {
        next[c.key] = { ok: false, msg: e.message };
      }
    }
    setState(next);

    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const missing = CHECKS.filter((c) => state[c.key] && !state[c.key].ok);
  const files = [...new Set(missing.map((m) => m.file))];

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
            Checks that every table this admin panel needs exists in your Supabase project.
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
            Open your Supabase dashboard → <b>SQL Editor</b> → <b>New query</b>, paste the file
            {files.length > 1 ? "s" : ""} listed below, and press Run. It only needs doing once.
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
                  {s && !s.ok && <em>Run {c.file}</em>}
                </span>
                <span className={"pill " + (s ? (s.ok ? "ok" : "bad") : "info")}>
                  {s ? (s.ok ? "Ready" : "Missing") : "Checking"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!running && files.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div>
              <h2>What to run</h2>
              <p>Copy each file&apos;s contents from your project folder into the Supabase SQL editor.</p>
            </div>
          </div>
          <div className="setup-files">
            {files.map((f) => (
              <div className="setup-file" key={f}>
                <code>{f}</code>
                <button className="btn btn-sm" onClick={() => copy(f, f)}>
                  {copied === f ? I.ok : I.copy}
                  {copied === f ? "Copied" : "Copy path"}
                </button>
              </div>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 12 }}>
            The files live in your project at the paths above. Each one is safe to run more than once.
          </div>
        </div>
      )}
    </section>
  );
}
