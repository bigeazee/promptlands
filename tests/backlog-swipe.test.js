/**
 * The demo's ranking logic.
 *
 * Two of these tests are load-bearing rather than decorative, and both protect
 * the same thing - a tool whose only job is to FIND disagreement must not
 * quietly manufacture agreement:
 *
 *   - the shuffle, because two people fed the same starting order get the same
 *     comparison sequence and therefore share the same anchoring bias
 *   - the side assignment, because if the item being placed is always the
 *     right-hand card then a reader works that out in three questions and stops
 *     comparing two things
 *
 * The rest is the ordinary business of a file somebody else made: it has to be
 * refused with a sentence rather than an exception.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  FORMAT_VERSION,
  MIN_ITEMS,
  SAMPLE_BACKLOG,
  SMALL_GAP,
  STORAGE_KEY,
  TOOL_ID,
  answer,
  buildExport,
  canUndo,
  compareRankings,
  comparisonsForList,
  comparisonsToPlace,
  createSession,
  exportFilename,
  isComplete,
  nextComparison,
  parseCsv,
  parseExport,
  progress,
  rankedItems,
  restoreSession,
  shuffle,
  undo,
} from "../demos/backlog-swipe/rank.js";

/* ------------------------------------------------------------------- helpers */

/** A deterministic stand-in for Math.random, so a run repeats exactly. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function itemsNamed(...titles) {
  return titles.map((title, index) => ({ id: String(index + 1), title }));
}

function numberedItems(count) {
  return Array.from({ length: count }, (_, i) => ({ id: String(i), title: `item ${i}` }));
}

/**
 * Answer every question the way somebody with a fixed opinion would: `rank` maps
 * an id to its true position, lower being more important.
 */
function runToCompletion(state, rank) {
  let current = state;
  let comparisons = 0;
  while (!isComplete(current)) {
    const question = nextComparison(current);
    const winner =
      rank.get(question.left.id) < rank.get(question.right.id) ? question.left : question.right;
    current = answer(current, winner.id);
    comparisons += 1;
    assert.ok(comparisons < 5000, "the ranking loop should terminate");
  }
  return { state: current, comparisons };
}

/** Turn a plain ordered list of titles into the shape compareRankings wants. */
function ranking(who, titles) {
  return { who, items: titles.map((title) => ({ id: title, title })) };
}

/* --------------------------------------------------------- binary insertion */

test("an item more important than everything goes to the top", () => {
  const items = itemsNamed("first", "second", "newcomer");
  let state = createSession(items, { random: seededRandom(3) });

  // Whatever the shuffle did, answering "the newcomer always wins" has to put
  // it first and leave the other two in whatever order they earned.
  const result = runToCompletion(state, new Map(items.map((i) => [i.id, i.title === "newcomer" ? -1 : 1])));
  assert.equal(rankedItems(result.state)[0].title, "newcomer");
});

test("an item less important than everything goes to the bottom", () => {
  const items = itemsNamed("first", "second", "makeweight");
  const state = createSession(items, { random: seededRandom(5) });

  const result = runToCompletion(
    state,
    new Map(items.map((i) => [i.id, i.title === "makeweight" ? 99 : 1]))
  );
  const order = rankedItems(result.state);
  assert.equal(order[order.length - 1].title, "makeweight");
});

test("an item goes into the middle of an existing order", () => {
  const items = numberedItems(9);
  // True order is 0..8. Every item lands somewhere in the middle of the rest.
  const rank = new Map(items.map((item, index) => [item.id, index]));
  const result = runToCompletion(createSession(items, { random: seededRandom(11) }), rank);

  assert.deepEqual(
    rankedItems(result.state).map((item) => item.id),
    items.map((item) => item.id)
  );
});

test("a full run over a known set of answers produces the expected final order", () => {
  const items = itemsNamed("apples", "bread", "coffee", "dates", "eggs");
  // A fixed opinion: coffee first, then eggs, apples, dates, bread.
  const truth = ["coffee", "eggs", "apples", "dates", "bread"];
  const rank = new Map(items.map((item) => [item.id, truth.indexOf(item.title)]));

  // Every starting shuffle must land on the same answer. That is the point of
  // a ranking as opposed to a pile of opinions about pairs.
  for (let seed = 1; seed <= 25; seed += 1) {
    const result = runToCompletion(createSession(items, { random: seededRandom(seed) }), rank);
    assert.deepEqual(
      rankedItems(result.state).map((item) => item.title),
      truth,
      `seed ${seed} produced a different order`
    );
  }
});

