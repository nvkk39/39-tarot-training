/* app.js — UI state, SVG card renderer, quiz logic and spreads.
 * Data lives in data/*.js, language handling in i18n.js and coaching logic in engine.js;
 * this file only renders and stores.
 */
(function () {
  'use strict';

  var D = window.TarotData;
  var SP = window.TarotSpreads;
  var Coach = window.CoachEngine;
  var I = window.I18n;
  var T = I.t;
  var CARDS = D.cards;

  var KEYS = {
    quiz: 'arcana.quiz.v1',
    session: 'arcana.session.v1',
    tab: 'arcana.tab.v1'
  };

  /* ---------- storage ---------- */
  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { toast(T('storage.fail')); return false; }
  }

  var quiz = load(KEYS.quiz, null) || { stats: {}, streak: 0, best: 0 };
  var session = load(KEYS.session, null) || {};
  (function normalizeSession() {
    var d = { spreadId: 'three', category: 'romance', promptIdx: -1, custom: '', reversals: true, dealt: null, text: '', feedback: null };
    Object.keys(d).forEach(function (k) { if (session[k] === undefined) session[k] = d[k]; });
    delete session.prompt; // older versions stored the prompt text; we now store an index so it follows the language
    if (!SP.spreadById[session.spreadId]) session.spreadId = 'three';
    if (session.dealt && !SP.spreadById[session.dealt.spreadId]) { session.dealt = null; session.text = ''; session.feedback = null; }
  })();

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rnd(n) {
    var a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] % n;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  function ct(card) { return I.cardText(card); }
  function cardLabel(card, reversed) { return ct(card).name + (reversed ? T('card.rev') : ''); }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString(T('fmt.date'), { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return iso; }
  }
  function sepJoin(list) { return list.join(I.lang() === 'ja' ? '・' : ' · '); }
  function stripNo(label) { return label.replace(/^\d+\s*·\s*/, ''); }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- static text & language ---------- */
  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = T(n.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', T(n.getAttribute('data-i18n-aria'))); });
    document.title = T('doc.title');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', T('doc.desc'));
    var cur = I.langs.filter(function (l) { return l.code === I.lang(); })[0];
    document.getElementById('langLabel').textContent = I.lang();
  }

  function openLanguageSheet() {
    var body = el('div', { class: 'stack', role: 'radiogroup', 'aria-label': T('lang.title') });
    I.langs.forEach(function (l) {
      var on = l.code === I.lang();
      body.appendChild(el('button', {
        type: 'button', class: 'option' + (on ? ' correct' : ''), role: 'radio', 'aria-checked': String(on),
        text: (on ? '✓ ' : '') + l.label,
        onclick: function () { I.setLang(l.code); closeSheet(); }
      }));
    });
    openSheet(T('lang.title'), body);
  }

  /* ---------- bottom sheet ---------- */
  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var lastFocus = null;
  function openSheet(title, node) {
    lastFocus = document.activeElement;
    document.getElementById('sheetTitle').textContent = title;
    sheetBody.replaceChildren(node);
    sheet.hidden = false;
    document.body.classList.add('no-scroll');
    sheetBody.scrollTop = 0;
    sheet.querySelector('.icon-btn').focus();
  }
  function closeSheet() {
    sheet.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  sheet.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  /* ---------- SVG card renderer ---------- */
  /* Rider-Waite-Smith (Pamela Colman Smith, 1909 — public domain) scans, resized to img/cards/<card id>.webp. */
  function cardSVG(card, reversed) {
    var s = '<svg class="card-svg' + (reversed ? ' reversed' : '') + '" data-suit="' + (card.arcana === 'major' ? 'major' : card.suit) + '" viewBox="0 0 200 331.11" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(cardLabel(card, reversed)) + '">';
    s += '<defs><clipPath id="cardclip"><rect width="200" height="331.11" rx="3"/></clipPath></defs>';
    s += '<image href="img/cards/' + card.id + '.webp" width="200" height="331.11" clip-path="url(#cardclip)" preserveAspectRatio="xMidYMid slice"/>';
    s += '</svg>';
    return s;
  }
  function cardNode(card, reversed) {
    var d = document.createElement('div');
    d.innerHTML = cardSVG(card, reversed); // generated from local data only
    return d.firstChild;
  }

  /* ---------- card detail sheet ---------- */
  function kwList(list, rev) {
    return el('div', { class: 'kw' + (rev ? ' rev' : '') }, list.map(function (k) { return el('span', { text: k }); }));
  }
  function showCardDetail(card, opts) {
    opts = opts || {};
    var reversed = !!opts.reversed;
    var tx = ct(card);
    var body = el('div');
    if (opts.position) {
      body.appendChild(el('div', { class: 'card-panel pos-panel' }, [
        el('span', { class: 'tag', text: opts.position.label }),
        el('p', { class: 'small muted', text: opts.position.hint })
      ]));
    }
    var group = card.arcana === 'major' ? T('card.major') : I.suitName(card.suit);
    var top = el('div', { class: 'detail-top' }, [
      el('div', {}, [cardNode(card, reversed)]),
      el('div', {}, [
        el('span', { class: 'tag', text: group }),
        el('h3', { text: cardLabel(card, reversed) })
      ])
    ]);
    var info = top.lastChild;
    if (opts.compact) {
      info.appendChild(el('div', { class: 'tag', text: reversed ? T('card.reversed') : T('card.upright') }));
      info.appendChild(kwList(reversed ? tx.revKeywords : tx.upKeywords, reversed));
      info.appendChild(el('p', { text: reversed ? tx.rev : tx.up }));
      body.appendChild(top);
    } else {
      info.appendChild(el('p', { class: 'small muted', text: tx.symbolism }));
      body.appendChild(top);
      body.appendChild(el('h3', { text: T('card.upright') }));
      body.appendChild(kwList(tx.upKeywords, false));
      body.appendChild(el('p', { text: tx.up }));
      body.appendChild(el('h3', { text: T('card.reversed') }));
      body.appendChild(kwList(tx.revKeywords, true));
      body.appendChild(el('p', { text: tx.rev }));
    }
    openSheet(tx.name, body);
  }

  /* ---------- views ---------- */
  var view = document.getElementById('view');
  var tabs = ['guide', 'quiz', 'expand'];
  var currentTab = load(KEYS.tab, 'guide');
  if (tabs.indexOf(currentTab) < 0) currentTab = 'guide';

  function go(tab) {
    currentTab = tab;
    save(KEYS.tab, tab);
    document.querySelectorAll('.tab').forEach(function (b) {
      if (b.getAttribute('data-tab') === tab) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    render();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-tab')); });
  });

  function render() {
    view.replaceChildren();
    view.setAttribute('data-tab', currentTab);
    if (currentTab === 'guide') renderGuide(view);
    else if (currentTab === 'quiz') renderQuiz(view);
    else renderExpand(view);
  }

  /* ===== Guide ===== */
  var guide = { filter: 'all' };
  function filterDefs() {
    return [['all', T('guide.all')], ['major', T('guide.major')],
      ['wands', T('guide.fwands')], ['cups', T('guide.fcups')], ['swords', T('guide.fswords')], ['pentacles', T('guide.fpentacles')]];
  }

  function renderGuide(root) {
    var list = el('div');
    var chips = el('div', { class: 'chips', role: 'group', 'aria-label': T('guide.filterAria') });
    function drawChips() {
      chips.replaceChildren();
      filterDefs().forEach(function (f) {
        chips.appendChild(el('button', {
          type: 'button', class: 'chip', 'aria-pressed': String(guide.filter === f[0]), text: f[1],
          onclick: function () { guide.filter = f[0]; drawChips(); fillList(); }
        }));
      });
    }
    function fillList() {
      list.replaceChildren();
      var items = CARDS.filter(function (c) {
        if (guide.filter === 'major' && c.arcana !== 'major') return false;
        if (['wands', 'cups', 'swords', 'pentacles'].indexOf(guide.filter) >= 0 && c.suit !== guide.filter) return false;
        return true;
      });
      if (!items.length) { list.appendChild(el('p', { class: 'muted', text: T('guide.none') })); return; }
      var info = I.suitInfo(guide.filter);
      if (info) {
        list.appendChild(el('div', { class: 'card-panel suit-info' }, [
          el('p', { class: 'suit-line suit-' + guide.filter, text: info.title }),
          el('p', { text: info.text })
        ]));
      }
      var grid = el('div', { class: 'grid' });
      items.forEach(function (c) {
        grid.appendChild(el('button', {
          type: 'button', class: 'grid-item', 'aria-label': ct(c).name,
          onclick: function () { showCardDetail(c, {}); }
        }, [cardNode(c, false), el('span', { class: 'name', text: ct(c).short })]));
      });
      list.appendChild(grid);
    }
    root.appendChild(chips);
    root.appendChild(list);
    drawChips();
    fillList();
  }

  /* ===== Quiz ===== */
  var qState = null;
  var lastQuizId = null;

  function weakIds() {
    return CARDS.filter(function (c) { var s = quiz.stats[c.id]; return s && s.pending; }).map(function (c) { return c.id; });
  }
  function pickQuizCard() {
    if (quiz.mode === 'weak') {
      var ids = weakIds().filter(function (id) { return id !== lastQuizId; });
      if (!ids.length) ids = weakIds();
      if (ids.length) return D.byId[ids[rnd(ids.length)]];
    }
    var total = 0;
    var weights = CARDS.map(function (c) {
      if (c.id === lastQuizId) return 0;
      var st = quiz.stats[c.id];
      var w = (!st || !st.seen) ? 3 : 1 + 4 * ((st.seen - st.correct) / st.seen);
      total += w;
      return w;
    });
    var r = Math.random() * total;
    for (var i = 0; i < CARDS.length; i++) {
      r -= weights[i];
      if (r <= 0 && weights[i] > 0) return CARDS[i];
    }
    return CARDS[0];
  }
  function newQuestion() {
    var card = pickQuizCard();
    lastQuizId = card.id;
    var reversed = rnd(2) === 1;
    var pool = CARDS.filter(function (c) { return c.id !== card.id && c.arcana === card.arcana; });
    if (pool.length < 3) pool = CARDS.filter(function (c) { return c.id !== card.id; });
    var decoys = shuffle(pool).slice(0, 3);
    // only ids are stored; option text is derived at render time so it follows the language
    qState = { cardId: card.id, reversed: reversed, options: shuffle([card].concat(decoys)).map(function (c) { return c.id; }), picked: null };
  }
  function answerQuiz(optId) {
    if (qState.picked) return;
    qState.picked = optId;
    var ok = optId === qState.cardId;
    var st = quiz.stats[qState.cardId] || { seen: 0, correct: 0 };
    st.seen += 1; if (ok) st.correct += 1;
    st.pending = !ok;
    quiz.stats[qState.cardId] = st;
    quiz.streak = ok ? quiz.streak + 1 : 0;
    quiz.best = Math.max(quiz.best, quiz.streak);
    save(KEYS.quiz, quiz);
    render();
  }
  function quizTotals() {
    var seen = 0, correct = 0, tracked = 0;
    Object.keys(quiz.stats).forEach(function (id) {
      var s = quiz.stats[id]; seen += s.seen; correct += s.correct; if (s.seen) tracked++;
    });
    return { seen: seen, correct: correct, tracked: tracked };
  }

  function renderQuiz(root) {
    if (!qState) newQuestion();
    var card = D.byId[qState.cardId];
    var nWeak = weakIds().length;
    root.appendChild(el('div', { class: 'quiz-head' }, [
      el('h2', { text: T('quiz.title') })
    ]));
    var modes = el('div', { class: 'chips quiz-modes', role: 'group' });
    [['random', T('quiz.modeRandom')], ['weak', T('quiz.modeWeak')]].forEach(function (m) {
      modes.appendChild(el('button', {
        type: 'button', class: 'chip', 'aria-pressed': String((quiz.mode || 'random') === m[0]), text: m[1],
        onclick: function () { quiz.mode = m[0]; save(KEYS.quiz, quiz); lastQuizId = null; newQuestion(); render(); }
      }));
    });
    root.appendChild(modes);
    if (quiz.mode === 'weak' && !nWeak && !qState.picked) {
      root.appendChild(el('div', { class: 'card-panel' }, [el('p', { text: T('quiz.noWeak') })]));
      return;
    }

    var panel = el('div', { class: 'card-panel' });
    panel.appendChild(el('div', { class: 'quiz-card' }, [cardNode(card, qState.reversed)]));
    panel.appendChild(el('p', { class: 'small', style: 'text-align:center;white-space:pre-line', text: T(qState.reversed ? 'quiz.askRev' : 'quiz.askUp') }));
    var opts = el('div', { class: 'options' });
    qState.options.forEach(function (id) {
      var c = D.byId[id];
      var cls = 'option';
      if (qState.picked) {
        if (id === qState.cardId) cls += ' correct';
        else if (id === qState.picked) cls += ' wrong';
      }
      opts.appendChild(el('button', {
        type: 'button', class: cls, disabled: !!qState.picked, text: qState.reversed ? ct(c).rev : ct(c).up,
        onclick: function () { answerQuiz(id); }
      }));
    });
    panel.appendChild(opts);

    if (qState.picked) {
      var ok = qState.picked === qState.cardId;
      var tx = ct(card);
      panel.appendChild(el('div', { class: 'verdict ' + (ok ? 'ok' : 'ng'), 'aria-label': T(ok ? 'quiz.correct' : 'quiz.incorrect'), text: ok ? '○' : '×' }));
      panel.appendChild(el('p', { style: 'text-align:center' }, [
        el('b', { text: cardLabel(card, qState.reversed) }),
        el('br'),
        el('span', { class: 'small muted', text: sepJoin(qState.reversed ? tx.revKeywords : tx.upKeywords) })
      ]));
      panel.appendChild(el('div', { class: 'row' }, [
        el('button', { type: 'button', class: 'btn block', text: T('quiz.next'), onclick: function () { newQuestion(); render(); window.scrollTo(0, 0); } })
      ]));
    }
    root.appendChild(panel);
  }

  /* ===== Expand (spreads + coach) ===== */
  function saveSession() { save(KEYS.session, session); }
  function pickPromptIdx() {
    var list = I.prompts(session.category);
    if (!list.length) return -1;
    var next;
    do { next = rnd(list.length); } while (list.length > 1 && next === session.promptIdx);
    return next;
  }
  function promptText() {
    var list = I.prompts(session.category);
    return list[session.promptIdx] || '';
  }
  function currentQuestion() { return promptText(); }

  function dealSpread() {
    var spread = I.spread(session.spreadId);
    if (session.dealt && (session.text || '').trim() && !confirm(T('exp.dealConfirm'))) return;
    var deck = shuffle(CARDS.map(function (c) { return c.id; }));
    session.dealt = {
      spreadId: spread.id,
      question: currentQuestion(),
      cards: spread.positions.map(function (p, i) { return { id: deck[i], reversed: rnd(2) === 1 }; })
    };
    session.text = '';
    session.feedback = null;
    saveSession();
    render();
  }

  function renderExpand(root) {
    if (session.promptIdx < 0 || !promptText()) { session.promptIdx = pickPromptIdx(); saveSession(); }
    var spread = I.spread(session.spreadId);
    root.appendChild(el('h2', { text: T('exp.title') }));

    var setup = el('div', { class: 'card-panel stack' });
    setup.appendChild(el('div', { class: 'tag', text: T('exp.step1') }));
    var sc = el('div', { class: 'chips', role: 'group', 'aria-label': T('exp.spreadAria') });
    I.spreads().forEach(function (s) {
      sc.appendChild(el('button', {
        type: 'button', class: 'chip', 'aria-pressed': String(s.id === session.spreadId), text: s.name + ' (' + s.positions.length + ')',
        onclick: function () { session.spreadId = s.id; saveSession(); render(); }
      }));
    });
    setup.appendChild(sc);
    setup.appendChild(el('p', { class: 'small muted', text: spread.subtitle }));

    setup.appendChild(el('div', { class: 'tag', text: T('exp.step2') }));
    var cc = el('div', { class: 'chips', role: 'group', 'aria-label': T('exp.catAria') });
    I.categories().forEach(function (c) {
      cc.appendChild(el('button', {
        type: 'button', class: 'chip', 'aria-pressed': String(c.id === session.category), text: c.label,
        onclick: function () { session.category = c.id; session.promptIdx = pickPromptIdx(); saveSession(); render(); }
      }));
    });
    setup.appendChild(cc);
    setup.appendChild(el('p', { text: '“' + promptText() + '”' }));
    setup.appendChild(el('button', { type: 'button', class: 'btn gold block', text: T(session.dealt ? 'exp.dealAgain' : 'exp.deal'), onclick: dealSpread }));
    root.appendChild(setup);

    if (!session.dealt) {
      root.appendChild(el('p', { class: 'muted small', text: T('exp.intro') }));
      return;
    }

    var d = session.dealt;
    var dSpread = I.spread(d.spreadId);
    var panel = el('div', { class: 'card-panel' });
    panel.appendChild(spreadGrid(dSpread, d.cards));
    panel.appendChild(el('p', { class: 'small muted', text: T('exp.tapHint') }));
    var legend = el('ol', { class: 'legend' });
    dSpread.positions.forEach(function (p, i) {
      var c = D.byId[d.cards[i].id];
      legend.appendChild(el('li', {}, [
        el('b', { text: p.label + (I.lang() === 'ja' ? '：' : ': ') }), cardLabel(c, d.cards[i].reversed),
        el('div', { class: 'small muted', text: p.hint })
      ]));
    });
    root.appendChild(panel);

    var rp = el('div', { class: 'card-panel stack' });
    rp.appendChild(el('h3', { text: T('exp.yourReading') }));
    var ta = el('textarea', {
      placeholder: T('exp.placeholder'), 'aria-label': T('exp.readingAria'),
      oninput: function (e) { session.text = e.target.value; saveSession(); }
    });
    ta.value = session.text || '';
    rp.appendChild(ta);
    rp.appendChild(el('div', { class: 'row' }, [
      el('button', { type: 'button', class: 'btn gold review', text: T('exp.coach'), onclick: runCoach })
    ]));
    root.appendChild(rp);
    root.appendChild(el('div', { class: 'card-panel legend-panel' }, [legend]));

    if (session.feedback) root.appendChild(feedbackPanel(session.feedback));
  }

  function spreadGrid(spread, cards) {
    var grid = el('div', { class: 'spread spread-' + spread.id, style: 'grid-template-columns: repeat(' + spread.cols + ', 1fr)' });
    var celtic = false;
    spread.positions.forEach(function (p, i) {
      var c = D.byId[cards[i].id];
      var cell = el('div', {
        class: 'spread-cell' + (p.rotate ? ' crossing' : ''),
        style: 'grid-column:' + p.col + ';grid-row:' + p.row + (p.rotate ? ';z-index:2' : '') + ((p.dx || p.dy) ? ';transform:translate(' + (p.dx || 0) + '%,' + (p.dy || 0) + '%)' : '')
      });
      var btn = el('button', {
        type: 'button', class: 'spread-card', 'aria-label': p.label + ': ' + cardLabel(c, cards[i].reversed),
        onclick: function () { showCardDetail(c, { reversed: cards[i].reversed, position: p, compact: true }); }
      }, [cardNode(c, cards[i].reversed), el('span', { class: 'badge', text: String(i + 1) })]);
      cell.appendChild(btn);
      if (!celtic) cell.appendChild(el('span', { class: 'cell-label', text: p.label }));
      grid.appendChild(cell);
    });
    return grid;
  }

  function evaluateSession() {
    var d = session.dealt;
    return Coach.evaluateReading({
      spread: I.spread(d.spreadId), cards: d.cards, question: d.question, text: session.text || '', lang: I.lang()
    });
  }
  function runCoach() {
    if (!session.dealt) return;
    session.feedback = evaluateSession();
    saveSession();
    render();
    var fb = view.querySelector('[data-feedback]');
    if (fb) fb.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function feedbackPanel(fb) {
    var p = el('div', { class: 'card-panel', 'data-feedback': '1' });
    p.appendChild(el('h3', { text: T('fb.title') }));
    if (fb.tooShort) {
      p.appendChild(el('p', { text: T('fb.tooShort') }));
      if (fb.patterns && fb.patterns.length) {
        p.appendChild(el('p', { class: 'small muted', text: T('fb.hint', { patterns: fb.patterns.map(function (x) { return x.title; }).join(I.lang() === 'ja' ? '、' : '; ') }) }));
      }
    } else {
      p.appendChild(el('div', { class: 'row between' }, [
        el('span', { class: 'stars', text: stars(fb.overall.stars), 'aria-label': T('fb.overallAria', { n: fb.overall.stars }) }),
        el('span', { class: 'muted small', text: T('fb.overall', { n: fb.overall.score }) })
      ]));
      fb.criteria.forEach(function (c, i) {
        var box = el('div', { class: 'crit' }, [
          el('div', { class: 'row between' }, [el('b', { text: (i + 1) + '. ' + c.title }), el('span', { class: 'stars', text: stars(c.stars) })])
        ]);
        var ul = el('ul');
        c.points.forEach(function (pt) { ul.appendChild(el('li', { class: pt.type, text: pt.text })); });
        box.appendChild(ul);
        p.appendChild(box);
      });
    }
    p.appendChild(el('p', { class: 'small muted', text: T('fb.footer', { engine: fb.engine }) }));
    return p;
  }

  /* ---------- install prompt ---------- */
  var installBtn = document.getElementById('installBtn');
  var deferredPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isStandalone) {
    if (isIOS) installBtn.hidden = false;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferredPrompt = e; installBtn.hidden = false;
    });
  }
  window.addEventListener('appinstalled', function () { installBtn.hidden = true; deferredPrompt = null; toast(T('install.done')); });
  installBtn.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; installBtn.hidden = true; });
      return;
    }
    var body = el('div', { class: 'stack' }, [
      el('h3', { text: T('install.ios') }),
      el('ol', {}, [el('li', { text: T('install.ios1') }), el('li', { text: T('install.ios2') }), el('li', { text: T('install.ios3') })]),
      el('h3', { text: T('install.android') }),
      el('ol', {}, [el('li', { text: T('install.android1') }), el('li', { text: T('install.android2') })]),
      el('p', { class: 'small muted', text: T('install.note') })
    ]);
    openSheet(T('install.title'), body);
  });

  /* ---------- language switching ---------- */
  document.getElementById('langBtn').addEventListener('click', openLanguageSheet);
  I.onChange(function () {
    applyStatic();
    // Re-run the coach in the new language so the visible feedback matches the UI.
    if (session.dealt && session.feedback) session.feedback = evaluateSession();
    saveSession();
    render();
  });

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline features unavailable */ });
    });
  }

  applyStatic();
  go(currentTab);
})();
