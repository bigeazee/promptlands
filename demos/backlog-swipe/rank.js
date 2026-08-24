/**
 * BACKLOG SWIPE - RANKING
 * =======================
 *
 * Every decision this tool makes, with no DOM anywhere near it.
 *
 * The page in index.html draws things and listens for clicks. It does not
 * decide anything: which two items to show, which side each one goes on, where
 * an answer puts an item, what a CSV meant, or where two people disagree all
 * happen in here, so that `node --test` can check them in a plain Node process.
 *
 * THE MECHANIC IS BINARY INSERTION. One comparison per item cannot produce a
 * ranking - it produces a pile of opinions about pairs. So each new item is
 * binary-searched into the order established so far: show it against the
 * midpoint of the range still in play, and halve that range with each answer.
 * That is four or five comparisons per item and about 119 for a list of thirty,
 * which is roughly four minutes at two seconds a comparison.
 *
 * TWO RULES IN HERE ARE CORRECTNESS, NOT POLISH, and both exist to stop the
 * tool hiding the disagreement it was built to find:
 *
 *   1. The items are SHUFFLED once per session. Binary insertion asks different
 *      questions depending on the order items arrive in, and anchoring is real.
 *      Two people fed the same starting order get the same comparison sequence
 *      and share the same bias - which would systematically hide disagreement.
 *      The shuffled order is part of the saved state, so a reload does not
 *      reshuffle half way through.
 *
 *   2. WHICH SIDE the new item appears on is decided per comparison. Put it on
 *      the right every time and a reader works that out within three questions,
 *      and from then on they are answering "is the right-hand card important?"
 *      rather than comparing two things. The side is derived from the session
 *      seed and the number of answers so far, so it is stable across a reload
 *      and still different every question.
 *
 * Nothing in here throws on bad input from a person. A file that will not parse
 * comes back as `{ok: false, message}` with a sentence saying what to do, because
 * the person reading it opened a link after a talk and has nobody to ask.
 */

export const TOOL_ID = "promptlands.backlog-swipe";
export const FORMAT_VERSION = 1;

/**
 * Its own key. The game owns `promptlands.v1` and these two must never read
 * each other's data.
 */
export const STORAGE_KEY = "promptlands.backlog-swipe.v1";

/** Fewer than two items and there is nothing to compare. */
export const MIN_ITEMS = 2;

/**
 * Below this, a gap is probably not a disagreement.
 *
 * Rank positions cascade. If one person moves a single item twenty places, every
 * item it passed shifts by one - so a strict reading of "show every non-zero
 * gap" fills the screen with the wake of a handful of real disagreements. Over
 * two real runs of the sample below, 22 of 23 shared items had a non-zero gap
 * and exactly one matched exactly, which reads as "we disagree about
 * everything" and is the opposite of the finding.
 *
 * So rows at or under this are still shown, still unscored and still never
 * merged - just folded behind one line the reader can open. Two places is right
 * for the twenty-to-forty item lists this is built for. It does not scale to a
 * list of two hundred, where the noise floor would be higher.
 */
export const SMALL_GAP = 2;

/* ------------------------------------------------------------------ shuffle */

/**
 * Fisher-Yates. `random` is injected so a test can be deterministic; the page
 * passes nothing and gets Math.random.
 *
 * @template T
 * @param {T[]} list
 * @param {() => number} [random]
 * @returns {T[]} a new array - the input is not touched
 */
export function shuffle(list, random = Math.random) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

/* -------------------------------------------------------------- the session */

/**
 * Start ranking a list of items.
 *
 * The first item needs no comparison - it is the whole order until something
 * arrives to compare it with - so the session opens with one item already
 * placed and the second one in play.
 *
 * @param {{id: string, title: string}[]} items
 * @param {{random?: () => number, who?: string}} [options]
 * @returns {object} plain JSON-able state. Hand it to JSON.stringify as-is.
 */
export function createSession(items, options = {}) {
  const random = options.random || Math.random;
  const clean = normaliseItems(items);
  if (clean.length < MIN_ITEMS) {
    throw new Error(`createSession needs at least ${MIN_ITEMS} items`);
  }

  return {
    version: FORMAT_VERSION,
    // Fixes the side-assignment for the whole session. Stored, so a reload does
    // not start flipping the cards around mid-question.
    seed: Math.floor(random() * 0x7fffffff),
    who: typeof options.who === "string" ? options.who : "",
    items: shuffle(clean, random),
    // Indices into `items`, most important first. Item 0 is placed for free.
    order: [0],
    // The live insertion range for the item being placed, as positions in
    // `order`: everything from `low` to `high` inclusive is still possible.
    low: 0,
    high: 1,
    // One entry per answer, enough to rewind it exactly. See undo().
    history: [],
  };
}