test("thirty items cost about n log n comparisons, nowhere near n squared", () => {
  const items = numberedItems(30);
  const rank = new Map(items.map((item, index) => [item.id, index]));

  let worst = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    const result = runToCompletion(createSession(items, { random: seededRandom(seed) }), rank);
    worst = Math.max(worst, result.comparisons);
  }

  // n log2 n is about 147 for thirty items; n squared is 900. The worst case
  // the algorithm can produce is 119, which is what "about four minutes at two
  // seconds a comparison" in the station copy rests on.
  assert.equal(comparisonsForList(30), 119);
  assert.ok(worst <= 119, `worst run took ${worst} comparisons`);
  assert.ok(worst < 30 * Math.log2(30), `worst run took ${worst}, above n log n`);
  assert.ok(worst < (30 * 30) / 4, `worst run took ${worst}, too close to n squared`);
});

test("the comparisons needed for one item are counted honestly", () => {
  // Nothing to compare against, so nothing to ask.
  assert.equal(comparisonsToPlace(0), 0);
  // Two possible positions, one question.
  assert.equal(comparisonsToPlace(1), 1);
  // Thirteen possible positions needs four halvings, not five.
  assert.equal(comparisonsToPlace(12), 4);
  assert.equal(comparisonsForList(20), 69);
  assert.equal(comparisonsForList(40), 177);
});

test("progress counts items placed, never comparisons made", () => {
  const items = numberedItems(8);
  let state = createSession(items, { random: seededRandom(2) });

  assert.equal(progress(state).placed, 1, "the first item is placed for free");
  assert.equal(progress(state).total, 8);

  const before = progress(state).placed;
  state = answer(state, nextComparison(state).left.id);
  const after = progress(state);

  assert.equal(after.comparisons, 1);
  // One answer does not necessarily place an item - that is the whole reason
  // the readout cannot be a count of comparisons.
  assert.ok(after.placed === before || after.placed === before + 1);
});

/* ------------------------------------------------------------------- undo */

test("undo puts the session back exactly where it was", () => {
  const state = createSession(numberedItems(12), { random: seededRandom(9) });
  const before = JSON.stringify(state);

  const question = nextComparison(state);
  const rewound = undo(answer(state, question.left.id));

  assert.equal(JSON.stringify(rewound), before);
  assert.equal(canUndo(state), false, "there is nothing to undo before the first answer");
});

test("undo unwinds a completed placement, not just the last question", () => {
  const items = numberedItems(6);
  const rank = new Map(items.map((item, index) => [item.id, index]));
  let state = createSession(items, { random: seededRandom(4) });

  // Answer until an item actually lands, then take it back.
  let placedBefore = progress(state).placed;
  let snapshot = state;
  while (progress(state).placed === placedBefore) {
    snapshot = state;
    const question = nextComparison(state);
    const winner =
      rank.get(question.left.id) < rank.get(question.right.id) ? question.left : question.right;
    state = answer(state, winner.id);
  }

  assert.equal(progress(state).placed, placedBefore + 1);
  assert.equal(JSON.stringify(undo(state)), JSON.stringify(snapshot));
});

test("an answer naming a card that is not on screen changes nothing", () => {
  const state = createSession(numberedItems(5), { random: seededRandom(6) });
  assert.equal(answer(state, "not-a-real-id"), state);
});

/* ---------------------------------------------------------------- shuffling */

test("the shuffle keeps every item exactly once", () => {
  const items = numberedItems(40);
  const shuffled = shuffle(items, seededRandom(21));

  assert.equal(shuffled.length, items.length);
  assert.deepEqual(
    shuffled.map((item) => item.id).sort(),
    items.map((item) => item.id).sort()
  );
  // The input is not touched, so a caller's list stays in the order they had it.
  assert.deepEqual(items.map((item) => item.id), numberedItems(40).map((item) => item.id));
});

