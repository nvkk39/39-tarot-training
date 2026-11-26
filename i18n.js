/* i18n.js — language state, UI strings and localized data accessors.
 * Default language is Japanese; the choice is saved in localStorage ('arcana.lang.v1').
 *
 * To add a language: add its entry to LANGS, a block in STR and PRIMER, Japanese-style data files
 * (see data/cards.ja.js and the `ja` block in data/spreads.js), and the engine messages in engine.js.
 *
 * API: I18n.t(key, params), I18n.lang(), I18n.setLang(code), I18n.langs, I18n.onChange(fn),
 *      I18n.cardText(card, lang?), I18n.spread(id, lang?), I18n.spreads(lang?), I18n.categories(lang?),
 *      I18n.prompts(category, lang?), I18n.primer(), I18n.elementName(card), I18n.rankLabel(card)
 */
(function (global) {
  'use strict';

  var KEY = 'arcana.lang.v1';
  var DEFAULT = 'ja';
  var LANGS = [{ code: 'ja', label: '日本語' }, { code: 'en', label: 'English' }];

  var STR = {
    ja: {
      'doc.title': 'Tarot Training — タロット・リーディング練習アプリ',
      'doc.desc': 'オフラインで使えるタロット練習アプリ。78枚のカードガイド、暗記クイズ、スプレッド実践、ブラウザ内のリーディングコーチ。',
      'tab.guide': 'Guide', 'tab.quiz': 'Quiz', 'tab.expand': 'Spread', // bottom menu stays in English in both languages
      'install': 'アプリをインストール', 'close': '閉じる', 'lang.aria': '言語を選ぶ', 'lang.title': '言語 / Language',
      'noscript': 'Tarot Training の利用には JavaScript が必要です。',
      'storage.fail': '保存できませんでした。容量がいっぱいか、保存が許可されていません。',

      'guide.title': 'カードガイド', 'guide.all': 'All', 'guide.major': 'Major Arcana', 'guide.basics': 'Basics',
      'guide.fwands': 'Wands', 'guide.fcups': 'Cups', 'guide.fswords': 'Swords', 'guide.fpentacles': 'Pentacles',
      'guide.search': '名前・キーワード・意味で検索…', 'guide.searchAria': 'カードを検索', 'guide.none': '一致するカードがありません。',
      'guide.filterAria': 'カードの絞り込み',
      'card.upright': '正位置', 'card.reversed': '逆位置', 'card.rev': '（逆位置）', 'card.major': '大アルカナ',

      'quiz.title': 'Quiz', 'quiz.accuracy': '正答率', 'quiz.streak': '連続正解\n（最高{best}）', 'quiz.tried': '挑戦した\nカード',
      'quiz.askUp': 'このカードが「正位置」のとき、\n意味として合うのはどれ？',
      'quiz.askRev': 'このカードが「逆位置」（上下逆）のとき、\n意味として合うのはどれ？',
      'quiz.next': '次のカード', 'quiz.review': 'おさらいするカード', 'quiz.modeRandom': 'ランダム出題', 'quiz.modeWeak': '間違い対策', 'quiz.noWeak': '間違えたカードはありません。ランダム出題で挑戦してみましょう。', 'quiz.missed': '{name} · 間違い {miss}/{seen}',
      'quiz.reset': 'クイズの進捗をリセット', 'quiz.resetConfirm': 'この端末のクイズの進捗をすべてリセットしますか？',
      'quiz.correct': '正解', 'quiz.incorrect': '不正解',

      'exp.title': 'Spread', 'exp.step1': '1 · スプレッド', 'exp.step2': '2 · 相談内容',
      'exp.another': '↻ 別のお題', 'exp.custom': 'または自分の質問を入力（任意）', 'exp.customAria': '自分の質問',
      'exp.reversals': '逆位置のカードを含める', 'exp.deal': 'シャッフルして配る', 'exp.dealAgain': 'もう一度シャッフルして配る',
      'exp.intro': 'スプレッドを配り、自分の言葉で読み解き、コーチに構造的なフィードバックをもらいましょう。すべてこの端末の中で動きます。',
      'exp.dealConfirm': '新しく配ると、書きかけのリーディングは消えます。続けますか？',
      'exp.noQuestion': '（質問なし）', 'exp.tapHint': 'カードをタップすると、キーワードを確認できます。',
      'exp.yourReading': 'あなたのリーディング',
      'exp.placeholder': '読み解きを書きましょう。各カードとそのポジションの意味に触れ、カード同士をつなげて質問への一つの答えにし、最後にアドバイスを添えてください。',
      'exp.readingAria': 'あなたのリーディング', 'exp.coach': '添削',
      'exp.spreadAria': 'スプレッド', 'exp.catAria': 'お題のカテゴリ',

      'fb.title': 'コーチのフィードバック',
      'fb.tooShort': 'もう少し書いてみましょう。1枚につき1〜2文あると、コーチが評価しやすくなります。',
      'fb.hint': 'ヒント：このスプレッドには注目したいパターンがあります：{patterns}。',
      'fb.overall': '総合 {n}/100', 'fb.overallAria': '総合評価 5段階中 {n}',
      'fb.footer': 'ルールベースのコーチ（{engine}）が端末内でオフライン動作しています。学習の補助として使い、結果を鵜呑みにしないでください。',

      'install.title': 'Tarot Training をインストール', 'install.ios': 'iPhone / iPad（Safari）',
      'install.ios1': 'このページを Safari で開きます。', 'install.ios2': 'ツールバーの共有ボタンをタップします。',
      'install.ios3': '下へスクロールして「ホーム画面に追加」をタップし、「追加」を押します。',
      'install.android': 'Android（Chrome）', 'install.android1': '⋮ メニューをタップします。',
      'install.android2': '「アプリをインストール」または「ホーム画面に追加」を選びます。',
      'install.note': 'インストールすると全画面で開き、オフラインでも使えます。',
      'install.done': 'インストールしました。ホーム画面から開けます。',

      'fmt.date': 'ja-JP'
    },
    en: {
      'doc.title': 'Tarot Training — Tarot Reading Trainer',
      'doc.desc': 'Offline-first tarot reading trainer: 78-card guide, recall quizzes, interactive spreads and an in-browser reading coach.',
      'tab.guide': 'Guide', 'tab.quiz': 'Quiz', 'tab.expand': 'Spread',
      'install': 'Install App', 'close': 'Close', 'lang.aria': 'Choose language', 'lang.title': 'Language / 言語',
      'noscript': 'Tarot Training needs JavaScript to run.',
      'storage.fail': 'Could not save: storage is full or blocked.',

      'guide.title': 'Card Guide', 'guide.all': 'All', 'guide.major': 'Major Arcana', 'guide.basics': 'Basics',
      'guide.fwands': 'Wands', 'guide.fcups': 'Cups', 'guide.fswords': 'Swords', 'guide.fpentacles': 'Pentacles',
      'guide.search': 'Search name, keyword or meaning…', 'guide.searchAria': 'Search cards', 'guide.none': 'No cards match that search.',
      'guide.filterAria': 'Filter cards',
      'card.upright': 'Upright', 'card.reversed': 'Reversed', 'card.rev': ' (reversed)', 'card.major': 'Major Arcana',

      'quiz.title': 'Recall Quiz', 'quiz.accuracy': 'accuracy', 'quiz.streak': 'streak (best {best})', 'quiz.tried': 'cards tried',
      'quiz.askUp': 'Which meaning fits this card UPRIGHT?',
      'quiz.askRev': 'Which meaning fits this card REVERSED (upside-down)?',
      'quiz.next': 'Next card', 'quiz.review': 'Cards to review', 'quiz.modeRandom': 'Random', 'quiz.modeWeak': 'Review misses', 'quiz.noWeak': 'No missed cards right now. Try Random mode.', 'quiz.missed': '{name} · missed {miss}/{seen}',
      'quiz.reset': 'Reset quiz progress', 'quiz.resetConfirm': 'Reset all quiz progress on this device?',
      'quiz.correct': 'Correct', 'quiz.incorrect': 'Incorrect',

      'exp.title': 'Spread', 'exp.step1': '1 · Spread', 'exp.step2': '2 · Consultation',
      'exp.another': '↻ Another prompt', 'exp.custom': 'Or type your own question (optional)', 'exp.customAria': 'Your own question',
      'exp.reversals': 'Include reversed cards', 'exp.deal': 'Shuffle & deal', 'exp.dealAgain': 'Shuffle & deal again',
      'exp.intro': 'Deal a spread, write your own interpretation, then ask the coach for structured feedback. Everything runs on your device.',
      'exp.dealConfirm': 'Dealing new cards will clear your current reading draft. Continue?',
      'exp.noQuestion': '(no question set)', 'exp.tapHint': 'Tap a card to peek at its keywords.',
      'exp.yourReading': 'Your reading',
      'exp.placeholder': 'Write your interpretation: mention each card and what its position means, connect them into one answer to the question, and finish with advice.',
      'exp.readingAria': 'Your reading', 'exp.coach': 'Review',
      'exp.spreadAria': 'Spread', 'exp.catAria': 'Prompt category',

      'fb.title': 'Coach feedback',
      'fb.tooShort': 'Write a little more first: a sentence or two per card gives the coach something to work with.',
      'fb.hint': 'Hint: this spread has patterns worth noticing: {patterns}.',
      'fb.overall': 'Overall {n}/100', 'fb.overallAria': '{n} out of 5 overall',
      'fb.footer': 'Rule-based coach ({engine}) running offline on your device. Treat it as a study aid, not an oracle.',

      'install.title': 'Install Tarot Training', 'install.ios': 'iPhone / iPad (Safari)',
      'install.ios1': 'Open this page in Safari.', 'install.ios2': 'Tap the Share button in the toolbar.',
      'install.ios3': 'Scroll down and tap “Add to Home Screen”, then tap Add.',
      'install.android': 'Android (Chrome)', 'install.android1': 'Tap the ⋮ menu.',
      'install.android2': 'Choose “Install app” or “Add to Home screen”.',
      'install.note': 'Once installed it opens full-screen and works offline.',
      'install.done': 'Installed. Open it from your home screen.',

      'fmt.date': 'en-US'
    }
  };

  var PRIMER = {
    ja: [
      { title: 'デッキの構成', paras: [
        'タロットは78枚で、2つのグループに分かれます。22枚の大アルカナ（愚者〜世界）は人生の大きなテーマや転機を表します。56枚の小アルカナは日々の出来事を表し、4つのスートに14枚ずつ分かれます。',
        '各スートは、エース〜10（状況が芽生えてから完成するまでの物語）と、ペイジ・ナイト・クイーン・キング（人物や性格、行動の仕方）で構成されます。'] },
      { title: 'スートと元素', paras: [
        'ワンド（火）：情熱、野心、行動、創造性。', 'カップ（水）：感情、人間関係、直感、想像力。',
        'ソード（風）：思考、コミュニケーション、真実、対立。', 'ペンタクル（地）：仕事、お金、健康、現実の世界。'] },
      { title: '数字の意味', paras: [
        'エースは始まり。2は均衡や選択。3は成長。4は安定。5は揺さぶり。6は調和。7は試練。8は動きや熟達。9は完成間近。10は完結で、ときに重荷。'] },
      { title: '逆位置の読み方', paras: [
        '逆位置は、同じエネルギーが「滞る・遅れる・内にこもる・行き過ぎる」状態として読むことが多く、正反対の意味として読む流派もあります。どちらかに決めて一貫して使いましょう。このアプリでは、カードごとに逆位置の意味を別に載せています。'] },
      { title: 'リーディングのコツ', paras: [
        'まずポジションを読み、それからカードを読みます。個々のカードの前に、スプレッド全体を眺めましょう。どのスートが多いか、大アルカナは何枚か、逆位置は何枚か、どの数字が重なっているか。最後に、質問へはっきり答えて締めくくります。'] }
    ],
    en: [
      { title: 'The structure of the deck', paras: [
        'A tarot deck has 78 cards in two groups. The 22 Major Arcana (The Fool to The World) show big life themes and turning points. The 56 Minor Arcana describe everyday events, split into four suits of 14 cards each.',
        'Each suit runs Ace to Ten (the story of a situation from seed to completion), then Page, Knight, Queen and King (people, personalities or ways of acting).'] },
      { title: 'Suits and elements', paras: [
        'Wands (Fire): passion, ambition, action and creativity.', 'Cups (Water): emotions, relationships, intuition and imagination.',
        'Swords (Air): thoughts, communication, truth and conflict.', 'Pentacles (Earth): work, money, health and the physical world.'] },
      { title: 'Numbers', paras: [
        'Aces start things. Twos balance or choose. Threes grow. Fours stabilize. Fives disrupt. Sixes harmonize. Sevens test. Eights move or master. Nines near completion. Tens complete, sometimes with a burden.'] },
      { title: 'Reading reversals', paras: [
        'A reversed card is often read as the same energy blocked, delayed, internalized or overdone. Some readers also treat it as the opposite meaning. Pick one approach and use it consistently. This app lists a separate reversed meaning for each card.'] },
      { title: 'Reading tips', paras: [
        'Read the position first, then the card. Look at the whole spread before the individual cards: which suit dominates, how many Majors appear, how many are reversed and which numbers repeat. Finish with a clear answer to the question.'] }
    ]
  };

  var SUITINFO = {
    ja: {
      wands: { title: 'ワンド（火）', text: '情熱、野心、行動、創造性。日々の行動力ややる気、仕事や創作への熱意を表すスートです。' },
      cups: { title: 'カップ（水）', text: '感情、人間関係、直感、想像力。気持ちの動きや、人とのつながりを表すスートです。' },
      swords: { title: 'ソード（風）', text: '思考、コミュニケーション、真実、対立。考え方や判断、言葉のやりとりを表すスートです。' },
      pentacles: { title: 'ペンタクル（地）', text: '仕事、お金、健康、現実の世界。暮らしの土台や、目に見える成果を表すスートです。' }
    },
    en: {
      wands: { title: 'Wands (Fire)', text: 'Passion, ambition, action and creativity. The suit of drive, energy and enthusiasm for work and making things.' },
      cups: { title: 'Cups (Water)', text: 'Emotions, relationships, intuition and imagination. The suit of feelings and connection with other people.' },
      swords: { title: 'Swords (Air)', text: 'Thoughts, communication, truth and conflict. The suit of thinking, decisions and the words we exchange.' },
      pentacles: { title: 'Pentacles (Earth)', text: 'Work, money, health and the physical world. The suit of everyday foundations and tangible results.' }
    }
  };

  var listeners = [];
  var current = DEFAULT;
  try {
    var saved = localStorage.getItem(KEY);
    if (saved && STR[saved]) current = saved;
  } catch (e) { /* storage blocked: stay on default */ }

  function t(key, params, lang) {
    var table = STR[lang || current] || STR[DEFAULT];
    var s = table[key];
    if (s === undefined) s = STR.en[key];
    if (s === undefined) return key;
    if (params) Object.keys(params).forEach(function (k) { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  function setLang(code) {
    if (!STR[code] || code === current) return;
    current = code;
    try { localStorage.setItem(KEY, code); } catch (e) { /* ignore */ }
    document.documentElement.lang = code;
    listeners.forEach(function (fn) { fn(code); });
  }

  function cardText(card, lang) {
    lang = lang || current;
    var ja = lang === 'ja' && global.TarotData.ja && global.TarotData.ja.cards[card.id];
    if (ja) return ja;
    return card; // English base data has the same field names
  }

  function elementName(card, lang) {
    lang = lang || current;
    return lang === 'ja' ? global.TarotData.ja.elements[card.element] : card.element;
  }

  function suitName(suitKey, lang) {
    lang = lang || current;
    return lang === 'ja' ? global.TarotData.ja.suits[suitKey].name : global.TarotData.suits[suitKey].name;
  }

  function rankLabel(card, lang) {
    lang = lang || current;
    if (card.arcana === 'major') return card.numeral;
    if (lang === 'ja') return global.TarotData.ja.ranks[card.number];
    return card.number === 1 ? 'ACE' : card.number <= 10 ? String(card.number) : card.rankName.toUpperCase();
  }

  function spread(id, lang) {
    lang = lang || current;
    var base = global.TarotSpreads.spreadById[id];
    if (!base) return null;
    var tr = lang === 'ja' ? global.TarotSpreads.ja.spreads[id] : null;
    return {
      id: base.id, cols: base.cols, rows: base.rows,
      name: tr ? tr.name : base.name,
      subtitle: tr ? tr.subtitle : base.subtitle,
      positions: base.positions.map(function (p) {
        var q = tr && tr.positions[p.key];
        return { key: p.key, label: q ? q[0] : p.label, hint: q ? q[1] : p.hint, col: p.col, row: p.row, rotate: p.rotate, z: p.z, dx: p.dx, dy: p.dy };
      })
    };
  }
  function spreads(lang) { return global.TarotSpreads.spreads.map(function (s) { return spread(s.id, lang); }); }

  function categories(lang) {
    lang = lang || current;
    return global.TarotSpreads.categories.map(function (c) {
      return { id: c.id, label: lang === 'ja' ? global.TarotSpreads.ja.categories[c.id] : c.label };
    });
  }
  function prompts(category, lang) {
    lang = lang || current;
    return (lang === 'ja' ? global.TarotSpreads.ja.prompts : global.TarotSpreads.prompts)[category] || [];
  }

  document.documentElement.lang = current;

  global.I18n = {
    t: t, lang: function () { return current; }, setLang: setLang, langs: LANGS,
    onChange: function (fn) { listeners.push(fn); },
    cardText: cardText, elementName: elementName, suitName: suitName, rankLabel: rankLabel,
    spread: spread, spreads: spreads, categories: categories, prompts: prompts,
    primer: function () { return PRIMER[current] || PRIMER.en; },
    suitInfo: function (suit) { return (SUITINFO[current] || SUITINFO.en)[suit]; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
