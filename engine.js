/* engine.js — in-browser Reading Coach (Phase 1: deterministic rule & pattern engine), English + Japanese.
 *
 * Public API (the only thing the UI depends on):
 *   CoachEngine.evaluateReading({ spread, cards, question, text, lang }) -> result
 *     spread  : localized spread from I18n.spread(id)  (positions aligned by index with cards)
 *     cards   : [{ id, reversed }]
 *     question: string
 *     text    : the learner's written interpretation
 *     lang    : language for the feedback text ('ja' | 'en'); defaults to the UI language
 *   result = { engine, lang, overall:{score,stars}, criteria:[{id,title,short,score,stars,summary,points:[{type,text}]}],
 *              patterns:[{id,title,detail,addressed}], perCard:[...] }
 *
 * Matching language is detected from the reading itself, so a Japanese UI can still coach an English
 * reading and vice versa. Feedback text always follows `lang`.
 *
 * Phase 2 (client-side semantic embeddings, e.g. Transformers.js) can replace the body of
 * evaluateReading() — or wrap this one — without touching the UI as long as the result shape stays.
 */
(function (global) {
  'use strict';

  var I = function () { return global.I18n; };

  /* ---------- messages ---------- */
  var MSG = {
    en: {
      'title.alignment': 'Card & Position Alignment', 'title.cohesion': 'Narrative Cohesion', 'title.pro': 'Review Result',
      'short.alignment': 'Alignment', 'short.cohesion': 'Cohesion', 'short.pro': 'Pro',
      'orient.up': 'upright', 'orient.rev': 'reversed',
      'head': '{card} ({pos}, {orient})',
      'a.good': '{head}: your wording fits this card’s {orient} meaning.',
      'a.some': '{head}: partly there. Lean further into {kw}.',
      'a.flipped': '{head}: your wording sounds like the {other} meaning. For {orient}, think {kw}.',
      'a.thin': '{head}: you mention it, but not what it means. Try {kw}.',
      'a.missing': '{head}: not covered in your reading. Key ideas: {kw}.',
      'a.posTip': 'Tie {card} to its slot, “{pos}”: {hint}.',
      'a.sumGood': 'Your reading is grounded in the cards and where they landed.',
      'a.sumLow': 'Anchor each card’s upright/reversed meaning to its position in the spread.',
      'c.lenOk': 'You wrote enough ({n} words) to say something about every card.',
      'c.lenShort': 'Your reading is short ({n} words). Aim for a sentence or two per card, plus a conclusion.',
      'c.connOk': 'Good use of linking words ({list}) to connect cards.',
      'c.connTip': 'Link the cards with words like “because”, “however” or “which leads to” so it reads as one story, not a list.',
      'c.mentionAll': 'Every card or position is referenced.',
      'c.mentionSome': 'Only {m} of {n} cards or positions are referenced by name.',
      'c.qOk': 'You stay close to the question that was asked.',
      'c.qTip': 'Echo the question’s own words so your reading answers it directly.',
      'c.conclOk': 'You end with advice or a clear takeaway.',
      'c.conclTip': 'Finish with a direct answer or piece of advice (e.g. “Overall, I would suggest…”).',
      'c.sumGood': 'Your cards read like one connected answer.',
      'c.sumLow': 'Weave the cards into a single story that answers the question.',
      'p.got': 'You picked up on: {title}. {detail}',
      'p.note': 'Worth noting: {title}. {detail}',
      'p.none': 'No standout pattern in this spread (suits, Majors, reversals and numbers are evenly spread). Compare cards directly: which two reinforce or contradict each other?',
      'p.relOk': 'You compare cards with each other, which is what separates a reading from a list of meanings.',
      'p.relTip': 'Show how at least two cards relate (reinforce, contrast or explain each other).',
      'p.sumGood': 'You are reading across the spread, not just card by card.',
      'p.sumLow': 'Look at the whole spread: suits, Majors, reversals, repeated numbers and how cards relate.',
      'pat.suit.t': '{suit} dominate ({c} of {m} minors)',
      'pat.suit.d': 'A strong {element} presence points to a situation centred on {theme}.',
      'pat.majors.t': 'Heavy on Major Arcana ({c} of {t})',
      'pat.majors.d': 'Many Major cards suggest big, fated or life-shaping themes rather than everyday details.',
      'pat.nomajors.t': 'No Major Arcana',
      'pat.nomajors.d': 'With only Minor cards, the matter is practical and within the querent’s influence.',
      'pat.rev.t': 'Many reversals ({c} of {t})',
      'pat.rev.d': 'A high share of reversed cards often signals blocked, internal or delayed energy.',
      'pat.up.t': 'All cards upright',
      'pat.up.d': 'No reversals: the energy is flowing outward and is largely unobstructed.',
      'pat.num.t': 'Repeated number {r} (×{c})',
      'pat.num.d': 'The number {r} echoes themes of {meaning}.',
      'pat.courts.t': 'Many court cards ({c})',
      'pat.courts.d': 'Several court cards suggest the situation involves many people or personalities.',
      'pat.court.t': 'Two {rank}s',
      'pat.court.d': 'Repeated {rank}s can point to the same energy appearing in different areas or people.'
    },
    ja: {
      'title.alignment': 'カードとポジションの一致', 'title.cohesion': '物語のまとまり', 'title.pro': '添削結果',
      'short.alignment': '一致', 'short.cohesion': 'まとまり', 'short.pro': 'プロ視点',
      'orient.up': '正位置', 'orient.rev': '逆位置',
      'head': '{card}（{pos}・{orient}）',
      'a.good': '{head}：{orient}の意味に合った表現になっています。',
      'a.some': '{head}：一部は触れられています。{kw} をもう少し意識してみましょう。',
      'a.flipped': '{head}：{other}の意味に近い表現になっています。{orient}なら {kw} を意識しましょう。',
      'a.thin': '{head}：触れてはいますが、意味までは書かれていません。{kw} を使ってみましょう。',
      'a.missing': '{head}：リーディングで触れられていません。ポイント：{kw}。',
      'a.posTip': '{card}を「{pos}」の位置と結びつけましょう：{hint}。',
      'a.sumGood': 'カードと、その出た位置にしっかり根ざした読みです。',
      'a.sumLow': '各カードの正位置・逆位置の意味を、スプレッド上の位置に結びつけましょう。',
      'c.lenOk': 'すべてのカードに触れるのに十分な分量（{n}文字）です。',
      'c.lenShort': 'リーディングが短めです（{n}文字）。1枚につき1〜2文と、結論を目指しましょう。',
      'c.connOk': 'つなぎの言葉（{list}）でカード同士をうまく結べています。',
      'c.connTip': '「なぜなら」「しかし」「その結果」などでカードをつなぎ、リストではなく一つの物語にしましょう。',
      'c.mentionAll': 'すべてのカードまたはポジションに触れています。',
      'c.mentionSome': '名前で触れているのは {n} 枚中 {m} 枚だけです。',
      'c.qOk': '問われた質問から離れずに読めています。',
      'c.qTip': '質問の言葉を拾って、質問に直接答える読みにしましょう。',
      'c.conclOk': 'アドバイスや明確なまとめで締めくくれています。',
      'c.conclTip': '直接の答えやアドバイスで締めましょう（例：「全体として、〜をおすすめします」）。',
      'c.sumGood': 'カードがひとつながりの答えとして読めています。',
      'c.sumLow': 'カードを織り合わせ、質問に答える一つの物語にしましょう。',
      'p.got': '気づけています：{title}。{detail}',
      'p.note': '注目したい点：{title}。{detail}',
      'p.none': 'このスプレッドに目立つパターンはありません（スート、大アルカナ、逆位置、数字が偏っていません）。カード同士を直接比べましょう：どの2枚が補い合い、あるいは矛盾していますか？',
      'p.relOk': 'カード同士を比べられています。意味の羅列とリーディングを分けるのはこの点です。',
      'p.relTip': '少なくとも2枚の関係（補い合う、対照的、説明し合う）を示しましょう。',
      'p.sumGood': 'カード単位ではなく、スプレッド全体を読めています。',
      'p.sumLow': 'スプレッド全体を見ましょう：スート、大アルカナ、逆位置、重なる数字、カード同士の関係。',
      'pat.suit.t': '{suit}が多い（小アルカナ{m}枚中{c}枚）',
      'pat.suit.d': '{element}の要素が強く、{theme}が中心の状況を示します。',
      'pat.majors.t': '大アルカナが多い（{t}枚中{c}枚）',
      'pat.majors.d': '大アルカナが多いときは、日常の細部より、大きな流れや人生を左右するテーマを示します。',
      'pat.nomajors.t': '大アルカナなし',
      'pat.nomajors.d': '小アルカナだけなら、実務的で、相談者が影響を及ぼせる事柄です。',
      'pat.rev.t': '逆位置が多い（{t}枚中{c}枚）',
      'pat.rev.d': '逆位置が多いと、エネルギーが滞っている、内にこもっている、遅れていることを示しがちです。',
      'pat.up.t': 'すべて正位置',
      'pat.up.d': '逆位置がなく、エネルギーが外へ流れ、おおむね妨げられていません。',
      'pat.num.t': '数字{r}の重なり（×{c}）',
      'pat.num.d': '数字{r}は、{meaning}というテーマを響かせます。',
      'pat.courts.t': 'コートカードが多い（{c}枚）',
      'pat.courts.d': 'コートカードが多いと、多くの人や個性が関わる状況を示します。',
      'pat.court.t': '{rank}が2枚',
      'pat.court.d': '{rank}が重なると、同じエネルギーが別の分野や別の人に現れていることを示すことがあります。'
    }
  };
  var NUMBER_MEANING = {
    en: { 1: 'new beginnings', 2: 'choices and balance', 3: 'growth and collaboration', 4: 'stability and structure', 5: 'conflict and change', 6: 'harmony and transition', 7: 'assessment and challenge', 8: 'movement and mastery', 9: 'near-completion', 10: 'completion or overload' },
    ja: { 1: '始まり', 2: '選択とバランス', 3: '成長と協力', 4: '安定と構造', 5: '対立と変化', 6: '調和と移行', 7: '見極めと試練', 8: '動きと熟達', 9: '完成間近', 10: '完結または重荷' }
  };
  var RANK_WORD = { en: { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' }, ja: { 11: 'ペイジ', 12: 'ナイト', 13: 'クイーン', 14: 'キング' } };

  function m(lang, key, params) {
    var s = (MSG[lang] && MSG[lang][key]) || MSG.en[key] || key;
    if (params) Object.keys(params).forEach(function (k) { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function toStars(score) { return score >= 80 ? 5 : score >= 62 ? 4 : score >= 45 ? 3 : score >= 28 ? 2 : 1; }

  /* ---------- language detection (of the learner's text) ---------- */
  var JP_RE = /[぀-ヿ一-鿿]/g;
  function detectLang(text, fallback) {
    var jp = (String(text).match(JP_RE) || []).length;
    var latin = (String(text).match(/[A-Za-z]/g) || []).length;
    if (jp + latin === 0) return fallback;
    return jp / (jp + latin) >= 0.3 ? 'ja' : 'en';
  }

  /* ---------- English concept matching (light stemming) ---------- */
  var STOP = {};
  ('about above after again against also always among and another any are because been before being below ' +
    'between both but can could did does doing down during each even every few for from further had has have ' +
    'having her here hers herself him himself his how into its itself just more most much must myself not now ' +
    'off once only other our ours ourselves out over own same she should some such than that the their theirs ' +
    'them themselves then there these they this those through too under until upon very was were what when ' +
    'where which while who whom why will with would you your yours yourself yourselves').split(' ')
    .forEach(function (w) { STOP[w] = 1; });
  var RULES = [/ingly$/, /edly$/, /ations?$/, /ments?$/, /ness$/, /ful$/, /ings?$/, /ied$/, /ies$/, /ed$/, /es$/, /ly$/, /s$/, /ion$/, /ive$/, /er$/];

  function stem(word) {
    var w = String(word).toLowerCase().replace(/[^a-z]/g, '');
    if (w.length < 3 || STOP[w]) return '';
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].test(w)) {
        var s = w.replace(RULES[i], '');
        if (s.length >= 3) { w = s; break; }
      }
    }
    if (w.length >= 4) w = w.replace(/e$/, '');
    return w.slice(0, 6);
  }
  function stems(text) {
    var out = {};
    String(text).split(/[^A-Za-z]+/).forEach(function (t) { var s = stem(t); if (s) out[s] = 1; });
    return out;
  }

  var conceptCache = {};
  function conceptMapEn(card, orient) {
    var key = 'en:' + card.id + ':' + orient;
    if (conceptCache[key]) return conceptCache[key];
    var map = {};
    var kws = orient === 'rev' ? card.revKeywords : card.upKeywords;
    var gist = orient === 'rev' ? card.rev : card.up;
    kws.forEach(function (k) {
      k.split(/[^A-Za-z]+/).forEach(function (t) { var s = stem(t); if (s) map[s] = 2; });
    });
    gist.split(/[^A-Za-z]+/).forEach(function (t) {
      if (t.length < 5) return;
      var s = stem(t);
      if (s && !map[s]) map[s] = 1;
    });
    conceptCache[key] = map;
    return map;
  }

  /* ---------- Japanese concept matching (keyword + kanji/katakana bigrams) ---------- */
  var CJK2 = /^[一-鿿゠-ヿ]{2}$/;
  function bigrams(s) {
    var out = [];
    for (var i = 0; i < s.length - 1; i++) { var b = s.slice(i, i + 2); if (CJK2.test(b)) out.push(b); }
    return out;
  }
  function conceptMapJa(card, orient) {
    var key = 'ja:' + card.id + ':' + orient;
    if (conceptCache[key]) return conceptCache[key];
    var jt = I().cardText(card, 'ja');
    var map = {};
    (orient === 'rev' ? jt.revKeywords : jt.upKeywords).forEach(function (k) {
      map[k] = 2;
      bigrams(k).forEach(function (b) { if (!map[b]) map[b] = 1; });
    });
    conceptCache[key] = map;
    return map;
  }

  // returns { exp, opp, shared } for a text scope in matching language `ml`
  function scoreScope(card, orient, scope, ml) {
    var opposite = orient === 'rev' ? 'up' : 'rev';
    var expMap, oppMap, present;
    if (ml === 'ja') {
      expMap = conceptMapJa(card, orient); oppMap = conceptMapJa(card, opposite);
      present = function (u) { return scope.indexOf(u) >= 0; };
    } else {
      expMap = conceptMapEn(card, orient); oppMap = conceptMapEn(card, opposite);
      var st = stems(scope);
      present = function (u) { return !!st[u]; };
    }
    var exp = 0, opp = 0, shared = 0;
    Object.keys(expMap).forEach(function (u) {
      if (!present(u)) return;
      if (oppMap[u]) shared += 1; else exp += expMap[u];
    });
    Object.keys(oppMap).forEach(function (u) {
      if (!present(u)) return;
      if (!expMap[u]) opp += oppMap[u];
    });
    return { exp: exp, opp: opp, shared: shared };
  }

  /* ---------- sentence / mention helpers ---------- */
  function splitSentences(text, ml) {
    return String(text).split(ml === 'ja' ? /[。！？!?\n]+/ : /[.!?\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  var KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function mentionsCard(card, sentence, ml) {
    if (ml === 'ja') {
      var jt = I().cardText(card, 'ja');
      if (card.arcana === 'major') {
        if (card.number === 8) { if (/[「『（(]力[」』）)]|力のカード|力の札/.test(sentence)) return true; }
        else if (card.number === 5) {
          // 教皇 (Hierophant) must not match inside 女教皇 (High Priestess)
          var at = -1;
          while ((at = sentence.indexOf('教皇', at + 1)) >= 0) { if (sentence.charAt(at - 1) !== '女') return true; }
        } else if (sentence.indexOf(jt.name) >= 0) return true;
        // allow the English card name inside a Japanese sentence
        return sentence.toLowerCase().indexOf(card.name.toLowerCase().replace(/^the /, '')) >= 0;
      }
      var suit = I().suitName(card.suit, 'ja');
      var rk = card.number <= 10 ? '(' + card.number + '|' + KANJI_NUM[card.number] + (card.number === 1 ? '|エース|ace|Ａ' : '') + ')' : global.TarotData.ja.ranks[card.number];
      return new RegExp(escapeRe(suit) + 'の?' + rk, 'i').test(sentence) ||
        sentence.toLowerCase().indexOf(card.name.toLowerCase()) >= 0;
    }
    var s = sentence;
    var names = [card.name.toLowerCase()];
    if (card.arcana === 'major') names.push(card.name.toLowerCase().replace(/^the /, ''));
    else {
      if (card.number <= 10) names.push(card.number + ' of ' + card.suit);
      names.push(card.rankName.toLowerCase() + ' of ' + card.suit);
    }
    return names.some(function (n) { return new RegExp('\\b' + escapeRe(n) + '\\b').test(s); });
  }

  var ALIASES = {
    en: {
      you: ['your heart', 'you are', 'the querent'], them: ['their heart', 'the other person', 'they are'],
      echo: ['echo', 'between you'], depth: ['hidden', 'depth', 'beneath', 'unspoken'],
      heading: ['where it heads', 'heading', 'direction'], past: ['past'], present: ['present', 'right now'],
      future: ['future', 'ahead'], challenge: ['challenge', 'crosses', 'obstacle'], foundation: ['foundation', 'root'],
      crown: ['crown', 'goal'], environment: ['environment', 'surroundings', 'outside influence'],
      hopes: ['hopes', 'fears'], outcome: ['outcome', 'result'], self: ['self', 'attitude'],
      now: ['now', 'current'], obstacle: ['obstacle', 'cause', 'blocking'], trend: ['trend', 'tendency'], measure: ['measure', 'action', 'hint'], result: ['result', 'outcome', 'final'],
      near: ['near future', 'soon'], inner: ['inner', 'inside'], outer: ['outer', 'appearance'], theirs: ['their situation'], wish: ['wish', 'want'], mine: ['my situation', 'your situation'], advice: ['advice', 'guidance']
    },
    ja: {
      you: ['あなたの心', 'あなた'], them: ['相手の心', '相手'], echo: ['響き', 'ふたりの間', '二人の間'],
      depth: ['隠れた', '深層', '言葉にされ'], heading: ['行方', '向かう', '方向'],
      past: ['過去', 'これまで'], present: ['現在', 'いま', '今の状況'], future: ['未来', 'これから'],
      challenge: ['障害', '課題', '立ちはだか'], foundation: ['土台', '根底', '基盤'], crown: ['目標', '目指'],
      environment: ['周囲', '周り', '環境'], hopes: ['希望', '恐れ'], outcome: ['結果', '結末', '行き着'], self: ['自分', '姿勢'],
      now: ['現状', '今の状況'], obstacle: ['障害', '妨げ', '原因'], trend: ['傾向', '流れ'], measure: ['対策', 'ヒント', '行動'], result: ['結果', '結末', '行き着'],
      near: ['近未来', 'すぐ先'], inner: ['内面'], outer: ['外見', '見た目'], theirs: ['相手の状況'], wish: ['願望', '望んで'], mine: ['自分の状況', 'あなたの状況'], advice: ['アドバイス', '助言']
    }
  };
  function positionPhrases(pos, ml) {
    var label = pos.label.toLowerCase().replace(/^\d+\s*·\s*/, '');
    var list = [label];
    ((ALIASES[ml] || ALIASES.en)[pos.key] || []).forEach(function (a) { list.push(a); });
    return list;
  }
  function includesAny(sentence, phrases, ml) {
    for (var i = 0; i < phrases.length; i++) {
      if (ml === 'ja') { if (sentence.indexOf(phrases[i]) >= 0) return true; }
      else if (new RegExp('\\b' + escapeRe(phrases[i]) + '\\b').test(sentence)) return true;
    }
    return false;
  }

  /* ---------- Criterion 1: Card & Position Alignment ---------- */
  function evalAlignment(ctx) {
    var out = ctx.out, ml = ctx.ml;
    var sentences = splitSentences(ml === 'ja' ? ctx.text : ctx.text.toLowerCase(), ml);
    var perCard = [], points = [], total = 0;
    var byId = global.TarotData.byId;

    ctx.cards.forEach(function (c, i) {
      var card = byId[c.id];
      var posOut = ctx.spreadOut.positions[i];
      var posMatch = ctx.spreadMatch.positions[i];
      var orient = c.reversed ? 'rev' : 'up';
      var phrases = positionPhrases(posMatch, ml);

      var seg = [], namedCard = false, namedPosition = false;
      sentences.forEach(function (s) {
        var hitName = mentionsCard(card, s, ml);
        var hitPos = includesAny(s, phrases, ml);
        if (hitName) namedCard = true;
        if (hitPos) namedPosition = true;
        if (hitName || hitPos) seg.push(s);
      });
      var scope = seg.length ? seg.join(ml === 'ja' ? '。' : ' ') : sentences.join(ml === 'ja' ? '。' : ' ');
      var r = scoreScope(card, orient, scope, ml);

      var level, score;
      if (r.opp >= 2 && r.opp > r.exp) { level = 'flipped'; score = 0.25; }
      else if (r.exp >= 3) { level = 'strong'; score = 1; }
      else if (r.exp >= 1) { level = 'some'; score = 0.6; }
      else if (r.shared > 0) { level = 'some'; score = 0.4; }
      else if (namedCard || namedPosition) { level = 'thin'; score = 0.2; }
      else { level = 'missing'; score = 0; }
      if (namedPosition || namedCard) score = Math.min(1, score + 0.05);
      total += score;

      perCard.push({ id: card.id, name: I().cardText(card, out).name, reversed: !!c.reversed, position: posOut.label, level: level, namedCard: namedCard, namedPosition: namedPosition });

      var ct = I().cardText(card, out);
      var posShort = posOut.label.replace(/^\d+\s*·\s*/, '');
      var orientLabel = m(out, 'orient.' + orient);
      var otherLabel = m(out, 'orient.' + (orient === 'rev' ? 'up' : 'rev'));
      var kw = (c.reversed ? ct.revKeywords : ct.upKeywords).slice(0, 4).join(out === 'ja' ? '・' : ', ');
      var head = m(out, 'head', { card: ct.name, pos: posShort, orient: orientLabel });
      var p = { head: head, orient: orientLabel, other: otherLabel, kw: kw };
      if (level === 'strong') points.push({ type: 'good', text: m(out, 'a.good', p) });
      else if (level === 'some') points.push({ type: 'tip', text: m(out, 'a.some', p) });
      else if (level === 'flipped') points.push({ type: 'tip', text: m(out, 'a.flipped', p) });
      else if (level === 'thin') points.push({ type: 'tip', text: m(out, 'a.thin', p) });
      else points.push({ type: 'tip', text: m(out, 'a.missing', p) });
      if (!namedPosition && level !== 'missing') {
        points.push({ type: 'tip', text: m(out, 'a.posTip', { card: ct.short, pos: posShort, hint: out === 'en' ? posOut.hint.toLowerCase() : posOut.hint }) });
      }
    });

    var score = Math.round(100 * total / ctx.cards.length);
    return {
      criterion: {
        id: 'alignment', title: m(out, 'title.alignment'), short: m(out, 'short.alignment'), score: score, stars: toStars(score),
        summary: m(out, score >= 62 ? 'a.sumGood' : 'a.sumLow'), points: points
      },
      perCard: perCard
    };
  }

  /* ---------- Criterion 2: Narrative Cohesion ---------- */
  var CONNECTORS = {
    en: ['because', 'therefore', 'however', 'but', 'while', 'whereas', 'so', 'as a result', 'meanwhile', 'together', 'ultimately',
      'in contrast', 'on the other hand', 'this suggests', 'which', 'then', 'since', 'despite', 'yet', 'overall', 'in the end',
      'leads to', 'leading to', 'builds on', 'although', 'and so', 'before', 'after'],
    ja: ['なぜなら', 'だから', 'しかし', 'ですが', 'ただし', '一方', 'そのため', 'つまり', '結果として', 'その結果', 'さらに', 'また', 'ところが',
      'それによって', 'そして', '最終的', '全体として', '総じて', 'けれど', 'ながら', 'つながる', 'につながり', '続いて', '次に', 'ので', 'ため']
  };
  var ADVICE = {
    en: /\b(should|could|advise|advice|recommend|suggest|consider|try to|next step|overall|in summary|ultimately|bottom line|my reading|i would|they can|you can)\b/,
    ja: /(べき|といい|ましょう|おすすめ|アドバイス|提案|してみ|心がけ|大切|ポイント|総合的|全体として|結論|最終的|まとめ|でしょう|必要があ)/
  };

  function evalCohesion(ctx, perCard) {
    var out = ctx.out, ml = ctx.ml;
    var ja = ml === 'ja';
    var text = ja ? ctx.text : ctx.text.toLowerCase();
    var n = ctx.cards.length;
    var size = ja ? text.replace(/\s/g, '').length : (text.match(/[a-z']+/g) || []).length;
    var target = ja ? n * 40 : n * 14;

    var used = CONNECTORS[ml].filter(function (c) { return ja ? text.indexOf(c) >= 0 : new RegExp('\\b' + escapeRe(c) + '\\b').test(text); });
    var mentioned = perCard.filter(function (p) { return p.namedCard || p.namedPosition; }).length;

    // question relevance (only when question and reading share a language)
    var qText = ctx.question || '';
    var qLang = detectLang(qText, ml);
    var qRatio = 0.6, qKnown = false;
    if (qText && qLang === ml) {
      if (ja) {
        var qb = {}; bigrams(qText.normalize('NFKC')).forEach(function (b) { qb[b] = 1; });
        var keys = Object.keys(qb);
        if (keys.length) { qKnown = true; qRatio = Math.min(1, keys.filter(function (b) { return text.indexOf(b) >= 0; }).length / Math.min(4, keys.length)); }
      } else {
        var qs = Object.keys(stems(qText)), ts = stems(text);
        if (qs.length) { qKnown = true; qRatio = Math.min(1, qs.filter(function (s) { return ts[s]; }).length / Math.min(3, qs.length)); }
      }
    }

    var lengthPts = Math.round(20 * Math.min(1, size / target));
    var connPts = Math.round(25 * Math.min(1, used.length / Math.max(2, n - 1)));
    var mentionPts = Math.round(20 * mentioned / n);
    var questionPts = Math.round(15 * qRatio);
    var concl = ADVICE[ml].test(text);
    var score = Math.min(100, lengthPts + connPts + mentionPts + questionPts + (concl ? 20 : 0));

    var points = [];
    points.push(size >= target
      ? { type: 'good', text: m(out, 'c.lenOk', { n: size }) }
      : { type: 'tip', text: m(out, 'c.lenShort', { n: size }) });
    points.push(used.length >= Math.max(2, n - 1)
      ? { type: 'good', text: m(out, 'c.connOk', { list: used.slice(0, 3).join(out === 'ja' ? '・' : ', ') }) }
      : { type: 'tip', text: m(out, 'c.connTip') });
    points.push(mentioned === n
      ? { type: 'good', text: m(out, 'c.mentionAll') }
      : { type: 'tip', text: m(out, 'c.mentionSome', { m: mentioned, n: n }) });
    if (qKnown) points.push(qRatio >= 0.7 ? { type: 'good', text: m(out, 'c.qOk') } : { type: 'tip', text: m(out, 'c.qTip') });
    points.push(concl ? { type: 'good', text: m(out, 'c.conclOk') } : { type: 'tip', text: m(out, 'c.conclTip') });

    return {
      id: 'cohesion', title: m(out, 'title.cohesion'), short: m(out, 'short.cohesion'), score: score, stars: toStars(score),
      summary: m(out, score >= 62 ? 'c.sumGood' : 'c.sumLow'), points: points
    };
  }

  /* ---------- Criterion 3: Professional Reader's Perspective ---------- */
  var RELATION = {
    en: /\b(together|pattern|both|also|contrast|echo\w*|mirror\w*|combin\w*|alongside|reinforc\w*|balanc\w*|between)\b/g,
    ja: /(一緒に|合わせ|パターン|どちらも|両方|さらに|対照|響き合|呼応|組み合わ|補い|強め|相まって|一方で|に対して|つなが)/g
  };

  // Detect spread-level patterns. Text is produced in `out`; `res` holds a regex per matching language.
  function analyzePatterns(cardsIn, out) {
    out = out || I().lang();
    var byId = global.TarotData.byId;
    var list = cardsIn.map(function (c) { return { card: byId[c.id], reversed: !!c.reversed }; });
    var total = list.length, patterns = [];
    var minors = list.filter(function (x) { return x.card.arcana === 'minor'; });
    var majors = list.filter(function (x) { return x.card.arcana === 'major'; });
    var JA = global.TarotData.ja;
    var suitInfo = global.TarotData.suits;

    var suitCount = {};
    minors.forEach(function (x) { suitCount[x.card.suit] = (suitCount[x.card.suit] || 0) + 1; });
    Object.keys(suitCount).forEach(function (s) {
      if (suitCount[s] >= 3 && suitCount[s] >= minors.length / 2) {
        var themeEn = suitInfo[s].theme, themeJa = JA.suits[s].theme;
        patterns.push({
          id: 'suit-' + s,
          title: m(out, 'pat.suit.t', { suit: out === 'ja' ? JA.suits[s].name : suitInfo[s].name, c: suitCount[s], m: minors.length }),
          detail: m(out, 'pat.suit.d', { element: out === 'ja' ? JA.elements[suitInfo[s].element] : suitInfo[s].element, theme: out === 'ja' ? themeJa : themeEn }),
          re: {
            en: new RegExp('\\b(' + s + '|' + suitInfo[s].element.toLowerCase() + '|suit|' + themeEn.split(/, | and /).join('|') + ')\\b'),
            ja: new RegExp(JA.suits[s].name + '|' + JA.elements[suitInfo[s].element] + '|スート|' + themeJa.split('・').join('|'))
          }
        });
      }
    });

    if (total >= 3 && majors.length / total >= 0.4 && majors.length >= 2) {
      patterns.push({
        id: 'majors', title: m(out, 'pat.majors.t', { c: majors.length, t: total }), detail: m(out, 'pat.majors.d'),
        re: { en: /\b(major|arcana|big|fated|destiny|karmic|life lesson|archetyp\w*|significant)\b/, ja: /大アルカナ|アルカナ|大きな|運命|宿命|カルマ|人生の|節目|転機|大きな流れ/ }
      });
    } else if (total >= 5 && majors.length === 0) {
      patterns.push({
        id: 'no-majors', title: m(out, 'pat.nomajors.t'), detail: m(out, 'pat.nomajors.d'),
        re: { en: /\b(minor|everyday|day-to-day|practical|control|within)\b/, ja: /小アルカナ|日常|実務|現実的|影響|コントロール/ }
      });
    }

    var rev = list.filter(function (x) { return x.reversed; }).length;
    if (total >= 3 && rev / total >= 0.5) {
      patterns.push({
        id: 'reversals', title: m(out, 'pat.rev.t', { c: rev, t: total }), detail: m(out, 'pat.rev.d'),
        re: { en: /\b(revers\w*|upside|blocked|internal\w*|inward|delay\w*)\b/, ja: /逆位置|逆さ|滞|停滞|内にこも|遅れ|ブロック/ }
      });
    } else if (total >= 5 && rev === 0) {
      patterns.push({
        id: 'upright', title: m(out, 'pat.up.t'), detail: m(out, 'pat.up.d'),
        re: { en: /\b(upright|flowing|unobstructed|no revers\w*|all upright|open)\b/, ja: /正位置|流れ|妨げ|すべて正/ }
      });
    }

    var rankCount = {};
    minors.forEach(function (x) { if (x.card.number <= 10) rankCount[x.card.number] = (rankCount[x.card.number] || 0) + 1; });
    Object.keys(rankCount).forEach(function (r) {
      if (rankCount[r] >= 2) {
        patterns.push({
          id: 'num-' + r, title: m(out, 'pat.num.t', { r: r, c: rankCount[r] }),
          detail: m(out, 'pat.num.d', { r: r, meaning: NUMBER_MEANING[out][r] }),
          re: {
            en: new RegExp('\\b(' + r + 's?|two|three|four|five|six|seven|eight|nine|ten|ace|twice|repeat|repeated|number|numerolog\\w*|multiple|both|pair)\\b'),
            ja: new RegExp(r + '|重な|繰り返|同じ数|数字|数秘|ペア|2枚|二枚|二つ|ふたつ|複数')
          }
        });
      }
    });

    var courts = minors.filter(function (x) { return x.card.number >= 11; });
    if (total >= 5 && courts.length >= 3) {
      patterns.push({
        id: 'courts', title: m(out, 'pat.courts.t', { c: courts.length }), detail: m(out, 'pat.courts.d'),
        re: { en: /\b(court|people|personalit\w*|figures?|persons?|page|knight|queen|king)\b/, ja: /コート|人物|人々|人たち|ペイジ|ナイト|クイーン|キング|関わる人/ }
      });
    } else {
      var courtRank = {};
      courts.forEach(function (x) { courtRank[x.card.number] = (courtRank[x.card.number] || 0) + 1; });
      Object.keys(courtRank).forEach(function (r) {
        if (courtRank[r] >= 2) {
          patterns.push({
            id: 'court-' + r, title: m(out, 'pat.court.t', { rank: RANK_WORD[out][r] }), detail: m(out, 'pat.court.d', { rank: RANK_WORD[out][r] }),
            re: {
              en: new RegExp('\\b(' + RANK_WORD.en[r].toLowerCase() + 's?|court|people|twice|both)\\b'),
              ja: new RegExp(RANK_WORD.ja[r] + '|コート|人物|2枚|二枚|同じ')
            }
          });
        }
      });
    }
    return patterns;
  }

  function evalPro(ctx) {
    var out = ctx.out, ml = ctx.ml;
    var text = ml === 'ja' ? ctx.text : ctx.text.toLowerCase();
    var patterns = analyzePatterns(ctx.cards, out);
    var points = [], score;
    patterns.forEach(function (p) {
      p.addressed = p.re[ml].test(text);
      points.push({ type: p.addressed ? 'good' : 'tip', text: m(out, p.addressed ? 'p.got' : 'p.note', { title: p.title, detail: p.detail }) });
    });
    var rel = (text.match(RELATION[ml]) || []).length;
    if (patterns.length) {
      var addressed = patterns.filter(function (p) { return p.addressed; }).length;
      score = Math.round(20 + 60 * addressed / patterns.length + (rel >= 2 ? 20 : rel === 1 ? 10 : 0));
    } else {
      score = rel >= 3 ? 85 : rel === 2 ? 70 : rel === 1 ? 50 : 30;
      points.push({ type: 'tip', text: m(out, 'p.none') });
    }
    score = Math.min(100, score);
    points.push(rel >= 2 ? { type: 'good', text: m(out, 'p.relOk') } : { type: 'tip', text: m(out, 'p.relTip') });

    return {
      criterion: {
        id: 'pro', title: m(out, 'title.pro'), short: m(out, 'short.pro'), score: score, stars: toStars(score),
        summary: m(out, score >= 62 ? 'p.sumGood' : 'p.sumLow'), points: points
      },
      patterns: patterns.map(function (p) { return { id: p.id, title: p.title, detail: p.detail, addressed: p.addressed }; })
    };
  }

  /* ---------- entry point ---------- */
  function evaluateReading(input) {
    var out = input.lang || I().lang();
    var raw = String(input.text || '').trim();
    var ml = detectLang(raw, out);
    var size = ml === 'ja' ? raw.replace(/\s/g, '').length : (raw.match(/[A-Za-z']+/g) || []).length;
    var tooShort = ml === 'ja' ? size < 20 : size < 8;
    if (tooShort) {
      return {
        engine: 'rules-v1', lang: out, tooShort: true, overall: { score: 0, stars: 0 }, criteria: [], perCard: [],
        patterns: analyzePatterns(input.cards, out).map(function (p) { return { id: p.id, title: p.title, detail: p.detail, addressed: false }; })
      };
    }
    var ctx = {
      out: out, ml: ml, cards: input.cards, question: input.question || '',
      text: ml === 'ja' ? raw.normalize('NFKC') : raw,
      spreadOut: input.spread,
      spreadMatch: I().spread(input.spread.id, ml)
    };
    var a = evalAlignment(ctx);
    var c = evalCohesion(ctx, a.perCard);
    var p = evalPro(ctx);
    var overall = Math.round((a.criterion.score + c.score + p.criterion.score) / 3);
    return {
      engine: 'rules-v1', lang: out,
      overall: { score: overall, stars: toStars(overall) },
      criteria: [a.criterion, c, p.criterion],
      patterns: p.patterns, perCard: a.perCard
    };
  }

  global.CoachEngine = { evaluateReading: evaluateReading, analyzePatterns: analyzePatterns, version: 'rules-v1' };
})(typeof window !== 'undefined' ? window : globalThis);