test("the same input twice produces different presentation orders", () => {
  const items = numberedItems(24);

  // Real Math.random, because this is exactly the property a seeded generator
  // would let through: the tool must not hand two people the same sequence.
  const orders = new Set();
  for (let run = 0; run < 25; run += 1) {
    orders.add(createSession(items).items.map((item) => item.id).join(","));
  }

  assert.ok(orders.size > 1, "every session started from the same order");
  // Twenty-five runs over twenty-four items landing on one order would be a
  // one-in-astronomical accident, so this is a real failure and not a flake.
  assert.ok(orders.size > 20, `only ${orders.size} distinct orders in 25 runs`);
});

test("which side the new item lands on changes from question to question", () => {
  const items = numberedItems(30);
  const rank = new Map(items.map((item, index) => [item.id, index]));

  let state = createSession(items, { random: seededRandom(13) });
  let left = 0;
  let right = 0;

  while (!isComplete(state)) {
    const question = nextComparison(state);
    if (question.left.id === question.candidate.id) left += 1;
    else right += 1;
    const winner =
      rank.get(question.left.id) < rank.get(question.right.id) ? question.left : question.right;
    state = answer(state, winner.id);
  }

  // Pinned to one side, a reader learns within three questions which card is
  // the new one and stops comparing them.
  assert.ok(left > 0 && right > 0, `the new item was always on one side (${left}/${right})`);
  const share = left / (left + right);
  assert.ok(share > 0.3 && share < 0.7, `sides split ${left}/${right}, too lopsided`);
});

test("the side a card is on survives a reload of the same question", () => {
  const state = createSession(numberedItems(20), { random: seededRandom(17) });
  const first = nextComparison(state);
  const reloaded = restoreSession(JSON.stringify(state));

  // Refreshing mid-question must not swap the two cards over, or somebody
  // answers the opposite of what they meant.
  assert.deepEqual(nextComparison(reloaded).left, first.left);
  assert.deepEqual(nextComparison(reloaded).right, first.right);
});

/* ----------------------------------------------------------------- resuming */

test("a half-finished session resumes where it stopped, without reshuffling", () => {
  const items = numberedItems(16);
  const rank = new Map(items.map((item, index) => [item.id, index]));

  let state = createSession(items, { random: seededRandom(8) });
  for (let i = 0; i < 12; i += 1) {
    const question = nextComparison(state);
    const winner =
      rank.get(question.left.id) < rank.get(question.right.id) ? question.left : question.right;
    state = answer(state, winner.id);
  }

  const resumed = restoreSession(JSON.stringify(state));

  assert.deepEqual(resumed.items, state.items, "the presentation order was reshuffled");
  assert.deepEqual(resumed.order, state.order);
  assert.equal(progress(resumed).placed, progress(state).placed);
  assert.deepEqual(nextComparison(resumed), nextComparison(state));

  // And it finishes to the same answer as the session that never stopped.
  assert.deepEqual(
    rankedItems(runToCompletion(resumed, rank).state).map((i) => i.id),
    rankedItems(runToCompletion(state, rank).state).map((i) => i.id)
  );
});

test("nothing about storage throws, whatever is in it", () => {
  const good = createSession(numberedItems(6), { random: seededRandom(1) });

  const hostile = [
    null,
    undefined,
    "",
    "{{{",
    "null",
    "[]",
    '"a string"',
    "42",
    JSON.stringify({ version: 99, items: [], order: [] }),
    JSON.stringify({ ...good, order: [0, 0] }), // the same item placed twice
    JSON.stringify({ ...good, order: [99] }), // an index that is not an item
    JSON.stringify({ ...good, low: 4, high: 1 }), // a range that cannot be
    JSON.stringify({ ...good, items: [] }),
    JSON.stringify({ ...good, seed: "nonsense" }),
  ];

  for (const raw of hostile) {
    assert.equal(restoreSession(raw), null, `${String(raw).slice(0, 30)} should not restore`);
  }

  assert.notEqual(restoreSession(JSON.stringify(good)), null);
  assert.equal(STORAGE_KEY, "promptlands.backlog-swipe.v1");
  // The game owns promptlands.v1. These two must never read each other's data.
  assert.notEqual(STORAGE_KEY, "promptlands.v1");
});

