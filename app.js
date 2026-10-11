/* ============================================================
   app.js — renders whatever is in STATE (seeded from data.js).
   You shouldn't need to touch this to add content; only to add
   a new `kind`. Edit-mode lives in editor.js.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const pad2 = (n) => String(n).padStart(2, "0");
const clone = (v) => JSON.parse(JSON.stringify(v));

const DRAFT_KEY = "az-portfolio-draft";

/* ---- state: the seed from data.js, overlaid with any local draft ---- */
const STATE = { profile: clone(PROFILE), sections: clone(SECTIONS), hasDraft: false };

(function loadDraft() {
  let raw = null;
  try { raw = localStorage.getItem(DRAFT_KEY); } catch (_) { return; }
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d && d.profile && Array.isArray(d.sections)) {
      STATE.profile = d.profile;
      STATE.sections = d.sections;
      STATE.hasDraft = true;
    }
  } catch (_) { /* corrupt draft — ignore it, keep the seed */ }
})();

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ profile: STATE.profile, sections: STATE.sections }));
    STATE.hasDraft = true;
  } catch (_) { /* storage blocked — the edit still shows, it just won't survive reload */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  STATE.profile = clone(PROFILE);
  STATE.sections = clone(SECTIONS);
  STATE.hasDraft = false;
}

/* which array holds a section's repeatable items, per kind */
const LIST_KEY = { register: "entries", assessments: "entries", credentials: "entries", matrix: "groups", prose: "body" };
const listOf = (section) => {
  const k = LIST_KEY[section.kind];
  return k && Array.isArray(section[k]) ? section[k] : null;
};

const STATUS_TEXT = { current: "Current", progress: "In progress", done: "Complete" };
const statusChip = (status) => {
  if (!status || !STATUS_TEXT[status]) return null;
  return el("span", `chip chip--${status}`, STATUS_TEXT[status]);
};

/* ---- a labelled field with a row of tags (scope / tools / modules) ---- */
function fieldOfTags(label, items, tagCls) {
  const wrap = el("div", "field");
  wrap.append(el("div", "field__label", label));
  const ul = el("ul", "tags");
  items.forEach((t) => ul.append(el("li", tagCls ? `tag ${tagCls}` : "tag", t)));
  wrap.append(ul);
  return wrap;
}

/* =====================  SECTION BUILDERS  ===================== */

const BUILDERS = {
  prose(section) {
    const box = el("div", "prose");
    section.body.forEach((p, i) => {
      const para = el("p", null, p);
      para.dataset.itemIndex = i;
      box.append(para);
    });
    return [box];
  },

  register(section) {
    const reg = el("div", "register");
    section.entries.forEach((e, i) => {
      const row = el("article", "entry reveal");
      row.dataset.itemIndex = i;

      const gutter = el("div", "entry__gutter");
      gutter.append(el("time", "entry__period", e.period));
      const chip = statusChip(e.status);
      if (chip) gutter.append(chip);

      const body = el("div", "entry__body");
      body.append(el("h3", "entry__title", e.title));

      const org = el("p", "entry__org");
      org.append(document.createTextNode(e.org || ""));
      if (e.meta) {
        org.append(document.createTextNode("  ·  "));
        org.append(el("span", "entry__meta", e.meta));
      }
      body.append(org);

      if (e.points && e.points.length) {
        const ul = el("ul", "points");
        e.points.forEach((p) => ul.append(el("li", null, p)));
        body.append(ul);
      }

      row.append(gutter, body);
      reg.append(row);
    });
    return [reg];
  },

  assessments(section) {
    const grid = el("div", "assessments");
    section.entries.forEach((a, i) => {
      const card = el("article", "assess reveal");
      card.dataset.itemIndex = i;

      const top = el("div", "assess__top");
      top.append(el("h3", "assess__target", a.target));
      top.append(el("span", "assess__period", a.period));
      card.append(top);

      if (a.environment) card.append(el("p", "assess__env", a.environment));
      if (a.summary) card.append(el("p", "assess__summary", a.summary));
      if (a.scope && a.scope.length) card.append(fieldOfTags("Scope", a.scope));
      if (a.tools && a.tools.length) card.append(fieldOfTags("Tooling", a.tools, "tag--tool"));

      if (a.link) {
        const link = el("a", "assess__link", "Read the write-up →");
        link.href = a.link;
        link.rel = "noopener";
        link.target = "_blank";
        card.append(link);
      }

      grid.append(card);
    });
    return [grid];
  },

  credentials(section) {
    const list = el("div", "creds");
    section.entries.forEach((c, i) => {
      const row = el("article", "cred reveal");
      row.dataset.itemIndex = i;

      const main = el("div", "cred__main");
      if (c.kindLabel) main.append(el("div", "cred__kind", c.kindLabel));
      main.append(el("h3", "cred__name", c.name));
      main.append(el("p", "cred__issuer", c.issuer));
      if (c.detail) main.append(el("p", "cred__detail", c.detail));
      if (c.modules && c.modules.length) {
        const mods = fieldOfTags("Modules", c.modules);
        mods.classList.add("cred__modules");
        main.append(mods);
      }

      const aside = el("div", "cred__aside");
      if (c.status === "progress") {
        const stamp = el("div", "stamp");
        stamp.append(document.createTextNode("In progress"));
        if (c.expected && c.expected !== "In progress") stamp.append(el("small", null, c.expected));
        aside.append(stamp);
      } else if (c.awarded) {
        aside.append(el("span", "chip chip--done", c.awarded));
      }
      if (c.link) {
        const v = el("a", "cred__verify", "Verify →");
        v.href = c.link;
        v.rel = "noopener";
        v.target = "_blank";
        aside.append(v);
      }

      row.append(main, aside);
      list.append(row);
    });
    return [list];
  },

  matrix(section) {
    const box = el("div", "matrix");
    section.groups.forEach((g, i) => {
      const row = el("div", "matrix__row reveal");
      row.dataset.itemIndex = i;
      row.append(el("div", "matrix__label", g.label));
      const ul = el("ul", "tags");
      (g.items || []).forEach((it) => ul.append(el("li", "tag", it)));
      row.append(ul);
      box.append(row);
    });
    return [box];
  },

  contact(section) {
    const box = el("div", "contact");
    if (section.body) box.append(el("p", null, section.body));

    const grid = el("div", "contact__grid");
    const p = STATE.profile;
    const items = [
      { k: "Email", v: p.email, href: `mailto:${p.email}` },
      { k: "Phone", v: p.phone, href: `tel:${String(p.phone).replace(/\s/g, "")}` },
      ...p.links.map((l) => ({ k: l.label, v: l.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: l.href }))
    ];
    items.forEach(({ k, v, href }) => {
      const cell = el("div", "contact__item");
      cell.append(el("div", "contact__k", k));
      const a = el("a", "contact__v", v);
      a.href = href;
      if (href.startsWith("http")) { a.rel = "noopener"; a.target = "_blank"; }
      cell.append(a);
      grid.append(cell);
    });
    box.append(grid);
    return [box];
  }
};

