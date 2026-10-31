/*!
 * Encryption 1 Suite — How To player (prototype)
 * Opens tutorial videos in native Picture-in-Picture where the browser allows it,
 * and in a draggable floating window everywhere else (Firefox, older browsers, phones).
 * Reads its clip list from window.EC1_HOWTO_CLIPS and labels from window.EC1_HOWTO_LABELS,
 * both written by howto-menu.php. No cookies, no trackers: it uses sessionStorage only,
 * to remember which clip was playing and where, so the next page can offer to resume.
 */
(function () {
  'use strict';
  if (window.EC1HowTo) return;
  // Inside a tutorial page's embedded tool, the outer page runs the player instead.
  try { if (window.frameElement && window.frameElement.hasAttribute('data-tut-embed')) return; } catch (e) {}

  var CLIPS = window.EC1_HOWTO_CLIPS || {};
  var L = Object.assign({
    dialog: 'Tutorial video',
    popOut: 'Pop out into a floating window',
    minimize: 'Minimize',
    restore: 'Restore',
    close: 'Close tutorial',
    inPip: 'Playing in a floating window.',
    backToPage: 'Bring back',
    loading: 'Loading video…',
    loadError: 'This video could not be loaded. Check your connection and try again.',
    resume: 'Resume “{title}” at {time}?',
    resumeBtn: 'Resume',
    dismiss: 'No thanks',
    move: 'Drag to move. Arrow keys also move the window.'
  }, window.EC1_HOWTO_LABELS || {});

  var STORE_KEY = 'ec1-howto';
  var POS_KEY = 'ec1-howto-pos';
  var proto = HTMLVideoElement.prototype;
  var nativePip = !!(document.pictureInPictureEnabled && 'requestPictureInPicture' in proto);
  var webkitPip = !nativePip && 'webkitSetPresentationMode' in proto;
  var canPip = nativePip || webkitPip;
  var docked = window.matchMedia('(max-width: 640px)');

  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }

  /* ---------- styles (inherit the EC1 CSS variables, with fallbacks) ---------- */
  var css = [
    '.hx-menu{position:relative;display:inline-block}',
    '.hx-menu-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--border,#dbe3ee);border-radius:999px;background:var(--card,#fff);color:var(--text,#1f2937);font:inherit;font-weight:600;cursor:pointer}',
    '.hx-menu-btn:hover{border-color:var(--accent,#0d6efd)}',
    '.hx-menu-btn[aria-expanded="true"]{border-color:var(--accent,#0d6efd);color:var(--accent,#0d6efd)}',
    '.hx-menu-btn:focus-visible,.hx-btn:focus-visible,.hx-link:focus-visible,.hx-primary:focus-visible,.hx-head:focus-visible{outline:2px solid var(--accent,#0d6efd);outline-offset:2px}',
    '.hx-caret{width:12px;height:12px;transition:transform .15s}',
    '.hx-menu-btn[aria-expanded="true"] .hx-caret{transform:rotate(180deg)}',
    '.hx-menu-list{position:absolute;top:calc(100% + 8px);inset-inline-start:0;min-width:240px;max-width:calc(100vw - 16px);margin:0;padding:6px;list-style:none;background:var(--card,#fff);border:1px solid var(--border,#dbe3ee);border-radius:14px;box-shadow:0 12px 32px rgba(31,41,55,.14);z-index:1000}',
    '.hx-menu-list[hidden]{display:none}',
    '.hx-menu-list.hx-end{inset-inline-start:auto;inset-inline-end:0}',
    '.hx-menu-list li{margin:0}',
    '.hx-item{display:flex;align-items:center;gap:10px;box-sizing:border-box;width:100%;padding:9px 12px;border:0;border-radius:10px;background:none;color:var(--text,#1f2937);font:inherit;text-align:start;text-decoration:none;cursor:pointer}',
    '.hx-item:hover,.hx-item:focus-visible{background:var(--bg,#f5f7fb);outline:none}',
    '.hx-item:focus-visible{box-shadow:inset 0 0 0 2px var(--accent,#0d6efd)}',
    '.hx-play{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--accent,#0d6efd)}',
    '.hx-play svg{width:9px;height:9px;margin-inline-start:2px;fill:#fff}',
    '[dir="rtl"] .hx-play svg{transform:scaleX(-1)}',
    '.hx-doc{flex:none;width:22px;text-align:center;color:var(--muted,#6b7280)}',
    '.hx-sep{height:1px;margin:6px 4px;background:var(--border,#dbe3ee)}',

    '.hx-panel{position:fixed;inset-inline-end:20px;bottom:20px;box-sizing:border-box;width:380px;min-width:260px;max-width:calc(100vw - 16px);resize:horizontal;overflow:hidden;background:var(--card,#fff);color:var(--text,#1f2937);border:1px solid var(--border,#dbe3ee);border-radius:18px;box-shadow:0 18px 48px rgba(31,41,55,.22);z-index:2147483000}',
    '.hx-panel[hidden]{display:none}',
    '.hx-head{display:flex;align-items:center;gap:4px;padding:6px 6px 6px 12px;border-bottom:1px solid var(--border,#dbe3ee);cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.hx-dragging .hx-head{cursor:grabbing}',
    '.hx-grip{flex:none;width:12px;height:16px;opacity:.6;background:radial-gradient(circle,var(--muted,#6b7280) 1.3px,transparent 1.6px) 0 0/6px 5px}',
    '.hx-title{flex:1;min-width:0;padding-inline-start:4px;font-weight:600;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.hx-btn{flex:none;display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:9px;background:none;color:var(--muted,#6b7280);cursor:pointer}',
    '.hx-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.hx-btn[hidden]{display:none}',
    '.hx-btn:hover{background:var(--bg,#f5f7fb);color:var(--text,#1f2937)}',
    '.hx-btn.hx-attn{color:var(--accent,#0d6efd);background:rgba(13,110,253,.1)}',
    '.hx-body video{display:block;width:100%;aspect-ratio:16/9;background:#1f2937}',
    '.hx-status{margin:0;padding:8px 12px;font-size:.85rem;color:var(--muted,#6b7280)}',
    '.hx-status:empty{display:none}',
    '.hx-status.hx-err{color:var(--danger,#b42318)}',
    '.hx-min .hx-body,.hx-inpip .hx-body{height:0;overflow:hidden}',
    '.hx-min,.hx-inpip{resize:none}',
    '.hx-pipnote{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;font-size:.88rem;color:var(--muted,#6b7280)}',
    '.hx-pipnote[hidden]{display:none}',
    '.hx-link{flex:none;padding:4px 6px;border:0;border-radius:6px;background:none;color:var(--accent,#0d6efd);font:inherit;font-weight:600;cursor:pointer}',

    '.hx-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;box-sizing:border-box;max-width:calc(100vw - 24px);padding:10px 10px 10px 18px;background:var(--card,#fff);color:var(--text,#1f2937);border:1px solid var(--border,#dbe3ee);border-radius:20px;box-shadow:0 12px 32px rgba(31,41,55,.18);font-size:.92rem;z-index:2147483001}',
    '.hx-toast-actions{display:flex;gap:4px;margin-inline-start:auto}',
    '.hx-primary{padding:7px 14px;border:0;border-radius:999px;background:var(--accent,#0d6efd);color:#fff;font:inherit;font-weight:600;cursor:pointer}',
    '.hx-primary:hover{background:var(--accent-2,#0b5ed7)}',

    '@media (max-width:640px){',
    '.hx-panel{left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;width:auto!important;min-width:0;resize:none}',
    '.hx-head{cursor:default}.hx-grip{display:none}',
    '.hx-menu-list{min-width:220px}',
    '}',
    '@media (prefers-reduced-motion:reduce){.hx-caret{transition:none}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.id = 'hx-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- floating player ---------- */
  var panel, head, video, titleEl, statusEl, pipNote, popBtn, minBtn;
  var currentId = null, placeholder = null, lastTrigger = null, lastSave = 0;
  // Tells our own exits (the "Bring back" link, closing from the page, switching clips)
  // apart from the browser's own close button on the floating window.
  var exitingByUs = false, switchedAt = 0;

  var ICONS = {
    pop: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="6" rx="1"/></svg>',
    min: '<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>',
    restore: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function iconButton(cls, icon, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hx-btn ' + cls;
    b.innerHTML = icon;
    b.title = label;
    b.setAttribute('aria-label', label);
    return b;
  }

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement('div');
    panel.className = 'hx-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', L.dialog);
    panel.hidden = true;

    head = document.createElement('div');
    head.className = 'hx-head';
    head.tabIndex = 0;
    head.title = L.move;
    var grip = document.createElement('span');
    grip.className = 'hx-grip';
    grip.setAttribute('aria-hidden', 'true');
    titleEl = document.createElement('span');
    titleEl.className = 'hx-title';
    popBtn = iconButton('hx-pop', ICONS.pop, L.popOut);
    minBtn = iconButton('hx-minbtn', ICONS.min, L.minimize);
    var closeBtn = iconButton('hx-close', ICONS.close, L.close);
    if (!canPip) popBtn.hidden = true;
    head.append(grip, titleEl, popBtn, minBtn, closeBtn);

    var body = document.createElement('div');
    body.className = 'hx-body';
    video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    statusEl = document.createElement('p');
    statusEl.className = 'hx-status';
    statusEl.setAttribute('role', 'status');
    body.append(video, statusEl);

    pipNote = document.createElement('div');
    pipNote.className = 'hx-pipnote';
    pipNote.hidden = true;
    var pipText = document.createElement('span');
    pipText.textContent = L.inPip;
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'hx-link';
    backBtn.textContent = L.backToPage;
    pipNote.append(pipText, backBtn);

    panel.append(head, body, pipNote);
    document.body.appendChild(panel);

    popBtn.addEventListener('click', function () { popBtn.classList.remove('hx-attn'); goPip(); });
    minBtn.addEventListener('click', toggleMin);
    closeBtn.addEventListener('click', closeClip);
    backBtn.addEventListener('click', leavePip);
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeClip(); }
    });

    video.addEventListener('enterpictureinpicture', function () { setPipState(true); });
    video.addEventListener('leavepictureinpicture', onPipEnded);
    video.addEventListener('webkitpresentationmodechanged', function () {
      if (video.webkitPresentationMode === 'picture-in-picture') setPipState(true);
      else if (panel.classList.contains('hx-inpip')) onPipEnded();
    });
    video.addEventListener('error', function () {
      if (!video.srcObject && video.getAttribute('src')) setStatus(L.loadError, true);
    });
    video.addEventListener('timeupdate', function () {
      var now = Date.now();
      if (now - lastSave > 2000) { lastSave = now; savePlace(); }
    });
    video.addEventListener('ended', function () { if (!placeholder) store.del(STORE_KEY); });
    window.addEventListener('pagehide', savePlace);

    enableDrag();
    window.addEventListener('resize', function () { if (!panel.hidden && panel.style.left) clampToViewport(); });
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg || '';
    statusEl.classList.toggle('hx-err', !!isError);
  }

  /* ---------- dragging (pointer + keyboard) ---------- */
  function placeAt(x, y) {
    var r = panel.getBoundingClientRect();
    x = Math.min(Math.max(8, x), Math.max(8, window.innerWidth - r.width - 8));
    y = Math.min(Math.max(8, y), Math.max(8, window.innerHeight - r.height - 8));
    panel.style.insetInlineEnd = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
  }
  function clampToViewport() {
    var r = panel.getBoundingClientRect();
    placeAt(r.left, r.top);
  }
  function savePos() {
    var r = panel.getBoundingClientRect();
    store.set(POS_KEY, { x: r.left, y: r.top, w: r.width });
  }
  function restorePos() {
    var p = store.get(POS_KEY);
    if (!p || docked.matches) return;
    if (p.w) panel.style.width = p.w + 'px';
    placeAt(p.x, p.y);
  }
  function enableDrag() {
    var sx, sy, ox, oy, dragging = false;
    head.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button') || docked.matches) return;
      dragging = true;
      head.setPointerCapture(e.pointerId);
      var r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      panel.classList.add('hx-dragging');
    });
    head.addEventListener('pointermove', function (e) {
      if (dragging) placeAt(ox + e.clientX - sx, oy + e.clientY - sy);
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('hx-dragging');
      savePos();
    }
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
    head.addEventListener('keydown', function (e) {
      if (docked.matches || e.target !== head) return;
      var d = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key];
      if (!d) return;
      e.preventDefault();
      var r = panel.getBoundingClientRect();
      placeAt(r.left + d[0], r.top + d[1]);
      savePos();
    });
    // remember the width after the user resizes with the corner handle
    if ('ResizeObserver' in window) {
      var t = 0;
      new ResizeObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () { if (!panel.hidden && !docked.matches) savePos(); }, 300);
      }).observe(panel);
    }
  }

  /* ---------- placeholder video (used while a clip has no recorded src) ---------- */
  function makePlaceholder(clip, startSec) {
    var c = document.createElement('canvas');
    c.width = 640; c.height = 360;
    var g = c.getContext('2d');
    var steps = (clip.demoSteps && clip.demoSteps.length) ? clip.demoSteps : ['Your recorded video goes here.'];
    var stepLen = 5000, total = steps.length * stepLen;
    var elapsed = (startSec || 0) * 1000, last = performance.now();
    var font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

    function rr(x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    }
    function wrap(text, x, y, maxW, lh) {
      var words = text.split(' '), line = '';
      for (var i = 0; i < words.length; i++) {
        var test = line ? line + ' ' + words[i] : words[i];
        if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = words[i]; y += lh; }
        else line = test;
      }
      g.fillText(line, x, y);
    }
    function draw() {
      var now = performance.now();
      if (!video.paused) elapsed += now - last;
      last = now;
      var t = elapsed % total, idx = Math.floor(t / stepLen);
      g.fillStyle = '#f5f7fb'; g.fillRect(0, 0, 640, 360);
      rr(36, 32, 568, 296, 20); g.fillStyle = '#fff'; g.fill();
      g.strokeStyle = '#dbe3ee'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#1f2937'; g.font = '700 28px ' + font; g.fillText(clip.title || '', 68, 88);
      g.fillStyle = '#6b7280'; g.font = '500 16px ' + font;
      g.fillText('Step ' + (idx + 1) + ' of ' + steps.length, 68, 124);
      g.fillStyle = '#1f2937'; g.font = '400 23px ' + font;
      wrap(steps[idx], 68, 170, 500, 32);
      rr(68, 262, 504, 8, 4); g.fillStyle = '#dbe3ee'; g.fill();
      rr(68, 262, Math.max(8, 504 * (t / total)), 8, 4); g.fillStyle = '#0d6efd'; g.fill();
      g.fillStyle = '#6b7280'; g.font = '400 14px ' + font;
      g.fillText('Placeholder until the recorded video is added', 68, 300);
      g.textAlign = 'right'; g.fillText(fmt(elapsed / 1000), 572, 300); g.textAlign = 'left';
    }
    draw();
    var timer = setInterval(draw, 1000 / 30);
    var stream = c.captureStream ? c.captureStream(30) : null;
    return {
      stream: stream,
      seconds: function () { return elapsed / 1000; },
      stop: function () {
        clearInterval(timer);
        if (stream) stream.getTracks().forEach(function (tr) { tr.stop(); });
      }
    };
  }
  function stopPlaceholder() {
    if (placeholder) { placeholder.stop(); placeholder = null; }
  }

  /* ---------- loading, opening, closing ---------- */
  function loadClip(id, time, remember) {
    var clip = CLIPS[id];
    if (!clip) return false;
    stopPlaceholder();
    if (inPip()) switchedAt = Date.now();
    currentId = id;
    titleEl.textContent = clip.title || id;
    setStatus('');
    Array.prototype.slice.call(video.querySelectorAll('track')).forEach(function (t) { t.remove(); });
    video.srcObject = null;
    video.removeAttribute('src');
    video.removeAttribute('poster');

    if (clip.src) {
      if (clip.poster) video.poster = clip.poster;
      var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
      var caps = clip.captions || {};
      Object.keys(caps).forEach(function (code) {
        var tr = document.createElement('track');
        tr.kind = 'subtitles';
        tr.srclang = code;
        tr.src = caps[code];
        tr.label = (clip.captionLabels && clip.captionLabels[code]) || code.toUpperCase();
        if (code === lang) tr.default = true;
        video.appendChild(tr);
      });
      video.src = clip.src;
      if (time > 0) {
        video.addEventListener('loadedmetadata', function () {
          try { video.currentTime = isFinite(video.duration) ? Math.min(time, video.duration - 1) : time; } catch (e) {}
        }, { once: true });
      }
      video.load();
    } else {
      placeholder = makePlaceholder(clip, time);
      if (placeholder.stream) video.srcObject = placeholder.stream;
      else setStatus(L.loadError, true);
    }
    if (remember) store.set(STORE_KEY, { id: id, t: time || 0 });
    return true;
  }

  // Called on hover/focus/menu-open so metadata is usually ready by the time
  // someone taps, which keeps the Picture-in-Picture request inside their tap.
  function prepare(id) {
    ensurePanel();
    if (!panel.hidden || currentId === id || !CLIPS[id]) return;
    loadClip(id, 0, false);
  }

  function show() {
    var wasHidden = panel.hidden;
    panel.hidden = false;
    panel.classList.remove('hx-min');
    setMinIcon();
    if (wasHidden) restorePos();
  }

  function openClip(id, opts) {
    opts = opts || {};
    if (!CLIPS[id]) return;
    ensurePanel();
    dismissToast();
    if (currentId !== id || opts.time) loadClip(id, opts.time || 0, true);
    else store.set(STORE_KEY, { id: id, t: currentSeconds() });
    show();
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
    if (opts.pip !== false) goPip();
    else head.focus();
  }

  function waitForMetadata(ms) {
    return new Promise(function (resolve) {
      if (video.readyState >= 1) return resolve(true);
      var done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('error', onErr);
        resolve(ok);
      }
      function onMeta() { finish(true); }
      function onErr() { finish(false); }
      video.addEventListener('loadedmetadata', onMeta);
      video.addEventListener('error', onErr);
      setTimeout(function () { finish(false); }, ms);
    });
  }

  function goPip() {
    if (!canPip) { head.focus(); return; }
    if (nativePip && document.pictureInPictureElement === video) return;
    var ready = video.readyState >= 1;
    if (!ready) setStatus(L.loading);
    // If metadata is already loaded, request synchronously (best chance of keeping the tap's permission).
    var wait = ready ? Promise.resolve(true) : waitForMetadata(4000);
    return wait.then(function (ok) {
      if (!ready) setStatus('');
      if (!ok) { popBtn.classList.add('hx-attn'); head.focus(); return; }
      try {
        if (nativePip) {
          return video.requestPictureInPicture().catch(function () {
            // The tap's permission expired or the browser said no: stay in the floating window.
            popBtn.classList.add('hx-attn');
            head.focus();
          });
        }
        video.webkitSetPresentationMode('picture-in-picture');
      } catch (e) {
        popBtn.classList.add('hx-attn');
        head.focus();
      }
    });
  }

  function inPip() {
    return nativePip ? document.pictureInPictureElement === video
                     : (webkitPip && video.webkitPresentationMode === 'picture-in-picture');
  }

  function leavePip() {
    if (!inPip()) return;
    exitingByUs = true;
    try {
      if (nativePip) document.exitPictureInPicture();
      else video.webkitSetPresentationMode('inline');
    } catch (e) { exitingByUs = false; }
  }

  // The floating window was closed. If the page asked for that, show the video in the
  // page again. If the person used the window's own close button, close the tutorial.
  function onPipEnded() {
    setPipState(false);
    var ours = exitingByUs || (Date.now() - switchedAt < 1500);
    exitingByUs = false;
    if (!ours && panel && !panel.hidden) closeClip();
  }

  function setPipState(on) {
    panel.classList.toggle('hx-inpip', on);
    pipNote.hidden = !on;
    popBtn.hidden = on || !canPip;
    minBtn.hidden = on;
    if (on) popBtn.classList.remove('hx-attn');
  }

  function setMinIcon() {
    var min = panel.classList.contains('hx-min');
    minBtn.innerHTML = min ? ICONS.restore : ICONS.min;
    minBtn.title = min ? L.restore : L.minimize;
    minBtn.setAttribute('aria-label', minBtn.title);
  }
  function toggleMin() {
    panel.classList.toggle('hx-min');
    setMinIcon();
    if (panel.style.left) clampToViewport();
  }

  function currentSeconds() {
    return placeholder ? placeholder.seconds() : (video ? video.currentTime : 0);
  }
  function savePlace() {
    if (currentId && panel && !panel.hidden) store.set(STORE_KEY, { id: currentId, t: currentSeconds() });
  }

  function closeClip() {
    if (!panel) return;
    leavePip();
    video.pause();
    stopPlaceholder();
    video.srcObject = null;
    video.removeAttribute('src');
    video.load();
    currentId = null;
    panel.hidden = true;
    panel.classList.remove('hx-inpip', 'hx-min');
    pipNote.hidden = true;
    store.del(STORE_KEY);
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  /* ---------- resume offer after moving to another page ---------- */
  var toast = null;
  function dismissToast() {
    if (toast) { toast.remove(); toast = null; }
  }
  function offerResume() {
    var s = store.get(STORE_KEY);
    if (!s || !CLIPS[s.id] || !(s.t >= 3)) return;
    toast = document.createElement('div');
    toast.className = 'hx-toast';
    toast.setAttribute('role', 'status');
    var msg = document.createElement('span');
    msg.textContent = L.resume.replace('{title}', CLIPS[s.id].title || s.id).replace('{time}', fmt(s.t));
    var actions = document.createElement('div');
    actions.className = 'hx-toast-actions';
    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'hx-primary';
    yes.textContent = L.resumeBtn;
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'hx-link';
    no.textContent = L.dismiss;
    actions.append(yes, no);
    toast.append(msg, actions);
    document.body.appendChild(toast);
    yes.addEventListener('click', function () { openClip(s.id, { time: s.t }); });
    no.addEventListener('click', function () { store.del(STORE_KEY); dismissToast(); });
  }

  /* ---------- the How To menu(s) ---------- */
  function wireMenu(menu) {
    if (menu.dataset.hxWired) return;
    menu.dataset.hxWired = '1';
    var btn = menu.querySelector('.hx-menu-btn');
    var list = menu.querySelector('.hx-menu-list');
    if (!btn || !list) return;
    function items() { return Array.prototype.slice.call(list.querySelectorAll('[role="menuitem"]')); }
    function open(focusFirst) {
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      // keep the menu on screen when the button sits near the edge of the bar
      list.classList.remove('hx-end');
      var r = list.getBoundingClientRect();
      if (r.right > window.innerWidth - 8 || r.left < 8) list.classList.add('hx-end');
      var first = list.querySelector('[data-howto]');
      if (first) prepare(first.getAttribute('data-howto'));
      if (focusFirst && items()[0]) items()[0].focus();
    }
    function close(refocus) {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus();
    }
    btn.addEventListener('click', function () { list.hidden ? open(false) : close(false); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(true); }
    });
    list.addEventListener('keydown', function (e) {
      var its = items(), i = its.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); its[(i + 1) % its.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); its[(i - 1 + its.length) % its.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); its[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); its[its.length - 1].focus(); }
      else if (e.key === 'Escape') { close(true); }
      else if (e.key === 'Tab') { close(false); }
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) close(false); });
    function prep(e) {
      var b = e.target.closest && e.target.closest('[data-howto]');
      if (b) prepare(b.getAttribute('data-howto'));
    }
    list.addEventListener('pointerover', prep);
    list.addEventListener('focusin', prep);
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-howto]');
      if (!b) return;
      lastTrigger = btn;
      close(false);
      openClip(b.getAttribute('data-howto'));
    });
  }

  // Any other element with data-howto (e.g. the tutorial list on a tutorial page) opens its clip too.
  function wireButtons() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-howto]');
      if (!b || b.closest('.hx-menu') || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      lastTrigger = b;
      openClip(b.getAttribute('data-howto'));
    });
    function prep(e) {
      var b = e.target.closest && e.target.closest('[data-howto]');
      if (b && !b.closest('.hx-menu')) prepare(b.getAttribute('data-howto'));
    }
    document.addEventListener('pointerover', prep);
    document.addEventListener('focusin', prep);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.hx-menu'), wireMenu);
    wireButtons();
    offerResume();
  }

  window.EC1HowTo = {
    open: openClip,
    close: closeClip,
    wire: function (root) { Array.prototype.forEach.call((root || document).querySelectorAll('.hx-menu'), wireMenu); },
    supports: { nativePip: nativePip, webkitPip: webkitPip },
    version: 2,
    handlesButtons: true
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