/* ------------------------------------------------------------------- export */

test("an export carries the ranking in order, with the name in it", () => {
  const items = itemsNamed("apples", "bread", "coffee");
  const rank = new Map(items.map((item, index) => [item.id, ["coffee", "apples", "bread"].indexOf(item.title)]));
  const { state } = runToCompletion(createSession(items, { random: seededRandom(2) }), rank);

  const file = buildExport(state, "  Alex  ");

  assert.equal(file.tool, TOOL_ID);
  assert.equal(file.version, FORMAT_VERSION);
  assert.equal(file.who, "Alex");
  assert.deepEqual(file.items.map((i) => i.title), ["coffee", "apples", "bread"]);
  // Nothing but id and title travels: no seed, no history, no timings.
  assert.deepEqual(Object.keys(file.items[0]).sort(), ["id", "title"]);
});

test("the filename says whose ranking it is", () => {
  assert.equal(exportFilename("Alex"), "backlog-swipe-alex.json");
  assert.equal(exportFilename("Sam Okafor"), "backlog-swipe-sam-okafor.json");
  assert.equal(exportFilename(""), "backlog-swipe.json");
  assert.equal(exportFilename("  ??  "), "backlog-swipe.json");
});

test("an export round-trips", () => {
  const rank = new Map(SAMPLE_BACKLOG.map((item, index) => [item.id, index]));
  const { state } = runToCompletion(
    createSession(SAMPLE_BACKLOG, { random: seededRandom(31) }),
    rank
  );

  const file = buildExport(state, "Alex");
  const read = parseExport(JSON.stringify(file));

  assert.equal(read.ok, true);
  assert.equal(read.who, "Alex");
  assert.deepEqual(read.items, file.items);
  assert.equal(read.items.length, SAMPLE_BACKLOG.length);
});

test("a file that is not ours is refused with a sentence, not an exception", () => {
  const cases = [
    ["not json at all", "readable as JSON"],
    ["{ broken", "readable as JSON"],
    ['{"tool":"something.else","version":1,"items":[]}', "did not come from Backlog Swipe"],
    ["[1,2,3]", "did not come from Backlog Swipe"],
    ["null", "did not come from Backlog Swipe"],
    [`{"tool":"${TOOL_ID}","version":2,"items":[]}`, "version"],
    [`{"tool":"${TOOL_ID}","version":1,"items":[]}`, "at least two items"],
    [`{"tool":"${TOOL_ID}","version":1,"items":"nope"}`, "at least two items"],
  ];

  for (const [text, expected] of cases) {
    const result = parseExport(text);
    assert.equal(result.ok, false, `${text} should be refused`);
    assert.ok(
      result.message.includes(expected),
      `message for ${text} was: ${result.message}`
    );
    // Every refusal has to be a whole sentence somebody can act on.
    assert.ok(result.message.length > 40 && result.message.endsWith("."));
  }
});

test("an export naming the same id twice is refused", () => {
  const text = JSON.stringify({
    tool: TOOL_ID,
    version: FORMAT_VERSION,
    who: "Alex",
    items: [
      { id: "1", title: "one" },
      { id: "1", title: "one again" },
    ],
  });
  const result = parseExport(text);
  assert.equal(result.ok, false);
  assert.ok(result.message.includes("same id twice"));
});

/* ---------------------------------------------------------------------- CSV */

test("a plain CSV loads", () => {
  const result = parseCsv("id,title\n1,First thing\n2,Second thing\n");
  assert.equal(result.ok, true);
  assert.deepEqual(result.items, [
    { id: "1", title: "First thing" },
    { id: "2", title: "Second thing" },
  ]);
});

test("a CSV survives being made by a spreadsheet", () => {
  // A byte-order mark, Windows line endings, a quoted field containing a comma,
  // a doubled quote inside a quoted field, columns nobody asked about in an
  // order nobody promised, mixed-case headers, and a blank line at the bottom.
  const text =
    '﻿Status,TITLE,id,Assignee\r\n' +
    'open,"Search is slow, especially on Mondays",42,someone\r\n' +
    'open,"The ""save"" button does nothing",43,someone else\r\n' +
    '\r\n';

  const result = parseCsv(text);
  assert.equal(result.ok, true);
  assert.deepEqual(result.items, [
    { id: "42", title: "Search is slow, especially on Mondays" },
    { id: "43", title: 'The "save" button does nothing' },
  ]);
});