/** How many items are placed, and how many there are. Never comparisons. */
export function progress(state) {
  const placed = state.order.length;
  const total = state.items.length;
  return {
    placed,
    total,
    comparisons: state.history.length,
    // Where the item in play has got to. `steps` is how many comparisons this
    // placement needs in total; it genuinely varies - two for the third item,
    // five for the twentieth - so it is computed rather than assumed.
    itemSteps: comparisonsToPlace(placed),
    itemStep: comparisonsToPlace(placed) - comparisonsToPlace(state.high - state.low + 1),
  };
}

export function isComplete(state) {
  return state.order.length >= state.items.length;
}

/**
 * The next question, or null when there is nothing left to place.
 *
 * `left` and `right` are what to draw. Neither is marked as the new one, and
 * the page is not told which is which: it reports back the id of whichever card
 * the person picked, and answer() works out what that meant.
 *
 * @returns {null | {
 *   left: {id: string, title: string},
 *   right: {id: string, title: string},
 *   candidate: {id: string, title: string},
 *   reference: {id: string, title: string},
 *   referenceRank: number
 * }}
 */
export function nextComparison(state) {
  if (isComplete(state)) return null;

  const candidate = state.items[state.order.length];
  const mid = Math.floor((state.low + state.high) / 2);
  const reference = state.items[state.order[mid]];

  const candidateOnLeft = sideFor(state.seed, state.history.length);

  return {
    left: candidateOnLeft ? candidate : reference,
    right: candidateOnLeft ? reference : candidate,
    // For tests and for the page's own bookkeeping. Nothing drawn should use
    // these to tell the two cards apart.
    candidate,
    reference,
    referenceRank: mid + 1,
  };
}

/**
 * Record an answer: the id of the card the person picked as more important.
 *
 * Returns a NEW state. The old one is untouched, which is what makes undo a
 * matter of keeping a little history rather than of un-doing arithmetic.
 *
 * An id that is neither card on screen is ignored rather than thrown - a
 * double-tap that lands after the question changed should do nothing at all.
 */
export function answer(state, winnerId) {
  const question = nextComparison(state);
  if (!question) return state;

  const winner = String(winnerId);
  const candidateWon = winner === question.candidate.id;
  if (!candidateWon && winner !== question.reference.id) return state;

  const mid = Math.floor((state.low + state.high) / 2);
  // More important than the item at `mid` means it belongs somewhere above it,
  // so the range shrinks to everything up to that position. Less important and
  // it belongs below, so the range starts just after it.
  const low = candidateWon ? state.low : mid + 1;
  const high = candidateWon ? mid : state.high;

  const order = state.order.slice();
  const entry = { low: state.low, high: state.high, placedAt: -1 };

  let nextLow = low;
  let nextHigh = high;

  if (low === high) {
    // The range has closed: this is where the item goes.
    order.splice(low, 0, state.order.length);
    entry.placedAt = low;
    nextLow = 0;
    nextHigh = order.length;
  }

  return {
    ...state,
    order,
    low: nextLow,
    high: nextHigh,
    history: state.history.concat(entry),
  };
}

/**
 * Take back the last answer.
 *
 * Not in the specification, and it should be: about a hundred and twenty
 * comparisons at two seconds each makes a misclick close to certain, and a
 * wrong answer in a binary search does not announce itself - it silently puts
 * one item in the wrong place and every later comparison happily builds on it.
 */
export function undo(state) {
  if (state.history.length === 0) return state;

  const history = state.history.slice();
  const last = history.pop();
  const order = state.order.slice();

  // If that answer completed a placement, take the item back out first.
  if (last.placedAt >= 0) order.splice(last.placedAt, 1);

  return { ...state, order, low: last.low, high: last.high, history };
}

export function canUndo(state) {
  return state.history.length > 0;
}

/** The ranking so far, most important first. Complete or not. */
export function rankedItems(state) {
  return state.order.map((index) => state.items[index]);
}

/* ---------------------------------------------------------------- resuming */

/**
 * Read a saved session back.
 *
 * Follows the same rule as the game's own progress store: nothing in here
 * throws because of storage. A missing key, unparseable JSON, valid JSON of the
 * wrong shape and a half-written save all come back as null, which the page
 * treats as "no session to resume".
 *
 * @param {string|null} raw
 * @returns {object|null}
 */
