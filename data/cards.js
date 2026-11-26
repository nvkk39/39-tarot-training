/* data/cards.js — complete 78-card dataset (original text written for this app).
 * Exposes window.TarotData = { cards, byId, suits, ranks }.
 * Card shape:
 *   id, name, short, arcana ('major'|'minor'), suit (null for major), number,
 *   element, glyph, upKeywords[], revKeywords[], up, rev, symbolism
 */
(function (global) {
  'use strict';

  // ---------- Major Arcana ----------
  // [number, name, element, glyph, upKeywords, revKeywords, up, rev, symbolism]
  var MAJORS = [
    [0, 'The Fool', 'Air', '☼',
      'beginnings, spontaneity, innocence, leap of faith, free spirit',
      'recklessness, naivety, hesitation, risk-taking, poor judgment',
      'A fresh start taken on trust: step forward openly into the unknown.',
      'Either freezing at the edge or jumping without looking.',
      'A traveler steps toward a cliff edge with a small dog at his heels, a white rose in hand and a light bundle on a stick; the bright sun shows he is protected.'],
    [1, 'The Magician', 'Air', '∞',
      'manifestation, willpower, skill, resourcefulness, focus',
      'manipulation, untapped talent, scattered energy, trickery, poor planning',
      'You have every tool you need; focus your will and make it happen.',
      'Talent wasted or used to mislead; energy scattered across too many tricks.',
      'One hand points to the sky, one to the earth ("as above, so below"). The four suit emblems lie on the table; the infinity sign hovers overhead.'],
    [2, 'The High Priestess', 'Water', '☽',
      'intuition, mystery, inner knowing, secrets, subconscious',
      'hidden agendas, ignored intuition, secrets exposed, disconnection, surface-level thinking',
      'Trust your inner voice; the answer lies beneath the surface, not in words.',
      'Ignoring your gut or a hidden agenda; secrets are not what they seem.',
      'She sits between a black and a white pillar before a veil patterned with pomegranates, a crescent moon at her feet and a scroll in her lap.'],
    [3, 'The Empress', 'Earth', '♀',
      'abundance, nurturing, fertility, creativity, comfort',
      'smothering, creative block, dependence, self-neglect, stagnation',
      'Growth, comfort and creative abundance flourish when you nurture them.',
      'Over-giving or blocked creativity; care turns into smothering or neglect.',
      'A crowned woman rests among wheat and a flowing stream, a heart-shaped shield marked with the symbol of Venus beside her.'],
    [4, 'The Emperor', 'Fire', '♈',
      'authority, structure, stability, leadership, discipline',
      'tyranny, rigidity, control issues, immaturity, lack of discipline',
      'Build order and take responsible command; structure creates security.',
      'Control turns to rigidity, or discipline is missing altogether.',
      'A stern ruler sits on a stone throne carved with rams’ heads against barren mountains, holding an ankh scepter and orb.'],
    [5, 'The Hierophant', 'Earth', '♉',
      'tradition, conformity, mentorship, institutions, shared beliefs',
      'rebellion, nonconformity, restriction, personal beliefs, challenging norms',
      'Learn from established wisdom, teachers and time-tested systems.',
      'Breaking with convention to find your own beliefs, or feeling boxed in by rules.',
      'A robed teacher sits between two pillars blessing two kneeling followers; crossed keys lie at his feet.'],
    [6, 'The Lovers', 'Air', '♊',
      'love, union, alignment, values, meaningful choice',
      'disharmony, imbalance, misaligned values, indecision, avoiding a choice',
      'A heartfelt connection or a choice that must reflect your true values.',
      'Values out of sync, a strained bond or a choice being avoided.',
      'Two figures stand beneath an angel with outstretched arms; a tree of flame and a tree of fruit stand behind them.'],
    [7, 'The Chariot', 'Water', '♋',
      'determination, victory, control, willpower, momentum',
      'lack of direction, aggression, loss of control, obstacles, stalling',
      'Harness opposing forces with willpower and drive toward victory.',
      'Pulled in different directions; force without direction stalls progress.',
      'An armored charioteer under a star-spangled canopy drives two sphinxes, one black and one white, with no reins in sight.'],
    [8, 'Strength', 'Fire', '♌',
      'courage, patience, compassion, inner strength, gentle influence',
      'self-doubt, weakness, raw emotion, insecurity, forcing things',
      'True strength is gentle, patient courage that tames the beast within.',
      'Self-doubt or raw emotion takes over; you try to force what needs tenderness.',
      'A woman calmly closes the jaws of a lion while an infinity sign floats above her head.'],
    [9, 'The Hermit', 'Earth', '♍',
      'introspection, solitude, guidance, soul-searching, wisdom',
      'isolation, loneliness, withdrawal, refusing advice, feeling lost',
      'Step back and look inward; a lantern of wisdom lights the next step.',
      'Solitude becomes isolation, or you resist the guidance on offer.',
      'A cloaked elder stands on a snowy peak holding a lantern containing a six-pointed star and a staff.'],
    [10, 'Wheel of Fortune', 'Fire', '☸',
      'cycles, change, fate, turning point, luck',
      'bad luck, resisting change, setbacks, breaking cycles, delays',
      'Life turns on its wheel: a change of fortune and a turning point arrive.',
      'A setback or resisting an inevitable change; the cycle feels stuck.',
      'A great wheel inscribed with letters and symbols turns in the clouds, with winged creatures in the corners holding books.'],
    [11, 'Justice', 'Air', '⚖',
      'fairness, truth, cause and effect, accountability, clarity',
      'unfairness, dishonesty, avoiding accountability, bias, injustice',
      'Truth and fair consequences: actions have results, so decide with integrity.',
      'Bias, dishonesty or dodging responsibility distorts the outcome.',
      'A crowned figure sits between two pillars holding upright scales in one hand and a sword in the other.'],
    [12, 'The Hanged Man', 'Water', '⟂',
      'pause, surrender, new perspective, letting go, suspension',
      'stalling, resistance, needless sacrifice, indecision, delay',
      'A willing pause: let go and see the situation from a new angle.',
      'Stalling for nothing, or sacrificing without gaining any insight.',
      'A man hangs upside-down from a living tree by one foot, serene, with a glowing halo around his head.'],
    [13, 'Death', 'Water', '♏',
      'endings, transformation, release, transition, clearing out',
      'resistance to change, clinging, stagnation, fear of endings, slow decay',
      'A necessary ending clears the ground for transformation and renewal.',
      'Clinging to what is finished prolongs the decay and delays renewal.',
      'A skeleton in black armor rides a white horse past a king, a bishop and a child, while the sun rises between two towers.'],
    [14, 'Temperance', 'Fire', '♐',
      'balance, moderation, patience, harmony, blending',
      'imbalance, excess, extremes, impatience, discord',
      'Blend opposites patiently and find the middle path.',
      'Excess or impatience throws things out of balance.',
      'An angel with one foot on land and one in water pours liquid between two cups under a glowing crown path.'],
    [15, 'The Devil', 'Earth', '♑',
      'attachment, addiction, temptation, shadow self, bondage',
      'release, breaking free, reclaiming power, detachment, awareness',
      'Notice what binds you: unhealthy attachments are held by loose chains.',
      'Chains loosen as you recognize the pattern and reclaim your power.',
      'A horned figure perches over two chained figures whose neck chains are loose enough to lift off.'],
    [16, 'The Tower', 'Fire', '⚡',
      'upheaval, sudden change, revelation, collapse, awakening',
      'avoiding disaster, fear of change, delayed collapse, aftermath, resisting the inevitable',
      'Sudden upheaval shatters false structures and reveals the truth.',
      'Fear of the collapse delays it, or you are sifting through the aftermath.',
      'Lightning strikes a tall tower on a crag, its crown blown off; two figures tumble from the flames.'],
    [17, 'The Star', 'Air', '✦',
      'hope, renewal, inspiration, serenity, healing',
      'despair, discouragement, lost faith, doubt, disconnection',
      'Calm hope and healing follow the storm; trust the quiet guidance.',
      'Faith runs low and hope feels out of reach.',
      'A naked woman kneels by a pool pouring water onto land and into the pool beneath a large star ringed by seven smaller stars.'],
    [18, 'The Moon', 'Water', '☾',
      'illusion, intuition, uncertainty, subconscious, fear',
      'clarity returning, releasing fear, hidden truths surface, confusion lifting, repressed emotion',
      'Things are not as clear as they seem; move carefully and trust intuition.',
      'The fog lifts and hidden truths or buried fears come to light.',
      'A full moon shines over a dog and a wolf howling at a winding path, with a crayfish rising from a pool.'],
    [19, 'The Sun', 'Fire', '☉',
      'joy, success, vitality, positivity, clarity',
      'temporary gloom, dimmed enthusiasm, over-optimism, delayed success, ego',
      'Warmth, joy and plain success; everything is illuminated.',
      'Joy is dimmed or delayed; take care that optimism does not blind you.',
      'A radiant sun shines over a joyful child riding a white horse in front of a wall of sunflowers.'],
    [20, 'Judgement', 'Fire', '♆',
      'reckoning, awakening, calling, forgiveness, renewal',
      'self-doubt, avoiding the call, harsh self-judgment, ignoring lessons, regret',
      'A moment of reckoning and a call to rise and live more truthfully.',
      'Ignoring the call or judging yourself too harshly to move on.',
      'An angel blows a trumpet over a sea as people rise from their coffins with arms outstretched.'],
    [21, 'The World', 'Earth', '◎',
      'completion, wholeness, accomplishment, integration, travel',
      'unfinished business, shortcuts, lack of closure, stalled completion, almost there',
      'A cycle completes in fulfillment; you are whole and ready for the next one.',
      'Something is unfinished or lacks closure; the last step remains.',
      'A dancer wrapped in a sash moves within a laurel wreath, surrounded by the four living creatures in the corners.']
  ];

  // ---------- Minor Arcana ----------
  var RANK_NAMES = {
    1: 'Ace', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
    8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King'
  };

  var SUITS = {
    wands: { name: 'Wands', element: 'Fire', theme: 'passion, action and ambition', glyph: '⚜', symbol: 'a flowering wooden wand' },
    cups: { name: 'Cups', element: 'Water', theme: 'emotion, relationships and intuition', glyph: '♥', symbol: 'a golden cup' },
    swords: { name: 'Swords', element: 'Air', theme: 'thought, truth and conflict', glyph: '†', symbol: 'a double-edged sword' },
    pentacles: { name: 'Pentacles', element: 'Earth', theme: 'work, money and the body', glyph: '✪', symbol: 'a golden pentacle coin' }
  };

  var RANK_SYMBOLS = {
    1: 'A hand emerges from a cloud offering ',
    2: 'Two figures or two emblems in balance with ',
    3: 'Three emblems of growth around ',
    4: 'A stable fourfold arrangement around ',
    5: 'A scene of tension and struggle around ',
    6: 'A scene of exchange and passage with ',
    7: 'A scene of testing and decision with ',
    8: 'A scene of action and focus with ',
    9: 'A scene of near-completion with ',
    10: 'A full, overflowing scene of culmination with ',
    11: 'A young messenger studies ',
    12: 'A mounted knight in motion carries ',
    13: 'A seated queen, steady and receptive, holds ',
    14: 'A crowned king on his throne commands '
  };

  // [rank, upKeywords, revKeywords, up, rev]
  var MINORS = {
    wands: [
      [1, 'inspiration, new venture, spark, potential, enthusiasm', 'delays, lack of direction, creative block, false start, burnout',
        'A spark of inspiration and a bold new venture ready to ignite.', 'The spark fizzles into delay, doubt or a creative block.'],
      [2, 'planning, decisions, future vision, discovery, boldness', 'fear of the unknown, poor planning, playing safe, indecision, bad timing',
        'Weighing your next move from a safe place with a wider world beyond.', 'Fear of the unknown keeps you planning poorly or playing small.'],
      [3, 'expansion, foresight, progress, waiting for returns, overseas', 'delays, obstacles, frustration, lack of foresight, setbacks',
        'Your ventures are launched and you watch for returns on the horizon.', 'Plans are delayed and results slower than hoped.'],
      [4, 'celebration, home, harmony, community, milestone', 'instability, conflict at home, transition, lack of support, cancelled celebration',
        'A joyful milestone celebrated with community on stable ground.', 'Tension at home or a celebration that falls flat.'],
      [5, 'conflict, competition, tension, disagreement, rivalry', 'avoiding conflict, resolution, inner conflict, truce, tension release',
        'Clashing egos and competing interests in a messy struggle.', 'Conflict is avoided or finally settled; tension eases.'],
      [6, 'victory, recognition, pride, success, public acclaim', 'ego, fall from grace, lack of recognition, private success, self-doubt',
        'Public victory and recognition after hard work.', 'Recognition is withheld, or pride comes before a fall.'],
      [7, 'defense, perseverance, standing your ground, challenge, courage', 'giving up, overwhelm, exhaustion, yielding, burnout',
        'Holding your ground against challengers from a position of advantage.', 'Overwhelmed and tempted to give up the fight.'],
      [8, 'speed, swift action, movement, messages, momentum', 'delays, frustration, slowing down, scattered energy, miscommunication',
        'Fast movement and quick progress as everything aligns.', 'Hold-ups, scattered energy and mixed messages slow things down.'],
      [9, 'resilience, persistence, last stand, boundaries, courage', 'exhaustion, defensiveness, paranoia, giving up, stubbornness',
        'Battle-weary but unbroken, you push through one last test.', 'Burnout and defensiveness; you are close to quitting.'],
      [10, 'burden, overwork, responsibility, hard work, stress', 'letting go, delegating, collapse, relief, shedding the load',
        'Carrying too much as success turns into a heavy burden.', 'Setting the load down by delegating or finally letting go.'],
      [11, 'curiosity, enthusiasm, discovery, free spirit, news', 'hasty, lack of direction, procrastination, immaturity, setbacks',
        'An excited explorer bringing a spark of new ideas and news.', 'Big ideas without follow-through; restless and unfocused.'],
      [12, 'energy, adventure, passion, impulsiveness, action', 'recklessness, delays, frustration, scattered focus, hot temper',
        'Charging ahead with passion and adventurous drive.', 'A reckless rush or frustrating stall; haste makes waste.'],
      [13, 'confidence, warmth, independence, determination, charisma', 'jealousy, insecurity, demanding, selfishness, temper',
        'Warm, confident, magnetic and determined.', 'Insecurity or jealousy dims her fire.'],
      [14, 'leadership, vision, big picture, boldness, honor', 'domineering, impulsive, ruthless, overbearing, unrealistic expectations',
        'A visionary leader who inspires and acts boldly.', 'Domineering or impulsive leadership where ego outruns vision.']
    ],
    cups: [
      [1, 'new love, emotional opening, compassion, creativity, overflow', 'emotional loss, blocked feelings, emptiness, repressed emotion, creative block',
        'A heart-opening beginning of love, compassion and emotional overflow.', 'Feelings held back, leaving emptiness or blocked emotion.'],
      [2, 'partnership, mutual attraction, unity, connection, balance', 'imbalance, broken communication, disharmony, one-sided, separation',
        'A balanced, mutual connection between two people.', 'A one-sided or strained bond with broken communication.'],
      [3, 'friendship, celebration, community, joy, support', 'gossip, overindulgence, isolation, third party, cancelled plans',
        'Celebrating with friends in shared joy.', 'Gossip, overindulgence or feeling left out of the circle.'],
      [4, 'apathy, contemplation, reevaluation, discontent, missed opportunity', 'new awareness, motivation, acceptance, taking offers, moving on',
        'Bored and withdrawn, overlooking what is being offered.', 'Waking up to new offers and re-engaging with life.'],
      [5, 'loss, grief, regret, disappointment, focusing on the negative', 'acceptance, moving on, forgiveness, finding peace, recovery',
        'Grieving what has spilled while overlooking what remains.', 'Turning toward what is left: acceptance and healing.'],
      [6, 'nostalgia, childhood, innocence, reunion, kindness', 'stuck in the past, unrealistic memories, leaving home, moving forward, naivety',
        'Sweet nostalgia, reunion and simple kindness.', 'Dwelling on the past, or finally outgrowing it.'],
      [7, 'choices, fantasy, illusion, wishful thinking, daydreams', 'clarity, decision, reality check, sorting options, overwhelm lifting',
        'Many tempting options clouded by fantasy.', 'Illusions clear and a real choice gets made.'],
      [8, 'walking away, disillusionment, seeking more, withdrawal, search for meaning', 'fear of change, aimless drifting, staying put, avoidance, returning',
        'Leaving something unfulfilling to search for deeper meaning.', 'Clinging to the familiar or drifting without purpose.'],
      [9, 'wish fulfilled, contentment, satisfaction, gratitude, pleasure', 'smugness, dissatisfaction, greed, indulgence, hollow success',
        'Wishes granted and a satisfied contentment.', 'Dissatisfaction or smug, hollow indulgence.'],
      [10, 'harmony, family, fulfillment, happy home, alignment', 'broken family, disconnection, misalignment, domestic conflict, unrealistic ideal',
        'Lasting emotional fulfillment and a happy home.', 'Family discord or a picture-perfect image that cracks.'],
      [11, 'sensitivity, creative spark, message of love, intuition, innocence', 'emotional immaturity, moodiness, insecurity, escapism, creative block',
        'A tender message, creative inspiration and a gentle heart.', 'Moody, naive or emotionally immature.'],
      [12, 'romance, charm, invitation, idealism, following the heart', 'moodiness, unrealistic promises, jealousy, disappointment, false charm',
        'A romantic proposal or charming idealist following the heart.', 'Unrealistic promises, moodiness or false charm.'],
      [13, 'compassion, intuition, emotional security, caring, calm', 'emotional insecurity, codependency, martyrdom, overwhelm, moodiness',
        'Nurturing, intuitive and emotionally secure.', 'Overwhelmed or codependent, with boundaries dissolving.'],
      [14, 'emotional balance, diplomacy, generosity, composure, wisdom', 'emotional manipulation, volatility, coldness, moodiness, repression',
        'Calm, wise emotional mastery with compassion.', 'Emotions suppressed or used to manipulate.']
    ],
    swords: [
      [1, 'clarity, breakthrough, truth, new idea, justice', 'confusion, clouded judgment, brutality, miscommunication, chaos',
        'A clear breakthrough of truth and mental clarity.', 'Clouded thinking, confusion or harsh words.'],
      [2, 'stalemate, difficult choice, blocked emotions, avoidance, truce', 'indecision, confusion, information overload, lesser evil, release',
        'A standoff: avoiding a decision with eyes closed.', 'Indecision breaks, or confusion and overload swamp you.'],
      [3, 'heartbreak, grief, sorrow, painful truth, hurt', 'recovery, forgiveness, releasing pain, healing, moving on',
        'Heartbreak and a painful truth.', 'Healing, forgiveness and slowly releasing the pain.'],
      [4, 'rest, recovery, contemplation, retreat, restoration', 'restlessness, burnout, exhaustion, returning to action, stress',
        'Needed rest and mental restoration.', 'Restlessness or burnout, or finally emerging back into action.'],
      [5, 'conflict, defeat, win at all costs, betrayal, hollow victory', 'reconciliation, making amends, past resentment, moving on, regret',
        'A hollow win in a conflict that leaves resentment.', 'Reconciliation and letting go of old grudges.'],
      [6, 'transition, moving on, calmer waters, healing journey, leaving behind', 'stuck, resistance to transition, unfinished business, baggage, emotional baggage',
        'A quiet passage toward calmer waters.', 'Stuck in place or carrying baggage along.'],
      [7, 'deception, strategy, stealth, sneaking, going it alone', 'confession, conscience, coming clean, getting caught, rethinking',
        'Acting alone through stealth, strategy or deception.', 'Coming clean, or being found out.'],
      [8, 'restriction, feeling trapped, self-imposed limits, powerlessness, victim mindset', 'freedom, self-acceptance, new perspective, releasing limits, taking control',
        'Feeling trapped by self-made limits.', 'Breaking free as you finally see the way out.'],
      [9, 'anxiety, worry, nightmares, guilt, insomnia', 'hope, reaching out, relief, despair, facing fears',
        'Anxiety and sleepless worry.', 'Worry lifts as you reach out, or despair lingers unspoken.'],
      [10, 'painful ending, rock bottom, betrayal, collapse, crisis', 'recovery, survival, regeneration, inevitable end, refusing to let go',
        'A painful, final ending: rock bottom.', 'Recovery begins, or you cling to a finished chapter.'],
      [11, 'curiosity, new ideas, vigilance, mental energy, communication', 'all talk, gossip, haste, deception, scattered thinking',
        'A curious, alert mind full of new ideas.', 'A sharp tongue, gossip or talk without substance.'],
      [12, 'ambition, drive, directness, fast thinking, action', 'impulsive, aggression, unfocused, tactless, disregard',
        'Charging in with a sharp, ambitious intellect.', 'Reckless, blunt or aggressively unfocused.'],
      [13, 'clear mind, independence, honesty, perceptiveness, boundaries', 'cold, bitter, harsh, overly critical, cruel',
        'Honest, perceptive, independent thinking.', 'Cold, bitter or cutting criticism.'],
      [14, 'authority, intellectual power, truth, ethics, analysis', 'manipulative, abuse of power, cold, tyrannical, inconsiderate',
        'Clear, ethical, authoritative judgment.', 'Misusing intellect and power to manipulate.']
    ],
    pentacles: [
      [1, 'opportunity, prosperity, new venture, manifestation, abundance', 'missed chance, scarcity, bad investment, lack of planning, greed',
        'A seed of material opportunity and prosperity.', 'A missed opportunity or poor planning.'],
      [2, 'balance, juggling, adaptability, priorities, time management', 'overwhelm, disorganization, overcommitment, imbalance, financial stress',
        'Juggling priorities with flexibility.', 'Overwhelmed and dropping the balls.'],
      [3, 'teamwork, collaboration, craftsmanship, learning, building', 'disharmony, poor quality, misalignment, lack of teamwork, working alone',
        'Skilled teamwork building something solid.', 'Poor collaboration or shoddy work.'],
      [4, 'security, saving, control, stability, possessiveness', 'greed, materialism, hoarding, generosity, financial insecurity',
        'Holding tight to security and resources.', 'Greed or financial insecurity, or loosening the grip.'],
      [5, 'hardship, loss, isolation, poverty, worry', 'recovery, charity, improvement, finding help, spiritual wealth',
        'Hardship and feeling left out in the cold.', 'Help is found and recovery begins.'],
      [6, 'generosity, charity, sharing, fairness, support', 'strings attached, debt, one-sided giving, selfishness, power imbalance',
        'Giving and receiving in fair balance.', 'Strings attached or one-sided giving.'],
      [7, 'patience, long-term view, investment, assessment, perseverance', 'impatience, lack of reward, poor results, wasted effort, distraction',
        'Pausing to assess a slow-growing harvest.', 'Impatience or effort without reward.'],
      [8, 'craftsmanship, diligence, skill, focus, apprenticeship', 'perfectionism, lack of motivation, shoddy work, uninspired, repetition',
        'Dedicated practice that hones your skill.', 'Perfectionism or sloppy, uninspired work.'],
      [9, 'abundance, luxury, self-sufficiency, independence, refinement', 'overspending, dependence, superficiality, living beyond means, isolation',
        'Self-made comfort and independence.', 'Overspending or financial dependence.'],
      [10, 'legacy, wealth, family, inheritance, long-term security', 'financial failure, family disputes, loss, instability, fleeting wealth',
        'Lasting wealth and family legacy.', 'Family disputes or unstable foundations.'],
      [11, 'study, ambition, new skill, diligence, opportunity', 'procrastination, lack of commitment, short-term thinking, unrealistic goals, wasted effort',
        'A diligent student starting a practical venture.', 'Procrastination and half-hearted effort.'],
      [12, 'hard work, routine, reliability, patience, thoroughness', 'boredom, stagnation, laziness, obsession, feeling stuck',
        'Slow, steady, dependable progress.', 'Stagnation, laziness or a rigid routine.'],
      [13, 'nurturing, practicality, abundance, providing, comfort', 'self-neglect, work-home imbalance, smothering, jealousy, insecurity',
        'A practical, generous provider with comforting abundance.', 'Neglecting yourself or smothering others with practicalities.'],
      [14, 'wealth, security, discipline, business sense, leadership', 'greed, stubbornness, materialism, poor financial decisions, controlling',
        'A prosperous, reliable steward of resources.', 'Greedy, stubborn or reckless with resources.']
    ]
  };

  function splitList(s) {
    return s.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  }

  var cards = [];

  MAJORS.forEach(function (m) {
    cards.push({
      id: 'maj' + (m[0] < 10 ? '0' : '') + m[0],
      name: m[1],
      short: m[1].replace(/^The /, ''),
      arcana: 'major',
      suit: null,
      number: m[0],
      numeral: roman(m[0]),
      element: m[2],
      glyph: m[3],
      upKeywords: splitList(m[4]),
      revKeywords: splitList(m[5]),
      up: m[6],
      rev: m[7],
      symbolism: m[8]
    });
  });

  Object.keys(MINORS).forEach(function (suitKey) {
    var suit = SUITS[suitKey];
    MINORS[suitKey].forEach(function (r) {
      var rank = r[0];
      var name = RANK_NAMES[rank] + ' of ' + suit.name;
      cards.push({
        id: suitKey + (rank < 10 ? '0' : '') + rank,
        name: name,
        short: name,
        arcana: 'minor',
        suit: suitKey,
        number: rank,
        rankName: RANK_NAMES[rank],
        element: suit.element,
        glyph: suit.glyph,
        upKeywords: splitList(r[1]),
        revKeywords: splitList(r[2]),
        up: r[3],
        rev: r[4],
        symbolism: RANK_SYMBOLS[rank] + suit.symbol + ' (' + suit.name + ': ' + suit.theme + ').'
      });
    });
  });

  var byId = {};
  cards.forEach(function (c) { byId[c.id] = c; });

  function roman(n) {
    var map = [[20, 'XX'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    if (n === 0) return '0';
    var out = '';
    map.forEach(function (p) { while (n >= p[0]) { out += p[1]; n -= p[0]; } });
    return out;
  }
  global.TarotData = { cards: cards, byId: byId, suits: SUITS, ranks: RANK_NAMES };
})(typeof window !== 'undefined' ? window : globalThis);
