/* data/spreads.js — spread layouts and consultation prompt bank.
 * Exposes window.TarotSpreads = { spreads, spreadById, prompts, categories }.
 * Each position: { key, label, hint, col, row, rotate?, z? } on a CSS grid of `cols` x `rows`.
 */
(function (global) {
  'use strict';

  var spreads = [
    {
      id: 'three',
      name: 'Three-Card',
      subtitle: 'Past / Present / Future',
      cols: 3,
      rows: 1,
      positions: [
        { key: 'past', label: 'Past', hint: 'What has led up to this situation', col: 1, row: 1 },
        { key: 'present', label: 'Present', hint: 'Where things stand right now', col: 2, row: 1 },
        { key: 'future', label: 'Future', hint: 'Where things are heading if nothing changes', col: 3, row: 1 }
      ]
    },
    {
      id: 'cross',
      name: 'Greek Cross',
      subtitle: '5-card cross layout',
      cols: 3,
      rows: 3,
      positions: [
        { key: 'now', label: 'Now', hint: 'The current situation and state of things', col: 1, row: 2 },
        { key: 'obstacle', label: 'Obstacle', hint: 'Obstacles, causes or what stands in the way', col: 3, row: 2 },
        { key: 'trend', label: 'Trend', hint: 'Where things tend to go if the present continues', col: 2, row: 1 },
        { key: 'measure', label: 'Measure', hint: 'A hint or action for resolving the matter', col: 2, row: 3 },
        { key: 'result', label: 'Result', hint: 'The most likely final outcome', col: 2, row: 2 }
      ]
    },
    {
      id: 'heart',
      name: 'Heart Sonar',
      subtitle: '8-card romance spread',
      cols: 5,
      rows: 4,
      positions: [
        { key: 'present', label: 'Present', hint: 'The current state of the relationship', col: 3, row: 1, dy: 76 },
        { key: 'near', label: 'Near Future', hint: 'What is coming soon', col: 3, row: 4, dy: -62 },
        { key: 'inner', label: 'Inner Image', hint: 'How they see your inner self', col: 1, row: 2 },
        { key: 'outer', label: 'Outer Image', hint: 'How they see your appearance and manner', col: 5, row: 2 },
        { key: 'theirs', label: 'Their Situation', hint: 'What is going on for the other person', col: 2, row: 1, dx: -16, dy: 12 },
        { key: 'wish', label: 'Their Wish', hint: 'What the other person wants', col: 4, row: 3, dx: 16, dy: -12 },
        { key: 'mine', label: 'My Situation', hint: 'Where you stand right now', col: 4, row: 1, dx: 16, dy: 12 },
        { key: 'advice', label: 'Advice', hint: 'Guidance for moving forward', col: 2, row: 3, dx: -16, dy: -12 }
      ]
    }
  ];

  var spreadById = {};
  spreads.forEach(function (s) { spreadById[s.id] = s; });

  var categories = [
    { id: 'romance', label: 'Romance' },
    { id: 'career', label: 'Career' },
    { id: 'growth', label: 'Personal Growth' }
  ];

  var prompts = {
    romance: [
      'I am unsure whether the person I am dating is serious about me. What should I know?',
      'A couple keeps arguing about the same issue. What is really going on between them?',
      'I recently ended a relationship. How can I heal and what is next for my love life?',
      'Should I tell a close friend that I have feelings for them?',
      'What do I need to understand about what I want in a partner?'
    ],
    career: [
      'I have a job offer in a new city. Should I take it?',
      'I feel stuck in my current role. What is blocking my progress?',
      'I am thinking of starting my own business. What should I consider?',
      'How can I improve a tense relationship with my manager?',
      'What is the best way to approach my next year of work?'
    ],
    growth: [
      'I feel uninspired and do not know why. What do I need to see?',
      'What habit or belief is holding me back right now?',
      'How can I rebuild my confidence after a setback?',
      'I am entering a big life transition. How can I prepare?',
      'What lesson am I being asked to learn in this season of my life?'
    ]
  };

  // Japanese text, keyed by spread id / position key / category id. Layout stays in the base data above.
  var ja = {
    spreads: {
      three: {
        name: 'スリーカード', subtitle: '過去 / 現在 / 未来',
        positions: {
          past: ['過去', '今の状況に至るまでの流れ'],
          present: ['現在', '今、物事がどこにあるか'],
          future: ['未来', '何も変えなければ、どこへ向かうか']
        }
      },
      cross: {
        name: 'ギリシャ十字', subtitle: '5枚の十字スプレッド',
        positions: {
          now: ['現状', '今の状況と状態'],
          obstacle: ['障害', '妨げとなるもの、原因'],
          trend: ['傾向', 'このまま進んだときの流れ'],
          measure: ['対策', '解決のためのヒントや行動'],
          result: ['結果', '最終的に行き着くところ']
        }
      },
      heart: {
        name: 'ハートソナー', subtitle: '8枚の恋愛スプレッド',
        positions: {
          present: ['現在', '今のふたりの状態'],
          near: ['近未来', 'この先すぐに起こること'],
          inner: ['内面の印象', '相手から見たあなたの内面'],
          outer: ['外見の印象', '相手から見たあなたの外見や振る舞い'],
          theirs: ['相手の状況', '相手が置かれている状況'],
          wish: ['相手の願望', '相手が望んでいること'],
          mine: ['自分の状況', 'あなたが置かれている状況'],
          advice: ['アドバイス', '前に進むための助言']
        }
      }
    },
    categories: { romance: '恋愛', career: '仕事', growth: '自己成長' },
    prompts: {
      romance: [
        '付き合っている相手が自分に本気かどうか分かりません。何を知っておくべきでしょうか？',
        'あるカップルが同じことで何度も口論しています。ふたりの間で本当は何が起きているのでしょうか？',
        '最近、恋人と別れました。どう癒やし、恋愛は次にどう進むでしょうか？',
        '親しい友人への好意を、伝えるべきでしょうか？',
        'パートナーに求めるものについて、理解しておくべきことは何でしょうか？'
      ],
      career: [
        '別の街での仕事の誘いを受けています。受けるべきでしょうか？',
        '今の役割で行き詰まりを感じています。何が進歩を妨げているのでしょうか？',
        '独立を考えています。何を考慮すべきでしょうか？',
        '上司との張りつめた関係をどう改善できるでしょうか？',
        '今後一年の仕事にどう向き合うのがよいでしょうか？'
      ],
      growth: [
        '理由もなく意欲がわきません。何に気づく必要があるでしょうか？',
        '今、自分の足を引っ張っている習慣や思い込みは何でしょうか？',
        'つまずきのあと、どう自信を取り戻せるでしょうか？',
        '人生の大きな転機を迎えます。どう備えればよいでしょうか？',
        '今の人生の季節に、学ぶよう求められている教訓は何でしょうか？'
      ]
    }
  };

  global.TarotSpreads = { spreads: spreads, spreadById: spreadById, prompts: prompts, categories: categories, ja: ja };
})(typeof window !== 'undefined' ? window : globalThis);
