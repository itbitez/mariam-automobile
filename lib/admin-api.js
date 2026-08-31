"use client";

/**
 * Browser-side client for the admin API.
 *
 * Replaces the Supabase JS client. Every call goes to a route under
 * /api/admin, which checks the session cookie server side — the browser never
 * holds a database credential, only an httpOnly cookie it cannot read.
 *
 * Methods return { data, error } to match the shape the admin components were
 * already written against, so the call sites stay small.
 */

/**
 * @param {string} path
 * @param {RequestInit} options
 * @param {{ isSignIn?: boolean }} meta
 *   isSignIn marks the login request, whose 401 means "wrong credentials" and
 *   NOT "your session expired" — see the 401 branch below.
 */
async function call(path, options = {}, meta = {}) {
  try {
    const res = await fetch(path, {
      credentials: "same-origin",
      ...options,
      headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    // Two different things return 401 and they must not be conflated.
    //
    // On the login request it means the email or password was rejected, so the
    // server's own message has to reach the form. Rewriting it to "your session
    // expired" is actively misleading: it points at the cookie when the real
    // problem is the credentials, and it fires the sign-out event on someone
    // who was never signed in.
    //
    // On every other request it means the cookie is gone or expired. Nothing
    // observes that cookie (it is httpOnly), so announce it and let the panel
    // drop back to the login form instead of showing "Not signed in" on every
    // action.
    if (res.status === 401 && !meta.isSignIn) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-unauthorized"));
      }
      return { data: null, error: new Error("Your session expired. Please sign in again.") };
    }

    if (!res.ok || (body && body.ok === false)) {
      return { data: null, error: new Error((body && body.error) || `Request failed (${res.status})`) };
    }
    return { data: body, error: null };
  } catch (e) {
    return { data: null, error: new Error(e.message || "Network error") };
  }
}

/* ---------- auth ---------- */

export const auth = {
  session: () => call("/api/admin/session"),
  signIn: (email, password) =>
    call("/api/admin/session", { method: "POST", body: JSON.stringify({ email, password }) }, { isSignIn: true }),
  signOut: () => call("/api/admin/session", { method: "DELETE" }),
};

/* ---------- cars ---------- */

export const cars = {
  list: () => call("/api/admin/cars"),
  save: (car) => call("/api/admin/cars", { method: "POST", body: JSON.stringify(car) }),
  remove: (id) => call(`/api/admin/cars/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/* ---------- single-row content ---------- */

export const content = {
  get: (part) => call(`/api/admin/content?part=${part}`),
  put: (part, payload) => call(`/api/admin/content?part=${part}`, { method: "PUT", body: JSON.stringify(payload) }),
};

/* ---------- leads ---------- */

export const leads = {
  list: () => call("/api/admin/leads"),
  setStatus: (id, status) =>
    call(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (id) => call(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/* ---------- happy customers ---------- */

export const happy = {
  list: () => call("/api/admin/happy"),
  add: (urls) => call("/api/admin/happy", { method: "POST", body: JSON.stringify({ urls }) }),
  update: (id, patch) =>
    call(`/api/admin/happy/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  remove: (id) => call(`/api/admin/happy/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/* ---------- media ---------- */

export const media = {
  list: () => call("/api/admin/media"),
  remove: (id) => call(`/api/admin/media/${encodeURIComponent(id)}`, { method: "DELETE" }),
  /** files: File[] — returns { data: { media: [...] } } */
  upload: (files) => {
    const fd = new FormData();
    for (const f of files) fd.append("file", f);
    return call("/api/admin/media", { method: "POST", body: fd });
  },
};
