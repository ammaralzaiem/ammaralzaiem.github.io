/* ============================================================
   editor.js — in-page edit mode.

   Open the page with #edit on the URL to switch it on:
     index.html#edit
   Visitors never see any of this.

   Edits are kept in this browser only (localStorage). Nothing is
   published until you hit "Export data.js" and drop the file back
   into the project — data.js stays the single source of truth.
   ============================================================ */

(function () {
  const P = window.Portfolio;
  const { STATE, el, clone, listOf, LIST_KEY } = P;

  /* Which fields each section kind exposes, and how to edit them.
     Add a `kind` here and in app.js BUILDERS to grow the system. */
  const SCHEMA = {
    register: [
      { k: "period", label: "Period", type: "text", ph: "Sep 2026 — Oct 2026" },
      { k: "status", label: "Status", type: "select", options: ["", "current", "progress", "done"] },
      { k: "title", label: "Role / title", type: "text" },
      { k: "org", label: "Organisation", type: "text" },
      { k: "meta", label: "Meta (optional)", type: "text", ph: "CGPA 3.31" },
      { k: "points", label: "Bullet points", type: "lines" }
    ],
    assessments: [
      { k: "target", label: "Target", type: "text" },
      { k: "environment", label: "Environment", type: "text", ph: "Local lab · Docker" },
      { k: "period", label: "Period", type: "text", ph: "2026" },
      { k: "summary", label: "Summary", type: "textarea" },
      { k: "scope", label: "Scope", type: "lines" },
      { k: "tools", label: "Tooling", type: "lines" },
      { k: "link", label: "Write-up URL (optional)", type: "text", ph: "https://github.com/..." }
    ],
    credentials: [
      { k: "kindLabel", label: "Kind", type: "text", ph: "Diploma · Career Path" },
      { k: "name", label: "Name", type: "text" },
      { k: "issuer", label: "Issuer", type: "text" },
      { k: "status", label: "Status", type: "select", options: ["progress", "done"] },
      { k: "awarded", label: "Awarded label", type: "text", ph: "Verified" },
      { k: "expected", label: "Expected", type: "text", ph: "In progress" },
      { k: "detail", label: "Detail", type: "textarea" },
      { k: "modules", label: "Modules", type: "lines" },
      { k: "link", label: "Credential URL", type: "text" }
    ],
    matrix: [
      { k: "label", label: "Group label", type: "text" },
      { k: "items", label: "Items", type: "lines" }
    ],
    prose: [{ k: "__text", label: "Paragraph", type: "textarea" }],
    contact: [{ k: "body", label: "Closing line", type: "textarea" }]
  };

  const BLANK = {
    register: { period: "", status: "", title: "New entry", org: "", meta: "", points: [] },
    assessments: { target: "New target", environment: "", period: "", summary: "", scope: [], tools: [], link: null },
    credentials: { kindLabel: "", name: "New credential", issuer: "", status: "progress", awarded: null, expected: "In progress", detail: "", modules: [], link: null },
    matrix: { label: "New group", items: [] },
    prose: "New paragraph."
  };

  const isEdit = () => document.body.classList.contains("editing");

  /* ---------------- field widgets ---------------- */

  function widget(spec, value, onInput) {
    let input;
    if (spec.type === "textarea") {
      input = el("textarea", "ed__input ed__input--area");
      input.rows = 4;
      input.value = value == null ? "" : String(value);
    } else if (spec.type === "lines") {
      input = el("textarea", "ed__input ed__input--area");
      input.rows = Math.max(3, (Array.isArray(value) ? value.length : 0) + 1);
      input.value = Array.isArray(value) ? value.join("\n") : "";
      input.placeholder = "One per line";
    } else if (spec.type === "select") {
      input = el("select", "ed__input");
      spec.options.forEach((o) => {
        const opt = el("option", null, o === "" ? "— none —" : o);
        opt.value = o;
        input.append(opt);
      });
      input.value = value == null ? "" : String(value);
    } else {
      input = el("input", "ed__input");
      input.type = "text";
      input.value = value == null ? "" : String(value);
      if (spec.ph) input.placeholder = spec.ph;
    }
    input.addEventListener("input", () => onInput(read(spec, input)));
    input.addEventListener("change", () => onInput(read(spec, input)));
    return input;
  }

  function read(spec, input) {
    if (spec.type === "lines") {
      return input.value.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    const v = input.value.trim();
    if (v === "" && (spec.k === "link" || spec.k === "awarded" || spec.k === "expected")) return null;
    return v;
  }

  function fieldRow(spec, value, onInput) {
    const row = el("label", "ed__field");
    row.append(el("span", "ed__label", spec.label));
    row.append(widget(spec, value, onInput));
    return row;
  }

  /* ---------------- modal editor ---------------- */

  let closeModal = null;

  function openModal(title, buildBody, onSave, onCancel) {
    if (closeModal) closeModal();
    let saved = false;

    const back = el("div", "ed__backdrop");
    const box = el("div", "ed__modal");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", title);

    const head = el("header", "ed__modalhead");
    head.append(el("h2", "ed__modaltitle", title));
    const x = el("button", "ed__x", "Close");
    x.type = "button";
    head.append(x);
    box.append(head);

    const body = el("div", "ed__modalbody");
    buildBody(body);
    box.append(body);

    const foot = el("footer", "ed__modalfoot");
    const cancel = el("button", "ed__btn", "Cancel");
    cancel.type = "button";
    const save = el("button", "ed__btn ed__btn--primary", "Save");
    save.type = "button";
    foot.append(cancel, save);
    box.append(foot);

    back.append(box);
    document.body.append(back);

    const prevFocus = document.activeElement;
    const first = box.querySelector(".ed__input");
    if (first) first.focus();

    closeModal = () => {
      back.remove();
      document.removeEventListener("keydown", onKey);
      closeModal = null;
      if (!saved && onCancel) onCancel();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") {
        const f = [...box.querySelectorAll("button, input, textarea, select")].filter((n) => !n.disabled);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);

    x.addEventListener("click", closeModal);
    cancel.addEventListener("click", closeModal);
    back.addEventListener("mousedown", (e) => { if (e.target === back) closeModal(); });
    save.addEventListener("click", () => { saved = true; onSave(); closeModal(); commit(); });
  }

  function commit() {
    P.saveDraft();
    P.render();
    syncBar();
  }

  /* ---------------- editing one item ---------------- */

  function editItem(sectionIndex, itemIndex, isNew) {
    const section = STATE.sections[sectionIndex];
    const list = listOf(section);
    const specs = SCHEMA[section.kind];
    if (!list || !specs) return;

    const isProse = section.kind === "prose";
    const draft = isProse ? { __text: list[itemIndex] } : clone(list[itemIndex]);

    openModal(
      `${isNew ? "Add to" : "Edit"} ${section.label}`,
      (body) => specs.forEach((s) => body.append(fieldRow(s, draft[s.k], (v) => { draft[s.k] = v; }))),
      () => { list[itemIndex] = isProse ? (draft.__text || "") : draft; },
      /* dismissed without saving: don't leave a placeholder behind */
      isNew ? () => {
        list.splice(itemIndex, 1);
        /* nothing actually changed — don't claim an unexported edit */
        if (STATE.hasDraft) commit(); else { P.render(); syncBar(); }
      } : null
    );
  }

  function addItem(sectionIndex) {
    const section = STATE.sections[sectionIndex];
    const list = listOf(section);
    if (!list) return;
    list.push(clone(BLANK[section.kind]));
    editItem(sectionIndex, list.length - 1, true);
  }

  function moveItem(sectionIndex, itemIndex, delta) {
    const list = listOf(STATE.sections[sectionIndex]);
    const to = itemIndex + delta;
    if (!list || to < 0 || to >= list.length) return;
    const [it] = list.splice(itemIndex, 1);
    list.splice(to, 0, it);
    commit();
  }

  function deleteItem(sectionIndex, itemIndex) {
    const section = STATE.sections[sectionIndex];
    const list = listOf(section);
    if (!list) return;
    if (!confirm(`Delete this item from ${section.label}? This can't be undone.`)) return;
    list.splice(itemIndex, 1);
    commit();
  }

  /* ---------------- editing a section itself ---------------- */

  function editSection(sectionIndex) {
    const s = STATE.sections[sectionIndex];
    const draft = { label: s.label, id: s.id, note: s.note || "", body: s.body };

    openModal("Section settings", (body) => {
      body.append(fieldRow({ k: "label", label: "Section title", type: "text" }, draft.label, (v) => { draft.label = v; }));
      body.append(fieldRow({ k: "id", label: "Anchor id (url #fragment)", type: "text" }, draft.id, (v) => { draft.id = v; }));
      body.append(fieldRow({ k: "note", label: "Margin note (optional)", type: "textarea" }, draft.note, (v) => { draft.note = v; }));
      if (s.kind === "contact") {
        body.append(fieldRow({ k: "body", label: "Closing line", type: "textarea" }, s.body, (v) => { draft.body = v; }));
      }
    }, () => {
      s.label = draft.label || s.label;
      s.id = (draft.id || s.id).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      s.note = draft.note || undefined;
      if (s.kind === "contact") s.body = draft.body;
    });
  }

  function moveSection(sectionIndex, delta) {
    const to = sectionIndex + delta;
    if (to < 0 || to >= STATE.sections.length) return;
    const [s] = STATE.sections.splice(sectionIndex, 1);
    STATE.sections.splice(to, 0, s);
    commit();
  }

  function deleteSection(sectionIndex) {
    const s = STATE.sections[sectionIndex];
    if (!confirm(`Delete the whole "${s.label}" section? This can't be undone.`)) return;
    STATE.sections.splice(sectionIndex, 1);
    commit();
  }

  function addSection() {
    const draft = { label: "New section", kind: "register", note: "" };
    openModal("Add a section", (body) => {
      body.append(fieldRow({ k: "label", label: "Section title", type: "text" }, draft.label, (v) => { draft.label = v; }));
      body.append(fieldRow({ k: "kind", label: "Layout", type: "select", options: Object.keys(LIST_KEY) }, draft.kind, (v) => { draft.kind = v; }));
      body.append(fieldRow({ k: "note", label: "Margin note (optional)", type: "textarea" }, draft.note, (v) => { draft.note = v; }));
    }, () => {
      const id = (draft.label || "section").replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") || "section";
      const s = { id, label: draft.label || "New section", kind: draft.kind };
      if (draft.note) s.note = draft.note;
      s[LIST_KEY[draft.kind]] = [];
      STATE.sections.push(s);
    });
  }

  /* ---------------- editing the profile ---------------- */

  function editProfile() {
    const d = clone(STATE.profile);
    openModal("Identity", (body) => {
      [
        { k: "name", label: "Name", type: "text" },
        { k: "role", label: "Role line", type: "text" },
        { k: "location", label: "Location", type: "text" },
        { k: "email", label: "Email", type: "text" },
        { k: "phone", label: "Phone", type: "text" }
      ].forEach((s) => body.append(fieldRow(s, d[s.k], (v) => { d[s.k] = v; })));

      body.append(fieldRow(
        { k: "links", label: "Links — one per line, as  Label | https://url", type: "lines" },
        d.links.map((l) => `${l.label} | ${l.href}`),
        (lines) => {
          d.links = lines.map((ln) => {
            const i = ln.indexOf("|");
            return i === -1
              ? { label: ln.trim(), href: ln.trim() }
              : { label: ln.slice(0, i).trim(), href: ln.slice(i + 1).trim() };
          }).filter((l) => l.label && l.href);
        }
      ));
    }, () => { STATE.profile = d; });
  }

  /* ---------------- export ---------------- */

  const HEADER = `/* ============================================================
   data.js — the only file you edit to update this portfolio.
   Nothing here is layout. Add an object, reload, it renders.

   Exported from the page's edit mode (#edit). Section numbers are
   derived from array order — never hardcode them.

   kind must be one of: prose | register | assessments |
                        credentials | matrix | contact
   status: 'current' | 'progress' | 'done'
   Leave a link as null and the renderer omits it.
   ============================================================ */\n\n`;

  function buildDataFile() {
    return HEADER +
      "const PROFILE = " + JSON.stringify(STATE.profile, null, 2) + ";\n\n" +
      "const SECTIONS = " + JSON.stringify(STATE.sections, null, 2) + ";\n";
  }

  async function exportData() {
    const text = buildDataFile();
    const filename = "data.js";

    /* Published artifacts block page-initiated downloads, so ask the
       host to save the file when it offers that; fall back to a plain
       download link everywhere else (local, GitHub Pages). */
    try {
      if (window.claude && typeof window.claude.use === "function") {
        const downloads = await window.claude.use("downloads");
        if (downloads) {
          await downloads.save({ filename, data: text });
          return;
        }
      }
    } catch (err) {
      if (err && err.code === "cancelled") return;
      /* fall through to the link */
    }

    try {
      const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
      const a = el("a");
      a.href = url;
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) {
      showCopyFallback(text);
    }
  }

  function showCopyFallback(text) {
    openModal("Copy data.js", (body) => {
      body.append(el("p", "ed__hint", "This view can't save files. Select all, copy, and paste over data.js in your project."));
      const ta = el("textarea", "ed__input ed__input--area ed__input--code");
      ta.rows = 18;
      ta.value = text;
      body.append(ta);
      setTimeout(() => { ta.focus(); ta.select(); }, 0);
    }, () => {});
  }

  /* ---------------- controls injected after each render ---------------- */

  function ctrlButton(label, title, fn) {
    const b = el("button", "ed__ctrl", label);
    b.type = "button";
    b.title = title;
    b.setAttribute("aria-label", title);
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
    return b;
  }

  function decorate() {
    document.querySelectorAll(".ed__secbar, .ed__itembar, .ed__addsection").forEach((n) => n.remove());
    if (!isEdit()) return;

    document.querySelectorAll(".section").forEach((sec) => {
      const si = Number(sec.dataset.sectionIndex);
      const section = STATE.sections[si];

      const bar = el("div", "ed__secbar");
      bar.append(ctrlButton("Edit section", "Edit this section's title and note", () => editSection(si)));
      bar.append(ctrlButton("↑", "Move section up", () => moveSection(si, -1)));
      bar.append(ctrlButton("↓", "Move section down", () => moveSection(si, 1)));
      bar.append(ctrlButton("Delete", "Delete this section", () => deleteSection(si)));
      if (listOf(section)) {
        const add = ctrlButton("+ Add", `Add an item to ${section.label}`, () => addItem(si));
        add.classList.add("ed__ctrl--primary");
        bar.append(add);
      }
      sec.querySelector(".section__head").after(bar);

      sec.querySelectorAll("[data-item-index]").forEach((item) => {
        const ii = Number(item.dataset.itemIndex);
        item.classList.add("ed__item");
        const tools = el("div", "ed__itembar");
        tools.append(ctrlButton("Edit", "Edit this item", () => editItem(si, ii)));
        tools.append(ctrlButton("↑", "Move up", () => moveItem(si, ii, -1)));
        tools.append(ctrlButton("↓", "Move down", () => moveItem(si, ii, 1)));
        tools.append(ctrlButton("✕", "Delete this item", () => deleteItem(si, ii)));
        item.append(tools);
      });
    });

    const addSec = el("button", "ed__addsection", "+ Add a section");
    addSec.type = "button";
    addSec.addEventListener("click", addSection);
    document.querySelector(".colophon").before(addSec);
  }

  /* ---------------- the edit bar ---------------- */

  let bar = null;

  function buildBar() {
    bar = el("div", "ed__bar");
    bar.id = "edBar";

    const status = el("span", "ed__status");
    status.id = "edStatus";
    bar.append(status);

    const spacer = el("span", "ed__spacer");
    bar.append(spacer);

    const mk = (label, cls, fn) => {
      const b = el("button", `ed__btn${cls ? " " + cls : ""}`, label);
      b.type = "button";
      b.addEventListener("click", fn);
      return b;
    };

    bar.append(mk("Identity", "", editProfile));
    bar.append(mk("Discard draft", "", () => {
      if (!confirm("Discard every local change and go back to the published version?")) return;
      P.clearDraft();
      P.render();
      syncBar();
    }));
    bar.append(mk("Export data.js", "ed__btn--primary", exportData));
    bar.append(mk("Exit", "", () => {
      history.replaceState(null, "", location.pathname + location.search);
      document.body.classList.remove("editing");
      P.render();
      syncBar();
    }));

    document.body.append(bar);
  }

  function syncBar() {
    if (!bar) return;
    const s = document.getElementById("edStatus");
    s.textContent = STATE.hasDraft
      ? "Edit mode · unexported local changes"
      : "Edit mode · matching the published version";
    s.classList.toggle("ed__status--dirty", STATE.hasDraft);
    pill();
  }

  /* a quiet marker when a draft exists but you're NOT in edit mode,
     so the page you're looking at is never silently different */
  function pill() {
    const existing = document.getElementById("edPill");
    if (existing) existing.remove();
    if (isEdit() || !STATE.hasDraft) return;
    const a = el("a", "ed__pill", "Local draft — not published");
    a.id = "edPill";
    a.href = "#edit";
    a.addEventListener("click", () => setTimeout(enter, 0));
    document.body.append(a);
  }

  function enter() {
    if (document.body.classList.contains("editing")) return;
    document.body.classList.add("editing");
    if (!bar) buildBar();
    P.render();
    syncBar();
  }

  document.addEventListener("portfolio:rendered", () => { decorate(); pill(); });

  if (location.hash === "#edit") enter();
  window.addEventListener("hashchange", () => { if (location.hash === "#edit") enter(); });

  /* app.js rendered before this file parsed, so no event fired for that pass */
  pill();
})();