export function restoreSession(raw) {
  if (typeof raw !== "string" || raw === "") return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  if (parsed.version !== FORMAT_VERSION) return null;
  if (!Array.isArray(parsed.items) || parsed.items.length < MIN_ITEMS) return null;
  if (!Array.isArray(parsed.order) || parsed.order.length === 0) return null;
  if (!Array.isArray(parsed.history)) return null;
  if (!Number.isInteger(parsed.low) || !Number.isInteger(parsed.high)) return null;
  if (!Number.isInteger(parsed.seed)) return null;

  const items = normaliseItems(parsed.items);
  if (items.length !== parsed.items.length) return null;

  // Every index in `order` has to point at a real item, exactly once. A save
  // that fails this would render as blank cards, which is worse than starting
  // over.
  const seen = new Set();
  for (const index of parsed.order) {
    if (!Number.isInteger(index) || index < 0 || index >= items.length) return null;
    if (seen.has(index)) return null;
    seen.add(index);
  }
  if (parsed.low < 0 || parsed.high > parsed.order.length || parsed.low > parsed.high) {
    return null;
  }

  return {
    version: FORMAT_VERSION,
    seed: parsed.seed,
    who: typeof parsed.who === "string" ? parsed.who : "",
    items,
    order: parsed.order.slice(),
    low: parsed.low,
    high: parsed.high,
    history: parsed.history
      .filter((h) => h && Number.isInteger(h.low) && Number.isInteger(h.high))
      .map((h) => ({
        low: h.low,
        high: h.high,
        placedAt: Number.isInteger(h.placedAt) ? h.placedAt : -1,
      })),
  };
}

/* ------------------------------------------------------------------- export */

/**
 * The file two people swap. This shape is an interface: somebody else's copy of
 * this tool has to be able to read it, so it is fixed, versioned, and written
 * down on the page itself.
 *
 * `items` is in ranked order, most important first.
 */
export function buildExport(state, who) {
  return {
    tool: TOOL_ID,
    version: FORMAT_VERSION,
    who: cleanName(who),
    items: rankedItems(state).map((item) => ({ id: item.id, title: item.title })),
  };
}

/** So that two of these in a Downloads folder tell apart. */
export function exportFilename(who) {
  const name = cleanName(who)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return name ? `backlog-swipe-${name}.json` : "backlog-swipe.json";
}

/**
 * Read a file somebody sent. Every refusal names what is wrong and what to do
 * about it, because this gets opened by people with no help available.
 *
 * @param {string} text
 * @returns {{ok: true, who: string, items: object[]} | {ok: false, message: string}}
 */
export function parseExport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      message:
        "That file is not readable as JSON. If it was downloaded from a chat or an " +
        "email it may have arrived incomplete - ask for it again.",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || parsed.tool !== TOOL_ID) {
    return {
      ok: false,
      message:
        "That file did not come from Backlog Swipe. It needs to be a .json file " +
        "exported from this page. If you meant to load a backlog, use the CSV option instead.",
    };
  }

  if (parsed.version !== FORMAT_VERSION) {
    return {
      ok: false,
      message:
        `This page understands version ${FORMAT_VERSION} and that file says version ` +
        `${describeVersion(parsed.version)}. Ask whoever sent it to export it again from this page.`,
    };
  }

  const items = Array.isArray(parsed.items) ? normaliseItems(parsed.items) : [];
  if (items.length < MIN_ITEMS) {
    return {
      ok: false,
      message:
        "That file is a Backlog Swipe export but there is nothing usable in it - " +
        "it needs at least two items, each with an id and a title.",
    };
  }
  if (hasDuplicateIds(items)) {
    return {
      ok: false,
      message:
        "That file lists the same id twice, so there is no way to tell those two " +
        "items apart. Ask whoever sent it to export it again.",
    };
  }

  return { ok: true, who: cleanName(parsed.who), items };
}

/* ---------------------------------------------------------------------- CSV */

/**
 * Two columns, `id` and `title`, with a header row.
 *
 * Forgiving about how the file was made - a byte-order mark from Excel, Windows
 * line endings, quoted fields containing commas or their own quotes, blank lines
 * and any number of columns you did not ask about are all fine. Strict about the
 * two columns it needs, and specific about which one is missing.
 *
 * @param {string} text
 * @returns {{ok: true, items: object[]} | {ok: false, message: string}}
 */