test("a quoted field may contain a line break", () => {
  const result = parseCsv('id,title\n1,"Two\nlines"\n2,Ordinary\n');
  assert.equal(result.ok, true);
  assert.equal(result.items[0].title, "Two\nlines");
  assert.equal(result.items.length, 2);
});

test("a CSV without the columns it needs says which one is missing", () => {
  const missingTitle = parseCsv("id,summary\n1,Something\n2,Else\n");
  assert.equal(missingTitle.ok, false);
  assert.ok(missingTitle.message.includes("no title column"));
  // And says what it did find, so the reader can see the mismatch.
  assert.ok(missingTitle.message.includes("summary"));

  const missingId = parseCsv("ref,title\n1,Something\n2,Else\n");
  assert.equal(missingId.ok, false);
  assert.ok(missingId.message.includes("no id column"));

  const missingBoth = parseCsv("a,b\n1,2\n");
  assert.equal(missingBoth.ok, false);
  assert.ok(missingBoth.message.includes("no id column and no title column"));
});

test("a CSV with no header row is refused rather than eating the first item", () => {
  const result = parseCsv("1,First thing\n2,Second thing\n");
  assert.equal(result.ok, false);
  assert.ok(result.message.includes("first row needs to name the columns"));
});

test("a CSV without enough to compare is refused", () => {
  assert.equal(parseCsv("").ok, false);
  assert.equal(parseCsv("   ").ok, false);
  assert.equal(parseCsv("id,title\n").ok, false);

  const one = parseCsv("id,title\n1,Only one\n");
  assert.equal(one.ok, false);
  assert.ok(one.message.includes("only one row"));
  assert.ok(one.message.includes(String(MIN_ITEMS)));
});

test("a CSV reusing an id is refused, because the diff would be nonsense", () => {
  const result = parseCsv("id,title\n7,First\n7,Second\n8,Third\n");
  assert.equal(result.ok, false);
  assert.ok(result.message.includes('"7"'));
});

test("rows missing an id or a title are skipped, not fatal", () => {
  const result = parseCsv("id,title\n1,Real\n,No id here\n2,\n3,Also real\n");
  assert.equal(result.ok, true);
  assert.deepEqual(result.items.map((i) => i.id), ["1", "3"]);
});

/* ------------------------------------------------------------ disagreement */

test("two identical rankings disagree about nothing", () => {
  const titles = ["a", "b", "c", "d"];
  const result = compareRankings(ranking("Alex", titles), ranking("Sam", titles));

  assert.equal(result.ok, true);
  assert.deepEqual(result.disagreements, []);
  assert.equal(result.agreedCount, 4);
  assert.equal(result.sharedCount, 4);
  assert.deepEqual(result.onlyInA, []);
  assert.deepEqual(result.onlyInB, []);
});

test("a reversal disagrees about everything, biggest gap first", () => {
  const titles = ["a", "b", "c", "d", "e"];
  const result = compareRankings(ranking("Alex", titles), ranking("Sam", [...titles].reverse()));

  assert.equal(result.disagreements.length, 4, "the middle item does not move");
  assert.equal(result.agreedCount, 1);

  const gaps = result.disagreements.map((row) => row.gap);
  assert.deepEqual(gaps, [4, 4, 2, 2]);
  assert.deepEqual([...gaps].sort((x, y) => y - x), gaps, "rows are not biggest-gap-first");

  const first = result.disagreements[0];
  assert.equal(first.aRank + first.bRank, titles.length + 1);
});