/* =====================  RENDER  ===================== */

function renderRail() {
  const p = STATE.profile;
  $("#railName").textContent = p.name;
  $("#railRole").textContent = p.role;
  $("#railLoc").textContent = p.location;

  const idx = $("#index");
  idx.textContent = "";
  STATE.sections.forEach((s, i) => {
    const a = el("a", "index__item");
    a.href = `#${s.id}`;
    a.dataset.target = s.id;
    a.append(el("span", "index__num", pad2(i + 1)));
    a.append(el("span", "index__label", s.label));
    idx.append(a);
  });

  const links = $("#railLinks");
  links.textContent = "";
  p.links.forEach((l) => {
    const a = el("a", "rail__link", l.label);
    a.href = l.href;
    a.rel = "noopener";
    a.target = "_blank";
    links.append(a);
  });
}

function renderSections() {
  const main = $("#main");
  main.textContent = "";

  STATE.sections.forEach((s, i) => {
    const build = BUILDERS[s.kind];
    if (!build) { console.warn(`data.js: unknown section kind "${s.kind}"`); return; }

    const sec = el("section", "section");
    sec.id = s.id;
    sec.dataset.sectionIndex = i;

    const head = el("header", "section__head");
    head.append(el("span", "section__num", pad2(i + 1)));
    head.append(el("h2", "section__title", s.label));
    if (s.note) head.append(el("p", "section__note", s.note));
    sec.append(head);

    build(s).forEach((node) => sec.append(node));
    main.append(sec);
  });

  const colophon = el("footer", "colophon");
  colophon.append(el("span", null, `${STATE.profile.name} — ${STATE.profile.location}`));
  colophon.append(el("span", null, `Last revised ${new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`));
  main.append(colophon);
}

/* ---- rail highlight follows the section you're reading ---- */
let spyObs = null;
function wireScrollSpy() {
  if (spyObs) spyObs.disconnect();
  const items = [...document.querySelectorAll(".index__item")];
  const setCurrent = (id) => items.forEach((a) => a.setAttribute("aria-current", String(a.dataset.target === id)));

  spyObs = new IntersectionObserver((rows) => {
    const visible = rows.filter((r) => r.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setCurrent(visible[0].target.id);
  }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

  document.querySelectorAll(".section").forEach((s) => spyObs.observe(s));
  if (STATE.sections[0]) setCurrent(STATE.sections[0].id);
}

function wireReveal() {
  const targets = [...document.querySelectorAll(".reveal:not(.in)")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((t) => t.classList.add("in"));
    return;
  }
  const obs = new IntersectionObserver((rows) => {
    rows.forEach((r, n) => {
      if (!r.isIntersecting) return;
      r.target.style.transitionDelay = `${Math.min(n, 6) * 45}ms`;
      r.target.classList.add("in");
      obs.unobserve(r.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  targets.forEach((t) => obs.observe(t));
}

/* ---- theme toggle: writes data-theme so it beats the OS either way ---- */
function wireTheme() {
  const btn = $("#themeToggle");
  const root = document.documentElement;
  let stored = null;
  try { stored = localStorage.getItem("az-theme"); } catch (_) {}
  if (stored === "dark" || stored === "light") root.setAttribute("data-theme", stored);

  const isDark = () => {
    const a = root.getAttribute("data-theme");
    if (a) return a === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const sync = () => { btn.textContent = isDark() ? "Light" : "Dark"; };

  btn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("az-theme", next); } catch (_) {}
    sync();
  });
  sync();
}

/* full re-render — editor.js calls this after every change */
function render() {
  renderRail();
  renderSections();
  wireScrollSpy();
  wireReveal();
  document.dispatchEvent(new CustomEvent("portfolio:rendered"));
}

window.Portfolio = { STATE, render, saveDraft, clearDraft, listOf, LIST_KEY, el, clone, pad2 };

render();
wireTheme();