export function parseCsv(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { ok: false, message: "That file is empty." };
  }

  const rows = parseCsvRows(stripBom(text)).filter(
    (row) => row.some((cell) => cell.trim() !== "")
  );

  if (rows.length === 0) {
    return { ok: false, message: "That file is empty." };
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const idColumn = header.indexOf("id");
  const titleColumn = header.indexOf("title");

  if (idColumn === -1 || titleColumn === -1) {
    const missing =
      idColumn === -1 && titleColumn === -1
        ? "no id column and no title column"
        : idColumn === -1
          ? "no id column"
          : "no title column";
    const found = rows[0]
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "")
      .join(", ");
    return {
      ok: false,
      message:
        `That CSV has ${missing}. The first row needs to name the columns, and the ` +
        `two it looks for are id and title - anything else is ignored. It found: ` +
        `${found || "an empty first row"}.`,
    };
  }

  const items = [];
  for (const row of rows.slice(1)) {
    const id = (row[idColumn] || "").trim();
    const title = (row[titleColumn] || "").trim();
    // A row with neither is the blank line at the bottom of a spreadsheet
    // export. A row with one but not the other is a real gap, and skipping it
    // quietly is better than refusing the whole file over it.
    if (id === "" || title === "") continue;
    items.push({ id, title });
  }

  if (items.length < MIN_ITEMS) {
    return {
      ok: false,
      message:
        `That CSV has ${items.length === 1 ? "only one row" : "no rows"} with both an ` +
        `id and a title in it. There need to be at least ${MIN_ITEMS} to have anything to compare.`,
    };
  }
  if (hasDuplicateIds(items)) {
    return {
      ok: false,
      message:
        `That CSV uses the id "${firstDuplicateId(items)}" more than once. Every row ` +
        `needs its own id, or there is no way to line your ranking up against somebody else's.`,
    };
  }

  return { ok: true, items };
}

/**
 * A CSV reader, near enough to RFC 4180 for files people actually have.
 *
 * Quotes are the whole difficulty: inside them a comma is text, a newline is
 * text, and a doubled quote is one quote.
 */
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      // Dropping \r outside quotes is what makes a Windows file behave.
      field += char;
    }
  }

  row.push(field);
  rows.push(row);
  return rows;
}

/* ------------------------------------------------------- the disagreement */

/**
 * Where two people disagree, and nothing else.
 *
 * NO COMBINED SCORE AND NO MERGED LIST. Averaging two rankings produces an order
 * neither person believes and hides the only rows worth a conversation. The
 * station's own receipt says the hardest part is "not turning the disagreement
 * back into a single sorted list", which is a design constraint stated by the
 * product itself - so this returns the gaps, and something else can decide how
 * to draw them.
 *
 * @param {{who: string, items: object[]}} a
 * @param {{who: string, items: object[]}} b
 * @returns {{ok: true, ...} | {ok: false, message: string}}
 */
export function compareRankings(a, b) {
  const aPositions = positionsById(a.items);
  const bPositions = positionsById(b.items);

  const shared = [...aPositions.keys()].filter((id) => bPositions.has(id));

  if (shared.length === 0) {
    return {
      ok: false,
      message:
        `Those two rankings have no items in common - one has ${a.items.length} items ` +
        `and the other has ${b.items.length}, and none of the ids match. They were almost ` +
        `certainly exported from two different backlogs.`,
    };
  }

  const rows = shared.map((id) => {
    const aRank = aPositions.get(id);
    const bRank = bPositions.get(id);
    return {
      id,
      title: titleFor(a.items, id) || titleFor(b.items, id),
      aRank,
      bRank,
      gap: Math.abs(aRank - bRank),
    };
  });

  const disagreements = rows
    .filter((row) => row.gap > 0)
    // Biggest gap first. Ties settle on the higher of the two placings, so the
    // rows somebody actually cares about float up within a tie.
    .sort((x, y) => y.gap - x.gap || Math.min(x.aRank, x.bRank) - Math.min(y.aRank, y.bRank));

  return {
    ok: true,
    whoA: cleanName(a.who) || "The first person",
    whoB: cleanName(b.who) || "The second person",
    sharedCount: shared.length,
    disagreements,
    // A count, never a list. There is nothing to talk about in these rows, and
    // printing them would bury the ones there is.
    agreedCount: rows.length - disagreements.length,
    // Not disagreements - different inputs. Kept apart and never scored.
    onlyInA: a.items.filter((item) => !bPositions.has(item.id)),
    onlyInB: b.items.filter((item) => !aPositions.has(item.id)),
    // The scale the two sets of positions share, for drawing.
    span: Math.max(a.items.length, b.items.length),
  };
}