test("items in one file only are separated out, and never scored", () => {
  const a = ranking("Alex", ["shared one", "alex only", "shared two"]);
  const b = ranking("Sam", ["shared two", "sam only", "shared one", "sam also"]);
  const result = compareRankings(a, b);

  assert.equal(result.ok, true);
  assert.equal(result.sharedCount, 2);

  const scored = result.disagreements.map((row) => row.title);
  assert.ok(!scored.includes("alex only"));
  assert.ok(!scored.includes("sam only"));

  assert.deepEqual(result.onlyInA.map((i) => i.title), ["alex only"]);
  assert.deepEqual(result.onlyInB.map((i) => i.title), ["sam only", "sam also"]);

  // Nothing anywhere in the result adds the two people together.
  const keys = new Set(result.disagreements.flatMap((row) => Object.keys(row)));
  for (const forbidden of ["score", "combined", "merged", "average", "total", "consensus"]) {
    assert.ok(!keys.has(forbidden), `a row carries a ${forbidden}`);
  }
});

test("two rankings with nothing in common are refused with a sentence", () => {
  const result = compareRankings(ranking("Alex", ["a", "b"]), ranking("Sam", ["c", "d"]));
  assert.equal(result.ok, false);
  assert.ok(result.message.includes("no items in common"));
  assert.ok(result.message.endsWith("."));
});

test("a person with no name still gets called something", () => {
  const result = compareRankings(ranking("", ["a", "b"]), ranking("  ", ["b", "a"]));
  assert.equal(result.ok, true);
  assert.equal(result.whoA, "The first person");
  assert.equal(result.whoB, "The second person");
  assert.notEqual(result.whoA, result.whoB);
});

test("the small-gap tail is separable but never dropped", () => {
  // One item moved a long way drags everything it passed by one place. Those
  // are the wake of a disagreement, not twenty of them.
  const titles = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const moved = ["h", "a", "b", "c", "d", "e", "f", "g"];
  const result = compareRankings(ranking("Alex", titles), ranking("Sam", moved));

  assert.equal(result.disagreements.length, 8, "every item shifted");
  const wide = result.disagreements.filter((row) => row.gap > SMALL_GAP);
  const close = result.disagreements.filter((row) => row.gap <= SMALL_GAP);

  assert.equal(wide.length, 1, "only one item actually moved");
  assert.equal(wide[0].title, "h");
  assert.equal(close.length + wide.length, result.disagreements.length);
  // Folding is the page's business; the logic hands over everything.
  assert.equal(close.length, 7);
});

/* ------------------------------------------------------------------ sample */

test("the built-in sample is usable and says nothing about anybody", () => {
  assert.ok(SAMPLE_BACKLOG.length >= 20 && SAMPLE_BACKLOG.length <= 30);

  const ids = new Set(SAMPLE_BACKLOG.map((item) => item.id));
  assert.equal(ids.size, SAMPLE_BACKLOG.length, "the sample reuses an id");

  for (const item of SAMPLE_BACKLOG) {
    assert.equal(typeof item.id, "string");
    assert.ok(item.title.length > 8, `"${item.title}" is too short to judge`);
    // Short enough to read in four seconds, which is the whole premise.
    assert.ok(item.title.length < 70, `"${item.title}" is too long for a card`);
  }

  // The published site is public. Nothing in here may look like a real ticket
  // in a real tracker, or name a real place.
  const text = SAMPLE_BACKLOG.map((item) => `${item.id} ${item.title}`).join("\n");
  assert.ok(!/[A-Z]{2,}-\d+/.test(text), "the sample contains something shaped like a ticket key");
  assert.ok(!/https?:|@|\.com|\.co\.uk|\.org|\.net/i.test(text), "the sample contains a URL or an address");

  // And it has to actually rank.
  const rank = new Map(SAMPLE_BACKLOG.map((item, index) => [item.id, index]));
  const { state, comparisons } = runToCompletion(
    createSession(SAMPLE_BACKLOG, { random: seededRandom(23) }),
    rank
  );
  assert.equal(rankedItems(state).length, SAMPLE_BACKLOG.length);
  assert.ok(comparisons <= comparisonsForList(SAMPLE_BACKLOG.length));
});

test("a list too short to compare is refused at the door", () => {
  assert.throws(() => createSession([], {}), /at least/);
  assert.throws(() => createSession([{ id: "1", title: "alone" }], {}), /at least/);
  assert.throws(() => createSession([{ id: "", title: "" }, { id: "2", title: "x" }], {}), /at least/);
});
