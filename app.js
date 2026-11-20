/* Mein WortSchatz – Vokabeltrainer, läuft komplett im Browser.
   Alle Daten liegen nur auf diesem Gerät (localStorage). */
(function () {
  "use strict";

  const KEY = "wortschatz.v1";
  const INTERVAL = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 }; // Tage bis zur nächsten Abfrage je Fach
  const MASTER_INTERVAL = 30;
  const BOX_COLORS = ["var(--f1)", "var(--f2)", "var(--f3)", "var(--f4)", "var(--f5)"];

  /* ---------- Hilfsfunktionen ---------- */
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function today() { return dayStr(new Date()); }
  function dayStr(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(str, n) { const [y, m, d] = str.split("-").map(Number); const dt = new Date(y, m - 1, d + n); return dayStr(dt); }

  /* ---------- Daten ---------- */
  function freshState() {
    const units = [
      { id: "u-welcome", title: "Welcome", group: "buch", active: true },
      ...[1, 2, 3, 4, 5].map((n) => ({ id: "u-" + n, title: "Unit " + n, group: "buch", active: true }))
    ];
    const words = [];
    const t = today();
    (window.STARTER_PACKS || []).forEach((p, i) => {
      const id = "x-" + (i + 1);
      units.push({ id, title: p.title, group: "extra", active: false });
      p.words.forEach(([en, de, ex]) => words.push(newWord(en, de, id, ex || "", t)));
    });
    return {
      version: 1,
      profile: { name: "", coins: 0, streak: 0, lastDay: null },
      settings: { rate: 0.9, autoSpeak: true, lastUnit: "u-welcome", quiz: { source: "due", mode: "mix", dir: "mix", len: 10 } },
      units, words, log: {}
    };
  }
  function newWord(en, de, unit, ex, t) {
    return { id: uid(), en: en.trim(), de: de.trim(), unit, ex: (ex || "").trim(), box: 1, due: t || today(), right: 0, wrong: 0, created: Date.now() };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); if (d && d.version === 1 && Array.isArray(d.words)) return d; }
    } catch (e) { /* defekt -> neu anlegen */ }
    return freshState();
  }
  let S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast("Speichern hat nicht geklappt. Ist der Speicher voll?"); }
  }
  save();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const unitById = (id) => S.units.find((u) => u.id === id);
  const wordsOf = (id) => S.words.filter((w) => w.unit === id);
  const activeWords = () => { const act = new Set(S.units.filter((u) => u.active).map((u) => u.id)); return S.words.filter((w) => act.has(w.unit)); };
  const dueWords = () => { const t = today(); return activeWords().filter((w) => w.due <= t); };

  /* ---------- Sprachausgabe ---------- */
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => v.lang === "en-GB") || vs.find((v) => /^en[-_]GB/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    const clean = text.replace(/\(to\)\s*/gi, "").replace(/\bsb\b/g, "somebody").replace(/\bsth\b/g, "something");
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-GB"; if (voice) u.voice = voice;
    u.rate = S.settings.rate || 0.9;
    speechSynthesis.speak(u);
  }

  /* ---------- Antwort prüfen ---------- */
  const ART = { de: /^(der|die|das|ein|eine|einen|einem|einer)\s+/, en: /^(a|an|the|to)\s+/ };
  function norm(s, lang) {
    let x = String(s).toLowerCase().replace(/[’`´']/g, "").replace(/\(to\)/g, " ").replace(/\([^)]*\)/g, " ");
    x = x.replace(/[.!?¿¡"„“:]/g, " ").replace(/\s+/g, " ").trim();
    if (ART[lang]) x = x.replace(ART[lang], "");
    return x;
  }
  function variants(target, lang) {
    const set = new Set([norm(target, lang)]);
    target.split(/[,;\/]/).forEach((p) => { const n = norm(p, lang); if (n) set.add(n); });
    return [...set].filter(Boolean);
  }
  function lev(a, b) {
    const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 3;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function check(input, target, lang) {
    const a = norm(input, lang); if (!a) return "no";
    const vs = variants(target, lang);
    if (vs.includes(a)) return "ok";
    if (vs.some((v) => { const d = lev(a, v); return (v.length >= 4 && d <= 1) || (v.length >= 9 && d <= 2); })) return "almost";
    return "no";
  }

  /* ---------- Lernkartei-Logik ---------- */
  function grade(w, ok) {
    const t = today();
    if (ok) {
      w.right++;
      if (w.box >= 5) w.due = addDays(t, MASTER_INTERVAL);
      else { w.box++; w.due = addDays(t, INTERVAL[w.box]); }
    } else {
      w.wrong++; w.box = 1; w.due = t;
    }
  }
  function boxCounts(list) { const c = [0, 0, 0, 0, 0]; list.forEach((w) => c[Math.min(5, Math.max(1, w.box)) - 1]++); return c; }

  /* ---------- Icons ---------- */
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h8"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- Ansicht-Zustand ---------- */
  let view = "start";
  let unitView = null;
  let search = "";
  let Q = null; // laufende Übung
  let installEvt = null;

  function go(v, arg) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    view = v; if (v === "unit") unitView = arg;
    render(); window.scrollTo(0, 0);
  }

  function render() {
    const m = $("#main");
    document.body.classList.toggle("in-quiz", view === "quiz");
    $("#tabs").hidden = view === "quiz";
    const tab = view === "unit" ? "woerter" : view;
    document.querySelectorAll("#tabs button").forEach((b) => b.setAttribute("aria-current", b.dataset.go === tab ? "page" : "false"));
    const fn = { start: vStart, ueben: vUeben, woerter: vWoerter, unit: vUnit, ich: vIch, quiz: vQuiz }[view] || vStart;
    m.innerHTML = fn();
    if (view === "quiz") afterQuizRender();
  }

  /* ---------- Start ---------- */
  function vStart() {
    const name = S.profile.name;
    const act = activeWords(); const due = dueWords().length; const c = boxCounts(act);
    const streak = currentStreak();
    let duePanel;
    if (!act.length) {
      duePanel = `<div class="panel due-panel"><h2>Trag deine ersten Vokabeln ein</h2>
        <p class="muted">Schreib die Wörter aus deinem Englischbuch ab. Beim Eintippen lernst du sie schon zum ersten Mal.</p>
        <button class="btn big" data-a="add">Neues Wort eintragen</button></div>`;
    } else if (due > 0) {
      duePanel = `<div class="panel due-panel"><h2>${due} ${due === 1 ? "Wort wartet" : "Wörter warten"} auf dich</h2>
        <button class="btn big" data-a="quick">Jetzt üben</button></div>`;
    } else {
      duePanel = `<div class="panel due-panel"><h2>Für heute ist alles geübt</h2>
        <p class="muted">Morgen kommen die nächsten Karten dran. Du kannst trotzdem weiterüben.</p>
        <button class="btn big ghost" data-go="ueben">Trotzdem üben</button></div>`;
    }
    const nameBox = name ? "" : `<form class="panel stack" data-form="name"><label class="field"><span>Wie heißt du?</span>
        <input name="n" autocomplete="given-name" maxlength="24" placeholder="Dein Vorname"></label>
        <button class="btn" type="submit">Los geht’s</button></form>`;
    const maxStack = 16;
    const faecher = c.map((n, i) => {
      const slices = Math.min(maxStack, n);
      return `<div class="fach" style="--c:${BOX_COLORS[i]}"><div class="stapel">${"<i></i>".repeat(slices)}</div>
        <div class="fach-label"><b>${n}</b>Fach ${i + 1}</div></div>`;
    }).join("");
    const install = installEvt ? `<button class="btn ghost" data-a="install">Als App auf den Startbildschirm</button>` : "";
    return `<div class="stack">
      <div class="hello"><h1>${name ? "Hallo, " + esc(name) + "!" : "Hallo!"}</h1>
        <div class="row"><span class="pill" title="Tage am Stück geübt">🔥 ${streak}</span><span class="pill" title="Münzen"><i class="coin"></i> ${S.profile.coins}</span></div></div>
      ${nameBox}
      ${duePanel}
      <section class="kasten" aria-label="Dein Karteikasten">
        <p class="kasten-title">Dein Karteikasten</p>
        <div class="faecher">${faecher}</div>
        <p class="kasten-legende">Richtig beantwortet: Die Karte rutscht ein Fach weiter. Falsch: zurück in Fach 1. Wörter in Fach 5 sitzen richtig fest.</p>
      </section>
      ${install}
    </div>
    <button class="btn fab" data-a="add">${I.plus} Neues Wort</button>`;
  }
  function currentStreak() {
    const t = today(); const l = S.profile.lastDay;
    if (l === t || l === addDays(t, -1)) return S.profile.streak || 0;
    return 0;
  }

  /* ---------- Üben (Einstellungen) ---------- */
  function vUeben() {
    const q = S.settings.quiz;
    const due = dueWords().length;
    const unitsWithWords = S.units.filter((u) => wordsOf(u.id).length);
    if (!S.words.length) return `<div class="stack"><h1>Üben</h1>${emptyWords()}</div>`;
    const chip = (key, val, label) => `<button class="chip" data-a="qset" data-k="${key}" data-v="${esc(val)}" aria-pressed="${String(q[key]) === String(val)}">${label}</button>`;
    return `<div class="stack">
      <h1>Üben</h1>
      <div class="panel stack"><h3>Was möchtest du üben?</h3>
        <div class="chips">${chip("source", "due", "Fällige Wörter (" + due + ")")}${unitsWithWords.map((u) => chip("source", u.id, esc(u.title) + " (" + wordsOf(u.id).length + ")")).join("")}</div></div>
      <div class="panel stack"><h3>Wie?</h3>
        <div class="chips">${chip("mode", "mix", "Gemischt")}${chip("mode", "card", "Karteikarte")}${chip("mode", "choice", "Auswählen")}${chip("mode", "type", "Schreiben")}</div></div>
      <div class="panel stack"><h3>In welche Richtung?</h3>
        <div class="chips">${chip("dir", "mix", "Gemischt")}${chip("dir", "en-de", "Englisch → Deutsch")}${chip("dir", "de-en", "Deutsch → Englisch")}</div></div>
      <div class="panel stack"><h3>Wie viele Wörter?</h3>
        <div class="chips">${chip("len", 10, "10")}${chip("len", 20, "20")}${chip("len", 0, "Alle")}</div></div>
      <button class="btn big" data-a="start-quiz">Übung starten</button>
    </div>`;
  }

  function buildQuiz(source) {
    const q = S.settings.quiz; source = source || q.source;
    let pool;
    if (source === "due") pool = dueWords();
    else pool = wordsOf(source);
    if (!pool.length) {
      if (source === "due") { toast("Gerade ist nichts fällig. Wähl eine Unit aus."); go("ueben"); }
      else toast("In dieser Unit stehen noch keine Wörter.");
      return;
    }
    // Wörter aus niedrigen Fächern zuerst, sonst zufällig
    pool = shuffle(pool).sort((a, b) => a.box - b.box);
    if (q.len) pool = pool.slice(0, q.len);
    pool = shuffle(pool);
    const items = pool.map((w) => ({ id: w.id, dir: q.dir === "mix" ? pick(["en-de", "de-en"]) : q.dir, mode: q.mode === "mix" ? pick(["card", "choice", "type"]) : q.mode, retry: false }));
    Q = { items, i: 0, firstRight: 0, total: items.length, coins: 0, state: "ask", result: null, picked: null, retried: new Set() };
    go("quiz");
  }

  /* ---------- Übung ---------- */
  function cur() { const it = Q.items[Q.i]; return { it, w: S.words.find((w) => w.id === it.id) }; }
  function choiceOptions(w, dir) {
    const field = dir === "en-de" ? "de" : "en";
    const right = w[field];
    const same = shuffle(S.words.filter((x) => x.unit === w.unit && x.id !== w.id).map((x) => x[field]));
    const other = shuffle(S.words.filter((x) => x.unit !== w.unit).map((x) => x[field]));
    const opts = [right]; const seen = new Set([norm(right, "x")]);
    for (const o of [...same, ...other]) { const n = norm(o, "x"); if (!seen.has(n)) { seen.add(n); opts.push(o); } if (opts.length === 4) break; }
    return opts.length < 4 ? null : shuffle(opts);
  }

  function vQuiz() {
    if (!Q) return vStart();
    if (Q.i >= Q.items.length) return vDone();
    const { it, w } = cur();
    if (!w) { Q.i++; return vQuiz(); }
    if (it.mode === "choice" && !it.opts) { it.opts = choiceOptions(w, it.dir); if (!it.opts) it.mode = "card"; }
    const en2de = it.dir === "en-de";
    const prompt = en2de ? w.en : w.de;
    const answer = en2de ? w.de : w.en;
    const color = BOX_COLORS[w.box - 1];
    const pct = Math.round((Q.i / Q.items.length) * 100);
    const speakBtn = en2de || Q.state !== "ask" ? `<button class="iconbtn speak" data-a="say" data-t="${esc(w.en)}" aria-label="Englisch vorlesen">${I.speaker}</button>` : "";
    let body = "";
    const shown = Q.state !== "ask";

    if (it.mode === "card") {
      body = !shown
        ? `<button class="btn big ghost" data-a="reveal">Umdrehen</button>`
        : `<p class="muted" style="text-align:center">Hast du es gewusst?</p>
           <div class="row"><button class="btn big no" data-a="card-no">Nein</button><button class="btn big ok" data-a="card-yes">Ja</button></div>`;
    } else if (it.mode === "choice") {
      body = `<div class="choices">${it.opts.map((o, k) => {
        let cls = "choice";
        if (shown && o === answer) cls += " right";
        else if (shown && k === Q.picked) cls += " wrongpick";
        return `<button class="${cls}" data-a="choose" data-k="${k}" ${shown ? "disabled" : ""}>${esc(o)}</button>`;
      }).join("")}</div>`;
      if (shown) body += feedback(it, w, answer) + nextBtn();
    } else {
      body = `<form class="typebox stack" data-form="type" autocomplete="off">
          <label class="field"><span>${en2de ? "Auf Deutsch:" : "Auf Englisch:"}</span>
          <input name="a" ${shown ? "disabled" : ""} autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></label>
          ${shown ? "" : `<button class="btn big" type="submit">Prüfen</button>`}</form>`;
      if (shown) body += feedback(it, w, answer) + nextBtn();
    }
    const revealed = it.mode === "card" && shown
      ? `<p class="answer">${esc(answer)}</p>${w.ex ? `<p class="ex">${esc(w.ex)}</p>` : ""}` : "";
    return `<div class="stack">
      <div class="quiz-top"><button class="iconbtn" data-a="quit" aria-label="Übung beenden">${I.close}</button>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <span class="pill"><i class="coin"></i> ${Q.coins}</span></div>
      <div class="karte" style="--c:${color}">
        <span class="fachtag">Fach ${w.box}${it.retry ? " · nochmal" : ""}</span>${speakBtn}
        <p class="dir">${en2de ? "Was heißt das auf Deutsch?" : "Was heißt das auf Englisch?"}</p>
        <p class="prompt" lang="${en2de ? "en" : "de"}">${esc(prompt)}</p>
        ${revealed}
      </div>
      ${body}
    </div>`;
  }
  function feedback(it, w, answer) {
    const r = Q.result;
    if (r === "ok") return `<div class="feedback good">Richtig!${it.mode === "type" && norm(Q.typed || "", "x") !== norm(answer, "x") ? `<span class="sol">${esc(answer)}</span>` : ""}</div>`;
    const almost = r === "almost";
    return `<div class="feedback bad">${almost ? "Fast! Schau genau auf die Schreibweise." : "Leider nicht."}<span class="sol">${esc(answer)}</span>
      ${w.ex ? `<span class="small" style="font-weight:400;font-style:italic">${esc(w.ex)}</span>` : ""}</div>
      ${it.mode === "type" ? `<button class="linkbtn" data-a="override">Meine Antwort war auch richtig</button>` : ""}`;
  }
  function nextBtn() { return `<button class="btn big" data-a="next" id="nextbtn">Weiter</button>`; }

  function afterQuizRender() {
    if (!Q || Q.i >= Q.items.length) return;
    const { it, w } = cur();
    if (!w) return;
    const inp = document.querySelector('[data-form="type"] input');
    if (inp && !inp.disabled) inp.focus();
    const nb = $("#nextbtn"); if (nb) nb.focus();
    if (S.settings.autoSpeak) {
      if (Q.state === "ask" && it.dir === "en-de" && !Q.spokenFor) { Q.spokenFor = it; speak(w.en); }
      if (Q.state !== "ask" && it.dir === "de-en" && Q.spokenFor !== it) { Q.spokenFor = it; speak(w.en); }
    }
  }
  function answerWith(ok) {
    Q.result = ok === true ? "ok" : ok;
    Q.state = "shown";
    render();
  }
  function nextItem() {
    const { it, w } = cur();
    const ok = Q.result === "ok";
    if (!it.retry) {
      grade(w, ok);
      if (ok) { Q.firstRight++; Q.coins++; }
      S.log[today()] = (S.log[today()] || 0) + 1;
    }
    if (!ok && !Q.retried.has(it.id)) { Q.retried.add(it.id); Q.items.push({ id: it.id, dir: it.dir, mode: it.mode === "choice" ? "type" : it.mode, retry: true }); }
    save();
    Q.i++; Q.state = "ask"; Q.result = null; Q.picked = null; Q.typed = ""; Q.spokenFor = null;
    if (Q.i >= Q.items.length) finishQuiz();
    render(); window.scrollTo(0, 0);
  }
  function finishQuiz() {
    const t = today();
    if (S.profile.lastDay !== t) {
      S.profile.streak = S.profile.lastDay === addDays(t, -1) ? (S.profile.streak || 0) + 1 : 1;
      S.profile.lastDay = t;
    }
    Q.bonus = Q.total >= 5 ? 5 : 0;
    S.profile.coins += Q.coins + Q.bonus;
    save();
  }
  function vDone() {
    const r = Q.firstRight, n = Q.total;
    const msg = r === n ? "Alles richtig – stark!" : r >= n * 0.7 ? "Super gemacht!" : r >= n * 0.4 ? "Gut geübt! Die schwierigen Wörter kommen bald wieder." : "Dranbleiben lohnt sich! Morgen sitzt schon mehr.";
    return `<div class="stack done">
      <h1>${msg}</h1>
      <div class="panel stack"><p class="big-coins burst"><i class="coin" style="width:44px;height:44px;vertical-align:-6px"></i> +${Q.coins + Q.bonus}</p>
        <p>${r} von ${n} Wörtern beim ersten Versuch richtig${Q.bonus ? ", dazu 5 Bonus-Münzen" : ""}.</p>
        <p class="muted">🔥 ${currentStreak()} ${currentStreak() === 1 ? "Tag" : "Tage"} am Stück geübt</p></div>
      <button class="btn big" data-a="done">Fertig</button>
      ${dueWords().length ? `<button class="btn big ghost" data-a="quick">Noch eine Runde</button>` : ""}
    </div>`;
  }

  /* ---------- Wörter ---------- */
  function emptyWords() {
    return `<div class="empty"><p><b>Hier ist noch nichts.</b></p><p class="muted">Trag Wörter aus deinem Englischbuch ein, dann kannst du sie üben.</p>
      <p style="margin-top:16px"><button class="btn" data-a="add">Neues Wort eintragen</button></p></div>`;
  }
  function unitRow(u) {
    const ws = wordsOf(u.id); const c = boxCounts(ws); const n = ws.length;
    const bar = n ? c.map((k, i) => `<i style="width:${(k / n) * 100}%;background:${BOX_COLORS[i]}"></i>`).join("") : "";
    const sw = u.group === "extra" ? `<label class="switch" title="In Übungen aufnehmen"><input type="checkbox" data-a="toggle" data-id="${u.id}" ${u.active ? "checked" : ""} aria-label="${esc(u.title)} in Übungen aufnehmen"><span></span></label>` : "";
    return `<li class="row"><button class="unit ${u.active ? "" : "off"}" data-a="open" data-id="${u.id}">
      <span class="meta"><span class="name">${esc(u.title)}</span><br><span class="sub">${n} ${n === 1 ? "Wort" : "Wörter"}${c[4] ? ", " + c[4] + " sitzen fest" : ""}</span>
      ${n ? `<span class="bar">${bar}</span>` : ""}</span>${I.chev}</button>${sw}</li>`;
  }
  function wordRow(w, showUnit) {
    const dots = [1, 2, 3, 4, 5].map((b) => `<i class="${b <= w.box ? "on" : ""}"></i>`).join("");
    const u = showUnit ? unitById(w.unit) : null;
    return `<li class="word"><button class="iconbtn" data-a="say" data-t="${esc(w.en)}" aria-label="${esc(w.en)} vorlesen">${I.speaker}</button>
      <div class="w"><div class="en" lang="en">${esc(w.en)}</div><div class="de">${esc(w.de)}</div>${w.ex ? `<div class="ex" lang="en">${esc(w.ex)}</div>` : ""}
      ${u ? `<div class="small muted">${esc(u.title)}</div>` : ""}</div>
      <span class="dots" style="--c:${BOX_COLORS[w.box - 1]}" title="Fach ${w.box}">${dots}</span>
      <button class="iconbtn" data-a="edit" data-id="${w.id}" aria-label="${esc(w.en)} bearbeiten">${I.edit}</button></li>`;
  }
  function vWoerter() {
    const book = S.units.filter((u) => u.group === "buch");
    const extra = S.units.filter((u) => u.group === "extra");
    let list;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      const hits = S.words.filter((w) => (w.en + " " + w.de).toLowerCase().includes(s));
      list = hits.length ? `<ul class="wordlist">${hits.slice(0, 80).map((w) => wordRow(w, true)).join("")}</ul>`
        : `<div class="empty"><p>„${esc(search)}“ steht noch nicht drin.</p><p style="margin-top:14px"><button class="btn" data-a="add" data-en="${esc(search)}">Als neues Wort eintragen</button></p></div>`;
    } else {
      list = `<div class="group-title"><h2>Mein Englischbuch</h2><button class="linkbtn" data-a="new-unit">Unit hinzufügen</button></div>
        <ul class="unitlist">${book.map(unitRow).join("")}</ul>
        ${extra.length ? `<div class="group-title"><h2>Extra-Wortschatz</h2></div>
        <p class="muted small" style="margin-top:6px">Grundwortschatz für die 5. Klasse. Schalte ein, was du mitüben willst.</p>
        <ul class="unitlist">${extra.map(unitRow).join("")}</ul>` : ""}`;
    }
    return `<div class="stack"><h1>Wörter</h1>
      <label class="field"><span class="sr">Suchen</span><input type="search" id="search" placeholder="Wort suchen …" value="${esc(search)}" data-a="search"></label>
      <div id="wlist">${list}</div></div>
      <button class="btn fab" data-a="add">${I.plus} Neues Wort</button>`;
  }
  function vUnit() {
    const u = unitById(unitView); if (!u) { view = "woerter"; return vWoerter(); }
    const ws = wordsOf(u.id).sort((a, b) => a.created - b.created);
    return `<div class="stack">
      <div class="row"><button class="iconbtn" data-go="woerter" aria-label="Zurück">${I.back}</button>
        <h1 style="flex:1">${esc(u.title)}</h1>
        <button class="iconbtn" data-a="edit-unit" data-id="${u.id}" aria-label="Unit umbenennen">${I.edit}</button></div>
      ${ws.length ? `<div class="row wrap"><button class="btn" data-a="practice-unit" data-id="${u.id}">Diese Unit üben</button>
        <span class="muted">${ws.length} ${ws.length === 1 ? "Wort" : "Wörter"}</span></div>
        <ul class="wordlist">${ws.map((w) => wordRow(w)).join("")}</ul>` : emptyWords()}
      ${u.group === "extra" && !u.active ? `<p class="muted small">Diese Wörter sind gerade nicht bei den fälligen Wörtern dabei. Schalte die Liste unter „Wörter“ ein, um sie mitzuüben.</p>` : ""}
    </div>
    <button class="btn fab" data-a="add" data-unit="${u.id}">${I.plus} Neues Wort</button>`;
  }

  /* ---------- Ich ---------- */
  function vIch() {
    const total = S.words.filter((w) => unitById(w.unit)?.group === "buch").length;
    const fest = S.words.filter((w) => w.box === 5).length;
    const days = [...Array(14)].map((_, i) => addDays(today(), i - 13));
    const max = Math.max(5, ...days.map((d) => S.log[d] || 0));
    const bars = days.map((d, i) => `<i class="${i === 13 ? "today" : ""}" style="height:${((S.log[d] || 0) / max) * 100}%" title="${d}: ${S.log[d] || 0}"></i>`).join("");
    const r = S.settings.rate;
    const canShare = !!(navigator.canShare && window.File);
    return `<div class="stack"><h1>Ich</h1>
      <div class="stats">
        <div class="stat"><b>${total}</b><span>eigene Wörter</span></div>
        <div class="stat"><b>${fest}</b><span>in Fach 5</span></div>
        <div class="stat"><b>${currentStreak()}</b><span>Tage am Stück</span></div></div>
      <div class="panel stack"><h3>Die letzten 14 Tage</h3><div class="activity" aria-hidden="true">${bars}</div>
        <p class="muted small">Jeder Balken zeigt, wie viele Karten du an dem Tag geübt hast. Heute ist rosa.</p></div>
      <form class="panel stack" data-form="name"><label class="field"><span>Dein Name</span>
        <input name="n" maxlength="24" value="${esc(S.profile.name)}"></label><button class="btn ghost" type="submit">Name speichern</button></form>
      <div class="panel stack"><h3>Vorlesen</h3>
        <div class="chips"><button class="chip" data-a="rate" data-v="0.7" aria-pressed="${r === 0.7}">Langsam</button>
          <button class="chip" data-a="rate" data-v="0.9" aria-pressed="${r === 0.9}">Normal</button>
          <button class="chip" data-a="say" data-t="Hello! Nice to meet you.">Probe hören</button></div>
        <div class="row between"><span>Beim Üben automatisch vorlesen</span>
          <label class="switch"><input type="checkbox" data-a="autospeak" ${S.settings.autoSpeak ? "checked" : ""} aria-label="Automatisch vorlesen"><span></span></label></div></div>
      <div class="panel stack"><h3>Sicherung</h3>
        <p class="muted small">Deine Wörter sind nur auf diesem Tablet gespeichert. Mach ab und zu eine Sicherung, zum Beispiel jeden Sonntag. Mit der Datei kannst du alles auf einem neuen Gerät wiederherstellen.</p>
        <div class="row wrap">${canShare ? `<button class="btn" data-a="share">Sicherung schicken</button>` : ""}
          <button class="btn ${canShare ? "ghost" : ""}" data-a="export">Sicherung herunterladen</button>
          <button class="btn ghost" data-a="import">Sicherung laden</button></div>
        <input type="file" id="importfile" accept=".json,application/json" hidden></div>
      ${installEvt ? `<button class="btn big ghost" data-a="install">Als App auf den Startbildschirm</button>` : ""}
      <div class="panel stack"><h3>Für Eltern</h3>
        <p class="muted small">Die App braucht kein Konto und schickt keine Daten ins Internet. Alles liegt im Browser-Speicher dieses Geräts. Wenn die Browserdaten von Chrome gelöscht werden, sind die Wörter weg. Dann hilft nur die Sicherungsdatei.</p>
        <button class="linkbtn" data-a="reset">Alles löschen und neu anfangen</button></div>
    </div>`;
  }

  /* ---------- Dialoge ---------- */
  function sheet(html, onMount) {
    closeSheet();
    const wrap = document.createElement("div");
    wrap.className = "sheet-wrap"; wrap.id = "sheet";
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) closeSheet(); });
    document.body.appendChild(wrap);
    if (onMount) onMount(wrap);
  }
  function closeSheet() { const s = $("#sheet"); if (s) s.remove(); }
  function confirmBox(title, text, okLabel, danger) {
    return new Promise((res) => {
      sheet(`<div class="stack"><h2>${esc(title)}</h2><p>${esc(text)}</p>
        <div class="row wrap"><button class="btn ${danger ? "no" : ""}" id="c-ok">${esc(okLabel)}</button><button class="btn ghost" id="c-no">Abbrechen</button></div></div>`,
        (w) => {
          w.querySelector("#c-ok").onclick = () => { closeSheet(); res(true); };
          w.querySelector("#c-no").onclick = () => { closeSheet(); res(false); };
          w.querySelector("#c-no").focus();
        });
    });
  }
  let toastT;
  function toast(msg) {
    const old = $(".toast"); if (old) old.remove();
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600);
  }

  function unitOptions(sel) {
    const opt = (u) => `<option value="${u.id}" ${u.id === sel ? "selected" : ""}>${esc(u.title)}</option>`;
    return `<optgroup label="Mein Englischbuch">${S.units.filter((u) => u.group === "buch").map(opt).join("")}</optgroup>
      <optgroup label="Extra-Wortschatz">${S.units.filter((u) => u.group === "extra").map(opt).join("")}</optgroup>`;
  }
  function wordSheet(w, preset) {
    const isNew = !w;
    const unit = w ? w.unit : (preset.unit || S.settings.lastUnit || S.units[0].id);
    sheet(`<form class="stack" data-form="word" autocomplete="off">
      <div class="row between"><h2>${isNew ? "Neues Wort" : "Wort ändern"}</h2><button type="button" class="iconbtn" data-a="close" aria-label="Schließen">${I.close}</button></div>
      <label class="field"><span>Englisch</span><input name="en" lang="en" required autocapitalize="off" spellcheck="false" value="${esc(w ? w.en : preset.en || "")}"></label>
      <label class="field"><span>Deutsch</span><input name="de" required value="${esc(w ? w.de : "")}">
        <p class="hint">Mehrere Bedeutungen mit Komma trennen, zum Beispiel: nett, schön</p></label>
      <label class="field"><span>Unit</span><select name="unit">${unitOptions(unit)}</select></label>
      <label class="field"><span>Beispielsatz (freiwillig)</span><input name="ex" lang="en" value="${esc(w ? w.ex : "")}"></label>
      <p class="warn" id="wmsg" role="alert"></p>
      <div class="row wrap">${isNew
        ? `<button class="btn" type="submit" name="go" value="next">Speichern und weiter</button><button class="btn ghost" type="submit" name="go" value="close">Speichern</button>`
        : `<button class="btn" type="submit" name="go" value="close">Speichern</button><button class="btn no" type="button" data-a="del-word" data-id="${w.id}">Löschen</button>`}</div>
    </form>`, (wrap) => {
      const f = wrap.querySelector("form");
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const go2 = (e.submitter && e.submitter.value) || "close";
        const en = f.en.value.trim(), de = f.de.value.trim(), u = f.unit.value, ex = f.ex.value.trim();
        const msg = wrap.querySelector("#wmsg");
        if (!en || !de) { msg.textContent = "Bitte Englisch und Deutsch ausfüllen."; (en ? f.de : f.en).focus(); return; }
        const dup = S.words.find((x) => x.unit === u && x.id !== (w && w.id) && norm(x.en, "en") === norm(en, "en"));
        if (dup) { msg.textContent = "„" + dup.en + "“ steht schon in dieser Unit."; f.en.focus(); return; }
        if (isNew) { S.words.push(newWord(en, de, u, ex)); }
        else { Object.assign(w, { en, de, unit: u, ex }); }
        S.settings.lastUnit = u;
        const un = unitById(u); if (un && un.group === "extra" && !un.active && isNew) { un.active = true; }
        save();
        if (isNew && go2 === "next") {
          toast("Gespeichert: " + en);
          f.en.value = ""; f.de.value = ""; f.ex.value = ""; msg.textContent = ""; f.en.focus();
          render();
        } else { closeSheet(); toast(isNew ? "Gespeichert: " + en : "Geändert"); render(); }
      });
      setTimeout(() => (f.en.value ? f.de : f.en).focus(), 50);
    });
  }
  function unitSheet(u) {
    const isNew = !u;
    sheet(`<form class="stack" data-form="unit">
      <div class="row between"><h2>${isNew ? "Neue Unit" : "Unit umbenennen"}</h2><button type="button" class="iconbtn" data-a="close" aria-label="Schließen">${I.close}</button></div>
      <label class="field"><span>Name</span><input name="t" required maxlength="40" value="${esc(u ? u.title : "Unit " + (S.units.filter((x) => x.group === "buch").length))}"></label>
      <div class="row wrap"><button class="btn" type="submit">Speichern</button>
      ${!isNew ? `<button class="btn no" type="button" data-a="del-unit" data-id="${u.id}">Unit löschen</button>` : ""}</div></form>`,
    (wrap) => {
      const f = wrap.querySelector("form");
      f.addEventListener("submit", (e) => {
        e.preventDefault(); const t = f.t.value.trim(); if (!t) return;
        if (isNew) { const id = "u-" + uid(); S.units.splice(S.units.filter((x) => x.group === "buch").length, 0, { id, title: t, group: "buch", active: true }); }
        else u.title = t;
        save(); closeSheet(); render();
      });
      f.t.focus(); f.t.select();
    });
  }

  /* ---------- Sicherung ---------- */
  function backupBlob() { return new Blob([JSON.stringify(S, null, 1)], { type: "application/json" }); }
  function backupName() { return "wortschatz-sicherung-" + today() + ".json"; }
  function doExport() {
    const a = document.createElement("a"); a.href = URL.createObjectURL(backupBlob()); a.download = backupName();
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("Sicherung ist im Download-Ordner");
  }
  async function doShare() {
    const file = new File([backupBlob()], backupName(), { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "WortSchatz-Sicherung" }); } catch (e) { /* abgebrochen */ }
    } else doExport();
  }
  function doImport(file) {
    const rd = new FileReader();
    rd.onload = async () => {
      let d; try { d = JSON.parse(rd.result); } catch (e) { d = null; }
      if (!d || d.version !== 1 || !Array.isArray(d.words) || !Array.isArray(d.units)) { toast("Das ist keine WortSchatz-Sicherung."); return; }
      const ok = await confirmBox("Sicherung laden?", "Die Sicherung enthält " + d.words.length + " Wörter. Alles, was jetzt in der App steht, wird ersetzt.", "Laden");
      if (!ok) return;
      S = d; save(); toast("Sicherung geladen"); go("start");
    };
    rd.readAsText(file);
  }

  /* ---------- Ereignisse ---------- */
  document.addEventListener("click", async (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { go(g.dataset.go); return; }
    const el = e.target.closest("[data-a]"); if (!el) return;
    const a = el.dataset.a, id = el.dataset.id;
    switch (a) {
      case "add": wordSheet(null, { unit: el.dataset.unit, en: el.dataset.en }); break;
      case "close": closeSheet(); break;
      case "edit": wordSheet(S.words.find((w) => w.id === id)); break;
      case "del-word": {
        const w = S.words.find((x) => x.id === id);
        if (await confirmBox("Wort löschen?", "„" + w.en + "“ wird gelöscht.", "Löschen", true)) { S.words = S.words.filter((x) => x.id !== id); save(); render(); toast("Gelöscht"); }
        break;
      }
      case "open": go("unit", id); break;
      case "toggle": { const u = unitById(id); u.active = el.checked; save(); render(); break; }
      case "new-unit": unitSheet(null); break;
      case "edit-unit": unitSheet(unitById(id)); break;
      case "del-unit": {
        const u = unitById(id); const n = wordsOf(id).length;
        if (await confirmBox("Unit löschen?", "„" + u.title + "“ und " + n + " " + (n === 1 ? "Wort" : "Wörter") + " darin werden gelöscht.", "Löschen", true)) {
          S.units = S.units.filter((x) => x.id !== id); S.words = S.words.filter((w) => w.unit !== id);
          if (S.settings.quiz.source === id) S.settings.quiz.source = "due";
          if (S.settings.lastUnit === id) S.settings.lastUnit = S.units[0] && S.units[0].id;
          save(); go("woerter");
        }
        break;
      }
      case "say": speak(el.dataset.t); break;
      case "qset": {
        const k = el.dataset.k; let v = el.dataset.v; if (k === "len") v = Number(v);
        S.settings.quiz[k] = v; save(); render(); break;
      }
      case "start-quiz": buildQuiz(); break;
      case "quick": buildQuiz("due"); break;
      case "practice-unit": buildQuiz(id); break;
      case "quit":
        if (Q && Q.i > 0 && !(await confirmBox("Übung beenden?", "Was du schon beantwortet hast, ist gespeichert.", "Beenden"))) break;
        Q = null; go("start"); break;
      case "reveal": Q.state = "shown"; render(); break;
      case "card-yes": Q.result = "ok"; nextItem(); break;
      case "card-no": Q.result = "no"; nextItem(); break;
      case "choose": {
        const { it, w } = cur(); const k = Number(el.dataset.k); Q.picked = k;
        const ans = it.dir === "en-de" ? w.de : w.en;
        answerWith(it.opts[k] === ans ? "ok" : "no"); break;
      }
      case "override": Q.result = "ok"; render(); break;
      case "next": nextItem(); break;
      case "done": Q = null; go("start"); break;
      case "rate": S.settings.rate = Number(el.dataset.v); save(); render(); speak("Hello! Nice to meet you."); break;
      case "autospeak": S.settings.autoSpeak = el.checked; save(); break;
      case "export": doExport(); break;
      case "share": doShare(); break;
      case "import": $("#importfile").click(); break;
      case "install": if (installEvt) { installEvt.prompt(); installEvt = null; render(); } break;
      case "reset":
        if (await confirmBox("Wirklich alles löschen?", "Alle Wörter, Münzen und der Fortschritt werden gelöscht. Das lässt sich nur mit einer Sicherung rückgängig machen.", "Alles löschen", true)) {
          S = freshState(); save(); go("start"); toast("Alles zurückgesetzt");
        }
        break;
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "importfile" && e.target.files[0]) doImport(e.target.files[0]);
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "search") {
      search = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const s = $("#search"); s.focus(); s.setSelectionRange(pos, pos);
    }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-form]"); if (!f) return;
    const kind = f.dataset.form;
    if (kind === "name") {
      e.preventDefault(); S.profile.name = f.n.value.trim(); save(); render();
      toast(S.profile.name ? "Hallo, " + S.profile.name + "!" : "Gespeichert");
    } else if (kind === "type") {
      e.preventDefault();
      const { it, w } = cur();
      const ans = it.dir === "en-de" ? w.de : w.en;
      Q.typed = f.a.value;
      answerWith(check(f.a.value, ans, it.dir === "en-de" ? "de" : "en"));
      const inp = document.querySelector('[data-form="type"] input'); if (inp) inp.value = Q.typed;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#sheet")) closeSheet();
  });

  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; if (view === "start" || view === "ich") render(); });
  window.addEventListener("appinstalled", () => { installEvt = null; toast("Installiert!"); });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // Für Tests im Browser
  window.__ws = { get state() { return S; }, check, norm, grade, addDays };

  render();
})();