/* ----------------------------------------------------------------- workings */

/**
 * How many comparisons it takes to place one item into a list of `placed`.
 *
 * There are `placed + 1` positions it could go in, and each answer halves that,
 * so it is the number of halvings needed to get down to one.
 */
export function comparisonsToPlace(placed) {
  let positions = placed + 1;
  let steps = 0;
  while (positions > 1) {
    positions = Math.ceil(positions / 2);
    steps += 1;
  }
  return steps;
}

/** The worst case for a whole list, which is what "about four minutes" means. */
export function comparisonsForList(count) {
  let total = 0;
  for (let placed = 1; placed < count; placed += 1) total += comparisonsToPlace(placed);
  return total;
}

/**
 * Which side the item being placed goes on, for answer number `n`.
 *
 * A small integer hash rather than a random number, because it has to give the
 * same answer after a reload - otherwise refreshing mid-question swaps the two
 * cards over and the person answers the opposite of what they meant.
 */
function sideFor(seed, n) {
  let x = (seed ^ Math.imul(n + 1, 0x9e3779b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  return (((x ^ (x >>> 16)) >>> 0) & 1) === 0;
}

/** Ids as strings, titles trimmed, anything shapeless dropped. */
function normaliseItems(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const id = item.id === 0 || item.id ? String(item.id).trim() : "";
    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (id === "" || title === "") continue;
    out.push({ id, title });
  }
  return out;
}

function positionsById(items) {
  const map = new Map();
  items.forEach((item, index) => {
    if (!map.has(item.id)) map.set(item.id, index + 1);
  });
  return map;
}

function titleFor(items, id) {
  const found = items.find((item) => item.id === id);
  return found ? found.title : "";
}

function hasDuplicateIds(items) {
  return firstDuplicateId(items) !== null;
}

function firstDuplicateId(items) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) return item.id;
    seen.add(item.id);
  }
  return null;
}

function cleanName(who) {
  if (typeof who !== "string") return "";
  // One line, and short enough to sit in a heading next to somebody else's.
  return who.replace(/\s+/g, " ").trim().slice(0, 40);
}

function describeVersion(version) {
  if (typeof version === "number" && Number.isFinite(version)) return String(version);
  return "something this page does not recognise";
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/* ---------------------------------------------------------- sample backlog */

/**
 * Something to swipe when you have no file.
 *
 * Anybody who has to prepare a CSV before they can see what this does will
 * close the tab, so there has to be a way in that costs nothing. These are
 * invented: a generic software backlog that belongs to no organisation, with
 * no real ticket ids and nothing that describes anybody's actual work. Some of
 * the titles are deliberately too vague to judge in four seconds, because that
 * is the finding the tool gives you for free.
 */
export const SAMPLE_BACKLOG = [
  { id: "101", title: "Search returns results from deleted projects" },
  { id: "102", title: "Password reset email arrives up to an hour late" },
  { id: "103", title: "Add keyboard shortcuts to the main list view" },
  { id: "104", title: "Onboarding asks for a phone number before explaining why" },
  { id: "105", title: "Export to CSV drops the last row on large files" },
  { id: "106", title: "Dark mode: the settings page is still white" },
  { id: "107", title: "Bulk edit for tags" },
  { id: "108", title: "Session expires mid-form and loses what was typed" },
  { id: "109", title: "Mobile: the date picker is unusable below 360px" },
  { id: "110", title: "Weekly summary email has no unsubscribe link" },
  { id: "111", title: "Duplicate accounts when signing up with a different case email" },
  { id: "112", title: "Slow first load on the dashboard - six seconds on a cold cache" },
  { id: "113", title: "Let people rename a workspace" },
  { id: "114", title: "Audit log for permission changes" },
  { id: "115", title: "Screen reader skips the main navigation" },
  { id: "116", title: "Attachments over ten megabytes fail silently" },
  { id: "117", title: "Timezone shown in the activity feed is always UTC" },
  { id: "118", title: "Undo for archiving an item" },
  { id: "119", title: "Invite links never expire" },
  { id: "120", title: "Search has no way to filter by date" },
  { id: "121", title: "The empty state on a new workspace says nothing useful" },
  { id: "122", title: "Two-factor setup has no recovery codes" },
  { id: "123", title: "Printing a report cuts off the right-hand column" },
  { id: "124", title: "Sort order resets when you navigate back" },
];
