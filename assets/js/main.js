/* Portfolio runtime: rendering from SITE data, theme, navigation, motion, modal, contact form. */
(function () {
  "use strict";
  var S = window.SITE;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduced) root.classList.add("reduced");
  var icon = function (id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : "") + ' aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------------- theme ---------------- */
  var store = {
    get: function () { try { return localStorage.getItem("as-theme"); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem("as-theme", v); } catch (e) {} }
  };
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#070A12" : "#F6F8FC");
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  }
  if (!root.getAttribute("data-theme")) applyTheme(store.get() || currentTheme());
  $("#themeToggle").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    store.set(next); applyTheme(next);
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!store.get()) applyTheme(e.matches ? "dark" : "light");
  });
  window.getTheme = currentTheme;

  /* ---------------- loader ---------------- */
  var loader = $("#loader");
  function hideLoader() { loader.classList.add("done"); setTimeout(function () { loader.remove(); }, 700); }
  if (reduced) loader.remove(); else setTimeout(hideLoader, 650);

  /* ---------------- headline chars ---------------- */
  if (!reduced) {
    $$("#headline .line").forEach(function (line, l) {
      var text = line.textContent; line.textContent = "";
      text.split("").forEach(function (ch, c) {
        var s = document.createElement("span"); s.className = "char"; s.textContent = ch;
        s.style.setProperty("--c", c); s.style.setProperty("--l", l); s.setAttribute("aria-hidden", "true");
        line.appendChild(s);
      });
      if (line.classList.contains("gradient-text")) {
        line.classList.remove("gradient-text");
        var paint = function () {
          var w = line.scrollWidth;
          $$(".char", line).forEach(function (s) { s.classList.add("grad-char"); s.style.backgroundSize = w + "px 100%"; s.style.backgroundPosition = (-s.offsetLeft) + "px 0"; });
        };
        paint(); window.addEventListener("resize", paint);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      }
    });
  }

  /* ---------------- role typer ---------------- */
  (function () {
    var el = $("#typed"), roles = S.personal.roles, i = 0;
    if (reduced) { var k = 0; setInterval(function () { k = (k + 1) % roles.length; el.textContent = roles[k]; }, 3200); return; }
    function type(word, n, done) { el.textContent = word.slice(0, n); if (n < word.length) setTimeout(function () { type(word, n + 1, done); }, 55); else setTimeout(done, 1800); }
    function erase(done) { var t = el.textContent; if (t.length) { el.textContent = t.slice(0, -1); setTimeout(function () { erase(done); }, 28); } else done(); }
    function loop() { erase(function () { i = (i + 1) % roles.length; type(roles[i], 1, loop); }); }
    setTimeout(loop, 2600);
  })();

  /* ---------------- skills ---------------- */
  (function () {
    var tabs = $("#skillTabs"), panels = $("#skillPanels"), pill = $("#tabPill");
    S.skills.forEach(function (cat, ci) {
      var b = document.createElement("button");
      b.className = "tab"; b.type = "button"; b.role = "tab"; b.id = "tab-" + cat.id; b.textContent = cat.label;
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "panel-" + cat.id); b.setAttribute("aria-selected", ci === 0 ? "true" : "false");
      b.tabIndex = ci === 0 ? 0 : -1;
      tabs.appendChild(b);
      var p = document.createElement("div");
      p.className = "skill-panel"; p.id = "panel-" + cat.id; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", b.id);
      if (ci) p.hidden = true;
      p.innerHTML = cat.items.map(function (s, i) {
        var ico = s.icon ? icon(s.icon) : esc(s.mono);
        return '<article class="card skill tilt" style="--i:' + i + '"><span class="skill-ico" style="background:linear-gradient(135deg,' + s.hue[0] + "," + s.hue[1] + ')">' + ico + '</span><div><span class="tag">' + esc(s.tag) + '</span><h3>' + esc(s.name) + "</h3></div></article>";
      }).join("");
      panels.appendChild(p);
    });
    function movePill(btn) { pill.style.width = btn.offsetWidth + "px"; pill.style.transform = "translateX(" + (btn.offsetLeft) + "px)"; pill.style.top = btn.offsetTop + "px"; pill.style.height = btn.offsetHeight + "px"; pill.style.bottom = "auto"; }
    function select(btn, focus) {
      $$(".tab", tabs).forEach(function (t) { var on = t === btn; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; $("#" + t.getAttribute("aria-controls")).hidden = !on; });
      var panel = $("#" + btn.getAttribute("aria-controls"));
      if (!reduced) $$(".skill", panel).forEach(function (c) { c.classList.remove("enter"); void c.offsetWidth; c.classList.add("enter"); });
      movePill(btn); if (focus) btn.focus();
    }
    tabs.addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) select(b); });
    tabs.addEventListener("keydown", function (e) {
      var list = $$(".tab", tabs), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowRight") { e.preventDefault(); select(list[(i + 1) % list.length], true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); select(list[(i - 1 + list.length) % list.length], true); }
    });
    var first = $(".tab", tabs);
    requestAnimationFrame(function () { movePill(first); });
    window.addEventListener("resize", function () { movePill($('.tab[aria-selected="true"]', tabs)); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill($('.tab[aria-selected="true"]', tabs)); });
  })();

  /* ---------------- project thumbnails ---------------- */
  function calcMarkup(interactive) {
    var keys = [["+", "op"], ["−", "op"], ["×", "op"], ["÷", "op"], ["7"], ["8"], ["9"], ["4"], ["5"], ["6"], ["1"], ["2"], ["3"], ["0"], ["."], ["C", "clr"], ["=", "eq"]];
    var tag = interactive ? "button" : "span";
    return '<div class="calc-thumb"><div class="calc"' + (interactive ? ' id="liveCalc"' : "") + '><div class="calc-display"' + (interactive ? ' aria-live="polite"' : "") + '>' + (interactive ? '<small>&nbsp;</small><span>0</span>' : '<small>12 × 4</small><span>48</span>') + '</div><div class="calc-keys">' +
      keys.map(function (k) { return "<" + tag + (interactive ? ' type="button" data-k="' + k[0] + '"' : "") + (k[1] ? ' class="' + k[1] + '"' : "") + ">" + k[0] + "</" + tag + ">"; }).join("") +
      "</div></div></div>";
  }
  function careerArt() {
    return '<svg class="art" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent2)"/></linearGradient></defs>' +
      '<rect width="600" height="340" fill="var(--bg2)"/>' +
      [70, 130, 190, 250].map(function (y, i) { return '<rect x="40" y="' + (y - 16) + '" width="150" height="32" rx="10" fill="var(--card)" stroke="var(--line-strong)"/><rect x="56" y="' + (y - 4) + '" width="' + (60 + i * 18) + '" height="8" rx="4" fill="var(--faint)" opacity=".5"/>'; }).join("") +
      [70, 130, 190, 250].map(function (y) { return '<path d="M190 ' + y + ' C 260 ' + y + ', 250 170, 300 170" fill="none" stroke="url(#cg)" stroke-width="2" opacity=".55"/>'; }).join("") +
      '<circle cx="300" cy="170" r="34" fill="url(#cg)"/><circle cx="300" cy="170" r="50" fill="none" stroke="var(--accent)" opacity=".3"/><circle cx="300" cy="170" r="66" fill="none" stroke="var(--accent2)" opacity=".15"/>' +
      '<path d="M288 170 l8 8 l16 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      [100, 170, 240].map(function (y, i) { return '<path d="M334 170 C 380 170, 370 ' + y + ', 410 ' + y + '" fill="none" stroke="url(#cg)" stroke-width="2" opacity=".55"/><rect x="410" y="' + (y - 20) + '" width="150" height="40" rx="12" fill="var(--card)" stroke="' + (i === 0 ? "var(--accent)" : "var(--line-strong)") + '"/><circle cx="432" cy="' + y + '" r="7" fill="' + (i === 0 ? "var(--accent)" : "var(--faint)") + '" opacity="' + (i === 0 ? 1 : .5) + '"/><rect x="448" y="' + (y - 4) + '" width="' + (90 - i * 16) + '" height="8" rx="4" fill="var(--faint)" opacity=".5"/>'; }).join("") +
      '</svg>';
  }
  function networkCanvas(canvas) {
    var ctx = canvas.getContext("2d"), w, h, dpr, nodes = [], t0 = performance.now(), running = false, raf;
    var sev = ["#E5484D", "#F2994A", "#F5C24B", "var"];
    function seed() {
      var rnd = mulberry(7); nodes = [];
      var hubs = [[.5, .48]];
      for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + .3; hubs.push([.5 + Math.cos(a) * .26, .48 + Math.sin(a) * .3]); }
      hubs.forEach(function (p, i) { nodes.push({ x: p[0], y: p[1], r: i ? 6 : 10, hub: true, p: i ? 0 : -1, s: -1 }); });
      for (var j = 0; j < 22; j++) { var hi = 1 + (j % 6), a2 = rnd() * Math.PI * 2, d = .06 + rnd() * .07; nodes.push({ x: hubs[hi][0] + Math.cos(a2) * d * 1.2, y: hubs[hi][1] + Math.sin(a2) * d * 1.4, r: 3, p: hi, s: rnd() < .22 ? Math.floor(rnd() * 3) : -1 }); }
    }
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function size() { var r = canvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function css(n) { return getComputedStyle(canvas).getPropertyValue(n).trim(); }
    function draw(now) {
      var t = (now - t0) / 1000, accent = css("--accent"), cyan = css("--cyan"), line = css("--line-strong"), faint = css("--faint"), bg = css("--bg2"), fg = css("--fg");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = css("--line"); ctx.lineWidth = 1;
      for (var gx = 0; gx < w; gx += 28) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
      for (var gy = 0; gy < h; gy += 28) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      var cx = w * .5, cy = h * .48, R = Math.max(w, h) * .62, ang = reduced ? 1.2 : t * .7;
      var grad = ctx.createConicGradient ? ctx.createConicGradient(ang - .9, cx, cy) : null;
      if (grad) { grad.addColorStop(0, "transparent"); grad.addColorStop(.12, hexA(cyan, .16)); grad.addColorStop(.145, "transparent"); grad.addColorStop(1, "transparent"); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); }
      [.18, .32, .46].forEach(function (k) { ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * k, 0, Math.PI * 2); ctx.strokeStyle = hexA(accent, .18); ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); });
      nodes.forEach(function (n) { if (n.p === -1) return; var p = nodes[n.p]; ctx.beginPath(); ctx.moveTo(n.x * w, n.y * h); ctx.lineTo(p.x * w, p.y * h); ctx.strokeStyle = n.hub ? hexA(accent, .5) : line; ctx.lineWidth = n.hub ? 1.4 : 1; ctx.stroke(); });
      nodes.forEach(function (n, i) {
        var x = n.x * w, y = n.y * h, a = Math.atan2(y - cy, x - cx), da = ((ang % (Math.PI * 2)) - (a < 0 ? a + Math.PI * 2 : a) + Math.PI * 4) % (Math.PI * 2), hit = da < .5 ? 1 - da / .5 : 0;
        var col = n.s >= 0 ? ["#E5484D", "#F2994A", "#E8B730"][n.s] : (n.hub ? accent : faint);
        if (n.s >= 0 || n.hub) { ctx.beginPath(); ctx.arc(x, y, n.r + 5 + hit * 6, 0, Math.PI * 2); ctx.fillStyle = hexA(col, .14 + hit * .25); ctx.fill(); }
        ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        if (n.p === -1) { ctx.fillStyle = "#fff"; ctx.font = "600 9px " + css("--f-mono"); ctx.textAlign = "center"; ctx.fillText("NV", x, y + 3); }
      });
      // severity legend panel
      var pw = 150, ph = 92, px = w - pw - 16, py = 16;
      ctx.fillStyle = hexA(bg, .85); ctx.strokeStyle = line; roundRect(px, py, pw, ph, 10); ctx.fill(); ctx.stroke();
      ctx.font = "500 9px " + css("--f-mono"); ctx.textAlign = "left"; ctx.fillStyle = faint; ctx.fillText("SEVERITY (CVSS)", px + 12, py + 18);
      [["Critical", "#E5484D", .3], ["High", "#F2994A", .55], ["Medium", "#E8B730", .8]].forEach(function (r, k) {
        var ry = py + 34 + k * 18; ctx.fillStyle = fg; ctx.fillText(r[0], px + 12, ry + 3);
        ctx.fillStyle = hexA(r[1], .2); roundRect(px + 64, ry - 4, 72, 7, 3); ctx.fill(); ctx.fillStyle = r[1]; roundRect(px + 64, ry - 4, 72 * r[2], 7, 3); ctx.fill();
      });
      ctx.fillStyle = cyan; ctx.font = "500 10px " + css("--f-mono"); ctx.fillText("$ nmap -sV --script vuln 10.0.0.0/24", 16, h - 40);
      if (running && !reduced) raf = requestAnimationFrame(draw);
    }
    function roundRect(x, y, w2, h2, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w2, y, x + w2, y + h2, r); ctx.arcTo(x + w2, y + h2, x, y + h2, r); ctx.arcTo(x, y + h2, x, y, r); ctx.arcTo(x, y, x + w2, y, r); ctx.closePath(); }
    function hexA(c, a) {
      c = c.trim(); if (c.indexOf("#") !== 0) return c;
      var n = c.length === 4 ? c.slice(1).split("").map(function (x) { return x + x; }).join("") : c.slice(1, 7);
      return "rgba(" + parseInt(n.slice(0, 2), 16) + "," + parseInt(n.slice(2, 4), 16) + "," + parseInt(n.slice(4, 6), 16) + "," + a + ")";
    }
    seed(); size(); draw(performance.now());
    window.addEventListener("resize", function () { size(); draw(performance.now()); });
    window.addEventListener("themechange", function () { requestAnimationFrame(function () { draw(performance.now()); }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { var was = running; running = e.isIntersecting; if (running && !was) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } });
    }).observe(canvas);
    return { draw: draw, size: size };
  }

  /* ---------------- projects ---------------- */
  (function () {
    var grid = $("#projectGrid");
    grid.innerHTML = S.projects.map(function (p, i) {
      var thumb = p.thumb === "network" ? '<canvas data-net aria-hidden="true"></canvas><span class="note">ILLUSTRATION · NOT A PRODUCT SCREENSHOT</span>'
        : p.thumb === "calculator" ? calcMarkup(false) + '<span class="note">INTERFACE PREVIEW</span>'
        : careerArt() + '<span class="note">CONCEPT ILLUSTRATION</span>';
      var tags = (p.tech.length ? p.tech : ["Stack details coming soon"]).map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("");
      return '<article class="card project tilt' + (p.featured ? " featured" : "") + ' reveal" style="--d:' + (i * 80) + 'ms" data-project="' + p.id + '" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Open details for ' + esc(p.name) + '">' +
        '<div class="thumb">' + thumb + '</div>' +
        '<div class="project-body"><div class="project-meta"><span class="idx">0' + (i + 1) + '</span><span>' + esc(p.category) + '</span></div>' +
        '<h3>' + esc(p.name) + '</h3><p>' + esc(p.summary) + '</p><div class="tags">' + tags + '</div>' +
        '<div class="project-actions">' +
        (p.demo ? '<a class="btn btn-primary btn-sm" href="' + p.demo + '" target="_blank" rel="noopener" data-stop>Explore Live Demo' + icon("i-ext") + '</a>' : "") +
        (p.github ? '<a class="btn btn-sm" href="' + p.github + '" target="_blank" rel="noopener" data-stop>' + icon("i-github") + 'View Source Code</a>' : '<span class="btn btn-sm" aria-disabled="true">' + icon("i-github") + 'Source coming soon</span>') +
        '</div><span class="open-hint">View project details' + icon("i-arrow") + '</span></div></article>';
    }).join("");
    $$("canvas[data-net]", grid).forEach(networkCanvas);
    grid.addEventListener("click", function (e) {
      if (e.target.closest("[data-stop]") || e.target.closest('[aria-disabled="true"]')) return;
      var card = e.target.closest("[data-project]"); if (card) openModal(card.getAttribute("data-project"), card);
    });
    grid.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-project]")) { e.preventDefault(); openModal(e.target.getAttribute("data-project"), e.target); }
    });
  })();

  /* ---------------- modal ---------------- */
  var modal = $("#projectModal"), lastFocus = null;
  function openModal(id, from) {
    var p = S.projects.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    lastFocus = from;
    $("#modalPrompt").textContent = "open ./projects/" + p.id;
    var hero = p.thumb === "network" ? '<div class="modal-hero" style="min-height:300px"><canvas data-net-modal aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%"></canvas><span class="note">ILLUSTRATION · NOT A PRODUCT SCREENSHOT</span></div>'
      : p.thumb === "calculator" ? '<div class="modal-hero">' + calcMarkup(true) + '<span class="note">INTERACTIVE RECREATION · TRY IT</span></div>'
      : '<div class="modal-hero" style="min-height:260px;position:relative">' + careerArt() + '</div>';
    var shots = p.screenshots.length ? '<div><h4 class="mh">Screenshots</h4><div style="display:grid;gap:12px">' + p.screenshots.map(function (s) { return '<img src="' + s + '" alt="' + esc(p.name) + ' screenshot" loading="lazy" style="border-radius:12px;border:1px solid var(--line)">'; }).join("") + "</div></div>" : "";
    var techBlock = p.tech.length ? '<div class="tags">' + p.tech.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</div>" : '<div class="pending-note">Technology details will be added once the project source is published.</div>';
    var arch = p.architecture.length ? '<dl class="kv">' + p.architecture.map(function (a) { return "<div><dt>" + esc(a[0]) + "</dt><dd>" + esc(a[1]) + "</dd></div>"; }).join("") + "</dl>" : "";
    var links = (p.demo ? '<a class="btn btn-primary" href="' + p.demo + '" target="_blank" rel="noopener">Explore Live Demo' + icon("i-ext") + "</a>" : "") +
      (p.github ? '<a class="btn" href="' + p.github + '" target="_blank" rel="noopener">' + icon("i-github") + "View Source Code</a>" : "");
    var pending = !p.github || !p.demo ? '<div class="pending-note">' + (!p.github && !p.demo ? "Source code and live demo: coming soon." : !p.demo ? "No live demo is published for this project yet. The source code is on GitHub." : "") + "</div>" : "";
    $("#modalBody").innerHTML = hero +
      '<div class="modal-title"><span class="prompt" style="color:var(--accent)">' + esc(p.category) + '</span><h3 id="modalTitle">' + esc(p.name) + '</h3><p class="lede">' + esc(p.summary) + "</p></div>" +
      '<div class="modal-cols"><div><h4>' + (p.id === "career" ? "Highlights" : "Features") + '</h4><ul class="feature-list">' + p.features.map(function (f) { return "<li>" + icon("i-check") + "<span>" + esc(f) + "</span></li>"; }).join("") + "</ul></div>" +
      '<div style="display:grid;gap:22px;align-content:start"><div><h4>Technologies</h4>' + techBlock + "</div>" + (arch ? "<div><h4>Architecture</h4>" + arch + "</div>" : "") + "</div></div>" +
      shots + (links ? '<div class="project-actions">' + links + "</div>" : "") + pending;
    var net = $("canvas[data-net-modal]", modal);
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    if (net) requestAnimationFrame(function () { networkCanvas(net); });
    if (p.thumb === "calculator") wireCalc($("#liveCalc"));
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal.open) return;
    if (reduced) { finish(); return; }
    modal.classList.add("closing");
    setTimeout(finish, 330);
    function finish() { modal.classList.remove("closing"); modal.close ? modal.close() : modal.removeAttribute("open"); }
  }
  modal.addEventListener("close", function () { document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); });
  modal.addEventListener("cancel", function (e) { e.preventDefault(); closeModal(); });
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

  /* Calculator recreation: same keypad as the repo, evaluated with a small
     precedence parser instead of eval(). */
  function evaluate(expr) {
    var toks = expr.trim().split(/\s+/).filter(Boolean);
    if (!toks.length) return "";
    var out = [], ops = [], prec = { "+": 1, "−": 1, "×": 2, "÷": 2 };
    function apply() { var b = out.pop(), a = out.pop(), o = ops.pop(); if (a === undefined || b === undefined) throw 0;
      out.push(o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : (b === 0 ? NaN : a / b)); }
    toks.forEach(function (t) {
      if (prec[t]) { while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) apply(); ops.push(t); }
      else { if (!/^\d*\.?\d+$|^\d+\.$/.test(t)) throw 0; out.push(parseFloat(t)); }
    });
    while (ops.length) apply();
    if (out.length !== 1 || !isFinite(out[0])) throw 0;
    return String(Math.round(out[0] * 1e10) / 1e10);
  }
  function wireCalc(calc) {
    var expr = "", disp = $(".calc-display span", calc), hist = $(".calc-display small", calc);
    function show() { disp.textContent = expr || "0"; }
    calc.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; var k = b.getAttribute("data-k");
      if (k === "C") { expr = ""; hist.innerHTML = "&nbsp;"; }
      else if (k === "=") { try { var r = evaluate(expr); hist.textContent = expr + " ="; expr = r; } catch (_) { hist.textContent = expr; expr = ""; disp.textContent = "Error"; return; } }
      else if ("+−×÷".indexOf(k) > -1) { expr += " " + k + " "; }
      else { expr += k; }
      show();
    });
  }

  /* ---------------- timelines ---------------- */
  (function () {
    var exp = $("#expTimeline");
    exp.insertAdjacentHTML("beforeend", S.experience.map(function (x) {
      return '<li class="t-item reveal"><article class="card t-card glass-card tilt"><span class="t-when">' + esc(x.start) + " – " + esc(x.end) + '</span><h3>' + esc(x.role) + '</h3><span class="t-org">' + esc(x.org) + "</span><p>" + esc(x.description) + "</p>" +
        (x.details.length ? '<ul class="feature-list">' + x.details.map(function (d) { return "<li>" + icon("i-check") + "<span>" + esc(d) + "</span></li>"; }).join("") + "</ul>" : "") + "</article></li>";
    }).join(""));
    var edu = $("#eduTimeline");
    edu.insertAdjacentHTML("beforeend", S.education.map(function (x, i) {
      return '<li class="t-item reveal' + (x.current ? " current" : "") + '" style="--d:' + i * 90 + 'ms"><article class="card t-card tilt"><span class="badge' + (x.current ? "" : " done") + '">' + esc(x.when) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.place) + "</p></article></li>";
    }).join(""));
    function progress() {
      $$(".timeline").forEach(function (tl) {
        var r = tl.getBoundingClientRect(), vh = window.innerHeight, p = Math.min(1, Math.max(0, (vh * .7 - r.top) / r.height));
        tl.style.setProperty("--p", (p * 100).toFixed(1) + "%");
      });
    }
    window.addEventListener("scroll", progress, { passive: true }); progress();
  })();

  /* ---------------- certs / achievements / languages ---------------- */
  $("#certGrid").innerHTML = S.certifications.map(function (c, i) {
    return '<article class="card cert tilt reveal" style="--d:' + i * 70 + 'ms"><span class="cert-ico">' + icon(c.icon) + '</span><div style="display:grid;gap:8px"><h3>' + esc(c.title) + '</h3><span class="issuer">' + esc(c.issuer) + "</span></div>" +
      (c.url ? '<a class="cred" href="' + c.url + '" target="_blank" rel="noopener">' + icon("i-ext") + "Verify credential</a>" : '<span class="cred">' + icon("i-cert") + "Credential link coming soon</span>") + "</article>";
  }).join("");
  var confettiColors = ["var(--accent)", "var(--accent2)", "var(--cyan)", "#F5C24B", "var(--ok)"];
  $("#achGrid").innerHTML = S.achievements.map(function (a, i) {
    var bits = ""; for (var k = 0; k < 12; k++) { var ang = k / 12 * Math.PI * 2; bits += '<i style="background:' + confettiColors[k % 5] + ";--x:" + Math.round(Math.cos(ang) * (50 + (k % 3) * 18)) + "px;--y:" + Math.round(Math.sin(ang) * (50 + (k % 3) * 18)) + "px;animation-delay:" + (k % 3) * 40 + 'ms"></i>'; }
    return '<article class="card ach tilt reveal" style="--d:' + i * 80 + 'ms"><div class="confetti" aria-hidden="true">' + bits + '</div><div class="ach-top"><span class="award">' + icon(a.icon) + '</span><span class="years">' + esc(a.years).replace("\n", "<br>") + "</span></div><h3>" + esc(a.title) + "</h3>" +
      (a.events ? '<div class="events">' + a.events.map(function (e) { return '<span class="chip">' + esc(e) + "</span>"; }).join("") + "</div>" : "") +
      "<ul>" + a.points.map(function (p) { return "<li><span>" + p + "</span></li>"; }).join("") + "</ul></article>";
  }).join("");
  $("#langList").innerHTML = S.languages.map(function (l) { return '<div class="lang"><b>' + esc(l.name) + "</b>" + (l.level ? '<span class="native">' + esc(l.level.toUpperCase()) + "</span>" : "") + "</div>"; }).join("");
  $("#softList").innerHTML = S.softSkills.map(function (s) { return '<span class="soft">' + esc(s) + "</span>"; }).join("");

  /* ---------------- navigation ---------------- */
  (function () {
    var links = $$("#navLinks a"), ind = $("#navIndicator"), nav = $("#nav");
    var ids = links.map(function (a) { return a.getAttribute("href").slice(1); });
    function setActive(id) {
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id; a.classList.toggle("active", on);
        if (on) { a.setAttribute("aria-current", "true"); ind.style.opacity = 1; ind.style.width = a.offsetWidth + "px"; ind.style.transform = "translateX(" + a.offsetLeft + "px)"; }
        else a.removeAttribute("aria-current");
      });
    }
    var lastY = window.scrollY;
    function onScroll() {
      var y = window.scrollY, mark = window.innerHeight * .35, cur = ids[0];
      ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top - mark <= 0) cur = id; });
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) cur = "contact";
      setActive(cur);
      nav.classList.toggle("hide", y > lastY + 4 && y > 500 && !document.getElementById("drawer").classList.contains("open"));
      if (y < lastY - 4) nav.classList.remove("hide");
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);
    onScroll();

    var drawer = $("#drawer"), openBtn = $("#menuOpen");
    function setDrawer(open) {
      drawer.classList.toggle("open", open); openBtn.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) setTimeout(function () { $("#menuClose").focus(); }, 50); else openBtn.focus({ preventScroll: true });
    }
    openBtn.addEventListener("click", function () { setDrawer(true); });
    $("#menuClose").addEventListener("click", function () { setDrawer(false); });
    $$("#drawer a[href^='#']").forEach(function (a) { a.addEventListener("click", function () { drawer.classList.remove("open"); openBtn.setAttribute("aria-expanded", false); document.body.style.overflow = ""; }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) setDrawer(false); });
  })();

  /* ---------------- reveal on scroll ---------------- */
  (function () {
    if (reduced || !("IntersectionObserver" in window)) return;
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("reveal-in"); e.target.classList.remove("reveal-pending"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add("reveal-pending"); io.observe(el); }
    });
  })();

  /* ---------------- tilt, magnetic, cursor ---------------- */
  if (finePointer && !reduced) {
    document.addEventListener("pointermove", function (e) {
      var t = e.target.closest && e.target.closest(".tilt");
      if (t) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5, k = t.classList.contains("featured") ? 4 : 7;
        t.style.transform = "perspective(1000px) rotateX(" + (-y * k).toFixed(2) + "deg) rotateY(" + (x * k).toFixed(2) + "deg) translateY(-4px)";
      }
    });
    document.addEventListener("pointerout", function (e) {
      var t = e.target.closest && e.target.closest(".tilt");
      if (t && !t.contains(e.relatedTarget)) t.style.transform = "";
    });
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
    var ring = $("#cursor"), cx = 0, cy = 0, rx = 0, ry = 0, raf;
    document.addEventListener("pointermove", function (e) {
      cx = e.clientX; cy = e.clientY; ring.classList.add("on");
      ring.classList.toggle("hover", !!(e.target.closest && e.target.closest("a,button,[role=button],input,textarea,.tab")));
      if (!raf) raf = requestAnimationFrame(follow);
    });
    document.addEventListener("pointerleave", function () { ring.classList.remove("on"); });
    function follow() { rx += (cx - rx) * .2; ry += (cy - ry) * .2; ring.style.transform = "translate(" + rx + "px," + ry + "px)"; raf = Math.abs(cx - rx) + Math.abs(cy - ry) > .3 ? requestAnimationFrame(follow) : 0; }
  } else { $("#cursor").remove(); }

  /* ---------------- copy buttons ---------------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = b.getAttribute("data-copy"), use = $("use", b);
      function done() { use.setAttribute("href", "#i-check"); b.setAttribute("aria-label", "Copied"); setTimeout(function () { use.setAttribute("href", "#i-copy"); }, 1600); }
      function fallback() { var v = b.parentNode.querySelector(".v"); var range = document.createRange(); range.selectNodeContents(v); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); }
      try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------------- contact form ---------------- */
  (function () {
    var form = $("#contactForm"), status = $("#formStatus"), btn = $("#cfSubmit"), loadedAt = Date.now();
    var rules = {
      name: function (v) { return v.length < 2 ? "Enter your name (at least 2 characters)." : ""; },
      email: function (v) { return !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Enter a valid email address, like name@example.com." : ""; },
      subject: function (v) { return v.length < 3 ? "Add a short subject (at least 3 characters)." : ""; },
      message: function (v) { return v.length < 10 ? "Write a message of at least 10 characters." : ""; }
    };
    function check(input) {
      var msg = rules[input.name] ? rules[input.name](input.value.trim()) : "", f = input.closest(".field");
      f.classList.toggle("invalid", !!msg); $(".err", f).textContent = msg; input.setAttribute("aria-invalid", !!msg); return !msg;
    }
    $$("input[name], textarea[name]", form).forEach(function (i) { if (rules[i.name]) i.addEventListener("blur", function () { if (i.value) check(i); }); });
    function setStatus(kind, html) { status.className = "form-status " + kind; status.innerHTML = html; }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); setStatus("", "");
      var fields = $$("input[name], textarea[name]", form).filter(function (i) { return rules[i.name]; });
      var ok = fields.map(check).every(Boolean);
      if (!ok) { var bad = $(".invalid input, .invalid textarea", form); if (bad) bad.focus(); return; }
      if (form.website.value) return; // honeypot: silently drop bots
      if ((Date.now() - loadedAt) / 1000 < S.contact.minSecondsOnPage) { setStatus("bad", "That was quick. Please wait a moment and send again."); return; }
      var data = { name: form.name.value.trim(), email: form.email.value.trim(), subject: form.subject.value.trim(), message: form.message.value.trim(), website: form.website.value, elapsed: Date.now() - loadedAt };
      btn.classList.add("sending"); btn.disabled = true; $(".lbl", btn).textContent = "Sending…";
      var ctrl = "AbortController" in window ? new AbortController() : null, timer = setTimeout(function () { ctrl && ctrl.abort(); }, 15000);
      fetch(S.contact.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: ctrl && ctrl.signal })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || "status " + r.status); return j; }); })
        .then(function () { form.reset(); setStatus("ok", "Message sent. Thanks for reaching out, I'll reply to " + esc(data.email) + " soon."); })
        .catch(function () { setStatus("bad", "The message couldn't be sent right now. Please email me directly at <strong>" + S.personal.email + "</strong>, your message is still in the form."); })
        .then(function () { clearTimeout(timer); btn.classList.remove("sending"); btn.disabled = false; $(".lbl", btn).textContent = "Send Message"; });
    });
  })();

  /* ---------------- footer year ---------------- */
  $("#year").textContent = new Date().getFullYear();
  $("#toTop").addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

  /* ---------------- hero: CSS parallax + lazy 3D ---------------- */
  (function () {
    var stage = $("#stage"), scene = $("#scene3d");
    var mx = 0, my = 0, tx = 0, ty = 0, raf = 0;
    if (!reduced) {
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5;
        window.__heroPointer = { x: mx, y: my };
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
    }
    function tick() {
      tx += (mx - tx) * .08; ty += (my - ty) * .08;
      scene.style.transform = "rotateY(" + (tx * 14).toFixed(2) + "deg) rotateX(" + (-ty * 12).toFixed(2) + "deg)";
      raf = Math.abs(mx - tx) + Math.abs(my - ty) > .001 ? requestAnimationFrame(tick) : 0;
    }
    function hasWebGL() { try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; } }
    function load3D() {
      if (!hasWebGL()) return; // CSS orbs stay as the static fallback
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.async = true; s.crossOrigin = "anonymous";
      s.onload = function () { try { window.initHeroScene && window.initHeroScene($("#heroGL"), stage, { reduced: reduced }); } catch (err) { console.warn("3D scene disabled:", err); } };
      document.head.appendChild(s);
    }
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    if (document.readyState === "complete") idle(load3D); else window.addEventListener("load", function () { idle(load3D); });
  })();
})();
