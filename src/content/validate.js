/**
 * CONTENT VALIDATION
 * ==================
 *
 * THE HIGHEST-VALUE CODE IN THIS REPOSITORY. It is what stops somebody's pull
 * request breaking the live site.
 *
 * A station is one object in one file, added by somebody who may never have
 * written JavaScript. That is the whole point of the data model, and it only
 * works if a mistake is caught here, with a sentence that says what to fix,
 * rather than in front of an audience as a blank canvas.
 *
 * Two rules shape everything below.
 *
 * IT COLLECTS, IT NEVER THROWS. Somebody who has made three mistakes should see
 * three messages, not play whack-a-mole through three test runs. Even a map that
 * will not parse comes back as a string in the array rather than an exception.
 *
 * MESSAGES MATCH THEIR SCOPE - see CLAUDE.md section 9. A fault in the grid
 * names the row, the column and the offending character. A fault in a
 * definition has no row and column, so it names the key it belongs to: the
 * station id, the gate id, the legend character, or the guide's zone. Every
 * message is a complete sentence that could be read out over a shoulder.
 *
 * It lives in a module rather than in the test file so the test stays thin, and
 * so a later package can run it at boot if we ever want the game itself to
 * refuse to start on broken content.
 */

import { canEnter } from "../engine/collision.js";
import { MOVE_MS } from "../engine/player.js";
import { index, parseMap } from "../engine/tilemap.js";
import { lockGates, markSolid } from "../engine/zones.js";
import { isOverlay, spriteExists } from "./sprites.js";
import { FLAGSHIP_MARKER_SPRITE } from "./stations.js";
import { SHOWCASE_MARKER_SPRITE } from "./showcases.js";
import { NOTE_CATEGORIES, notes as SHIPPED_NOTES } from "./notes.js";
import { guideId } from "./guides.js";

/** The zone ids the game knows about. */
export const ZONE_IDS = [1, 2, 3];

/** Stations per zone, and flagships per zone. */
/**
 * The most characters one dialogue box holds comfortably at the sizes in
 * ui.css. Past this a line overflows the box on the day rather than in review,
 * so the validator refuses it instead.
 */
const MAX_DIALOGUE_LINE = 140;

/**
 * Zones used to hold exactly three stations each. They no longer do, and the
 * reason is worth writing down.
 *
 * Stations are CHALLENGES, and the zones grade how complex a challenge is to
 * build. Things that already exist came off that curve and became showcases, so
 * Zone 3 legitimately holds one challenge where it used to hold three - and
 * padding it back to three with invented homework would be worse than the
 * asymmetry. What still has to hold is that no zone is empty of things to do.
 */
const MIN_STATIONS_PER_ZONE = 1;

/**
 * A flagship is the one talked through live, which only means anything when
 * there is something for it to be distinct FROM. A zone with a single challenge
 * has no flagship and should not fake one.
 */
const FLAGSHIPS_PER_ZONE = 1;
const FLAGSHIP_NEEDED_FROM = 2;

/**
 * Word ceilings on the copy a player reads.
 *
 * Generous on purpose: these are not the house style, they are the point where
 * a panel stops being readable on a shared screen while somebody talks over it.
 * The house style is half of each, and it lives in CLAUDE.md.
 *
 * This rule exists because the first version of this game reached six hundred
 * words a station without anybody deciding to do that. Prose grows a sentence
 * at a time and no reviewer sees the total, so the total is checked here.
 */
const MAX_WORDS = {
  problem: 60,
  build: 140,
  prompt: 250,
  what: 220,
  happened: 220,
  body: 90,
};

/** When a station carries steps at all, this is how many. */
const MIN_STEPS = 3;
const MAX_STEPS = 5;

/**
 * Whether the thing a station describes exists yet.
 *
 * Two states, not three. "built" is a claim about the world, so it has to be
 * backed by a link somebody can open; "sketch" is the honest default and most
 * of the map sits in it.
 */
const STATUSES = ["sketch", "built"];

/**
 * The furthest two stations that follow one another may be, in tiles walked.
 *
 * At MOVE_MS per tile this is about three seconds, which is the point where
 * narrating a walk in front of an audience turns into dead air. CLAUDE.md
 * section 6 asks for two to three seconds between adjacent stations; this is the
 * hard ceiling, not the target.
 */
export const MAX_WALK_TILES = 17;

const NEIGHBOURS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

/**
 * @param {object} content
 * @param {object[]} content.stations
 * @param {object[]} content.gates
 * @param {object[]} content.guides
 * @param {object} content.mapDef
 * @param {object} content.legend
 * @returns {string[]} every problem found, each a complete actionable sentence.
 *   An empty array means the content is valid.
 */
export function validateContent({ stations, gates, guides, showcases, mapDef, legend } = {}) {
  const problems = [];

  const stationList = asArray(stations, "stations", problems);
  const gateList = asArray(gates, "gates", problems);
  const guideList = asArray(guides, "guides", problems);
  const showcaseList = asArray(showcases, "showcases", problems);
  // The notebook is the one content file nothing else can be handed in its
  // place: stations and showcases point AT it by id, so the validator resolves
  // those references against the shipped notes rather than a passed-in copy.
  const noteList = SHIPPED_NOTES;

  for (const station of stationList) checkStation(station, problems);
  for (const gate of gateList) checkGate(gate, problems);
  for (const guide of guideList) checkGuide(guide, problems);
  for (const showcase of showcaseList) checkShowcase(showcase, problems);
  for (const note of noteList) checkNote(note, problems);
  checkUniqueIds(noteList, "note", problems);
  for (const item of [...stationList, ...showcaseList]) checkNoteRefs(item, noteList, problems);

  checkUniqueIds(stationList, "station", problems);
  checkUniqueIds(gateList, "gate", problems);
  checkUniqueIds(showcaseList, "showcase", problems);
  checkZoneCounts(stationList, guideList, problems);

  if (showcaseList.length === 0) {
    problems.push(
      "There are no showcases. At least one thing on this map has to be something that was " +
        "actually built and used — the whole difficulty curve is an argument, and an argument " +
        "with no evidence in it is a pitch. See src/content/showcases.js."
    );
  }
  if (!spriteExists(SHOWCASE_MARKER_SPRITE)) {
    problems.push(
      `The showcase marker sprite "${SHOWCASE_MARKER_SPRITE}" is not a sprite name in ` +
        `src/content/sprites.js. Fix SHOWCASE_MARKER_SPRITE in src/content/showcases.js.`
    );
  }

  if (!spriteExists(FLAGSHIP_MARKER_SPRITE)) {
    problems.push(
      `The flagship marker sprite "${FLAGSHIP_MARKER_SPRITE}" is not a sprite name in ` +
        `src/content/sprites.js. Fix FLAGSHIP_MARKER_SPRITE in src/content/stations.js.`
    );
  }

  // The map is parsed last of the "definitions" work, because everything below
  // needs the grid and parseMap is the one part allowed to give up early.
  let grid = null;
  try {
    grid = parseMap(mapDef, legend);
  } catch (error) {
    // parseMap's messages already name the row, the column and the character,
    // which is the right scope for a grid fault. Pass it straight through.
    problems.push(error.message);
    return problems;
  }

  const placed = [
    ...stationList.map((s) => ({ kind: "station", id: idOf(s), item: s })),
    ...gateList.map((g) => ({ kind: "gate", id: idOf(g), item: g })),
    ...guideList.map((g) => ({ kind: "guide", id: guideId(g), item: g })),
    ...showcaseList.map((e) => ({ kind: "showcase", id: idOf(e), item: e })),
  ];

  const placementProblems = [];
  checkPlacement(grid, placed, placementProblems);
  problems.push(...placementProblems);

  // Walking the map means making station tiles solid and locking gates, and
  // both of those throw on a tile the placement pass has already reported. No
  // point saying it twice in two different voices.
  if (placementProblems.length === 0) {
    checkTheMapAsWalked(grid, stationList, gateList, guideList, showcaseList, problems);
  }

  return problems;
}

// ---------------------------------------------------------------- definitions

function asArray(value, name, problems) {
  if (Array.isArray(value)) return value;
  problems.push(`${name} must be an array. Check the export in src/content/${name}.js.`);
  return [];
}

function idOf(definition) {
  return definition && typeof definition.id === "string" && definition.id !== ""
    ? definition.id
    : "(no id)";
}

function checkStation(station, problems) {
  const id = idOf(station);
  const say = (text) => problems.push(`Station "${id}" ${text}`);

  if (!station || typeof station !== "object") {
    problems.push("Every entry in stations must be an object. See src/content/stations.js.");
    return;
  }
  if (id === "(no id)") {
    say('needs an id: a short lower-case name, unique across stations, like "backlog-swipe".');
  }

  for (const field of ["title", "sprite", "problem", "build"]) {
    if (!isFilledString(station[field])) {
      say(`needs a non-empty "${field}".`);
    }
  }
  // A prompt is optional: a sketch nobody has written one for is a normal,
  // honest station. An empty string is not - that is a field somebody meant
  // to fill in and forgot, which renders as an empty copy box.
  if (station.prompt !== undefined && !isFilledString(station.prompt)) {
    say('has an empty "prompt". Write one, or leave the field out altogether.');
  }
  checkZone(station.zone, say);
  checkTileShape(station.tile, say);

  if (typeof station.flagship !== "boolean") {
    say('needs flagship: true or flagship: false. One station per zone is the flagship.');
  }

  checkLength(station.problem, "problem", say);
  checkLength(station.build, "build", say);
  checkLength(station.prompt, "prompt", say);
  checkSteps(station.steps, say);
  checkStatus(station, say);
  checkLinks(station.links, say);

  if (isFilledString(station.sprite) && !spriteExists(station.sprite)) {
    say(
      `uses sprite "${station.sprite}", which is not a name in src/content/sprites.js. ` +
        `Add it to SPRITES there first, or pick one that already exists.`
    );
  }
}

/**
 * How long a piece of copy is allowed to run.
 *
 * Skipped when the field is absent, because several of them are optional. An
 * over-long field is reported with both numbers, so the person reading knows
 * how much to cut rather than being told to try again.
 */
function checkLength(text, field, say) {
  if (!isFilledString(text)) return;
  const max = MAX_WORDS[field];
  if (max === undefined) return;
  const words = text.trim().split(/\s+/).length;
  if (words > max) {
    say(
      `has a "${field}" of ${words} words, over the ${max} this game allows. It is read on a ` +
        `shared screen while somebody talks over it, so cut it to about ${Math.round(max / 2)}. ` +
        `Say the one thing and stop.`
    );
  }
}

/** Optional. A station with no steps is fine; a malformed one is not. */
function checkSteps(steps, say) {
  if (steps === undefined) return;
  if (!Array.isArray(steps)) {
    say(`has "steps" that is not an array. Leave it out, or give ${MIN_STEPS} to ${MAX_STEPS}.`);
    return;
  }
  if (steps.length < MIN_STEPS || steps.length > MAX_STEPS) {
    say(
      `has ${steps.length} steps. The house style is ${MIN_STEPS} to ${MAX_STEPS} — ` +
        `fewer and nobody can follow it, more and nobody reads it.`
    );
  }
  if (steps.some((step) => !isFilledString(step))) {
    say("has an empty step. Every step is a sentence somebody can actually do.");
  }
}

function checkLinks(links, say) {
  if (!Array.isArray(links)) {
    say('needs "links": an array. Use [] when there is nothing to link to.');
    return;
  }
  for (const link of links) {
    if (!link || !isFilledString(link.href)) {
      say("has a link with no href. Every link needs a full URL somebody can click.");
    }
  }
}

/**
 * The rule that keeps "built" meaning something.
 *
 * Saying a thing exists is a claim about the world, and the only evidence this
 * file can hold is somewhere to go and look. So a built station needs a link.
 * A sketch may carry links too - background reading, a similar tool somebody
 * else made - because a sketch claims nothing.
 */
function checkStatus(station, say) {
  if (!STATUSES.includes(station.status)) {
    say(
      `needs status: ${STATUSES.map((v) => `"${v}"`).join(" or ")}. Use "sketch" until ` +
        `somebody has actually built the thing, which is most of the time.`
    );
    return;
  }
  const links = Array.isArray(station.links) ? station.links : [];
  if (station.status === "built" && links.length === 0) {
    say(
      'is marked "built" but has no links. Somewhere to go and look is the only evidence this ' +
        'file can carry, so a station without one says "sketch" instead.'
    );
  }
}

function checkGate(gate, problems) {
  const id = idOf(gate);
  const say = (text) => problems.push(`Gate "${id}" ${text}`);

  if (!gate || typeof gate !== "object") {
    problems.push("Every entry in gates must be an object. See src/content/gates.js.");
    return;
  }
  if (id === "(no id)") say('needs an id, unique across gates, like "gate-1-2".');

  for (const field of ["question", "nudge", "sprite", "spriteUnlocked"]) {
    if (!isFilledString(gate[field])) say(`needs a non-empty "${field}".`);
  }
  checkZone(gate.fromZone, say, "fromZone");
  checkZone(gate.toZone, say, "toZone");
  checkTileShape(gate.tile, say);

  for (const field of ["sprite", "spriteUnlocked"]) {
    if (isFilledString(gate[field]) && !spriteExists(gate[field])) {
      say(`uses ${field} "${gate[field]}", which is not a name in src/content/sprites.js.`);
    }
  }

  if (!Array.isArray(gate.options) || gate.options.length < 3) {
    say("needs at least three options. One question, three or four answers, one of them right.");
    return;
  }
  if (gate.options.some((option) => !option || !isFilledString(option.text))) {
    say("has an option with no text.");
  }
  const correct = gate.options.filter((option) => option && option.correct === true).length;
  if (correct !== 1) {
    say(
      `has ${correct} correct options. A gate needs exactly one — ` +
        `${correct === 0 ? "nobody could ever pass it" : "any of them would open the door"}.`
    );
  }
}

function checkGuide(guide, problems) {
  // A guide has no id: there is exactly one per zone, so the zone IS the
  // identity, and that is what the message names. See src/content/guides.js.
  const say = (text) => problems.push(`The guide for zone ${guide && guide.zone} ${text}`);

  if (!guide || typeof guide !== "object") {
    problems.push("Every entry in guides must be an object. See src/content/guides.js.");
    return;
  }
  checkZone(guide.zone, (text) => problems.push(`A guide ${text}`));

  for (const field of ["name", "sprite"]) {
    if (!isFilledString(guide[field])) {
      say(`needs a non-empty "${field}".`);
    }
  }
  checkTileShape(guide.tile, say);
  checkDialogue(guide.lines, "lines", say, true);
  checkDialogue(guide.repeat, "repeat", say, false);

  if (isFilledString(guide.sprite)) {
    if (!spriteExists(guide.sprite)) {
      say(`uses sprite "${guide.sprite}", which is not a name in src/content/sprites.js.`);
    } else if (!isOverlay(guide.sprite)) {
      // An opaque sprite drawn as an entity paints a solid square of tile over
      // whatever it is standing on. A person has to have a transparent
      // background or they arrive as a hole in the ground.
      say(
        `uses sprite "${guide.sprite}", which is an opaque terrain tile rather than a ` +
          `character. Pick one with a transparent background — the npc_ sprites in ` +
          `src/content/sprites.js are the people.`
      );
    }
  }
}

/**
 * `lines` is what a first-time visitor hears and must exist. `repeat` is the
 * shorter thing said afterwards and is optional, but if it is there it has to
 * be the same shape.
 */
function checkDialogue(value, field, say, required) {
  if (value === undefined || value === null) {
    if (required) {
      say(`needs "${field}": an array of what they say, one entry per dialogue box.`);
    }
    return;
  }
  if (!Array.isArray(value)) {
    say(`has "${field}" that is not an array. One entry per dialogue box.`);
    return;
  }
  if (required && value.length === 0) {
    say(`has an empty "${field}". A guide with nothing to say is a guide nobody needs.`);
    return;
  }
  value.forEach((line, i) => {
    if (!isFilledString(line)) {
      say(`has an empty entry at ${field}[${i}]. Every dialogue box needs something in it.`);
      return;
    }
    if (line.length > MAX_DIALOGUE_LINE) {
      say(
        `has ${field}[${i}] at ${line.length} characters, over the ${MAX_DIALOGUE_LINE} a ` +
          `dialogue box holds. Split it into two entries — one box, one thought.`
      );
    }
  });
}

function checkNote(note, problems) {
  const say = (text) => problems.push(`The field note "${idOf(note)}" ${text}`);

  if (!note || typeof note !== "object") {
    problems.push("Every entry in notes must be an object. See src/content/notes.js.");
    return;
  }
  for (const field of ["id", "title", "body", "category"]) {
    if (!isFilledString(note[field])) {
      say(`needs a non-empty "${field}".`);
    }
  }
  checkLength(note.body, "body", say);
  if (isFilledString(note.category) && !NOTE_CATEGORIES.includes(note.category)) {
    say(
      `has category "${note.category}", which is not one of ${NOTE_CATEGORIES.join(", ")}. The ` +
        `notebook renders category by category, so a note in an unlisted one is written but ` +
        `never shown. Add the category to NOTE_CATEGORIES or move the note.`
    );
  }
}

/**
 * Every "see also" has to point at something.
 *
 * This is the rule worth having. A typo here renders a cross-reference to a note
 * that does not exist, which is exactly the kind of thing nobody notices until
 * somebody is reading the panel out loud.
 */
function checkNoteRefs(item, noteList, problems) {
  if (!item || item.notes === undefined) return;
  const label = `"${idOf(item)}"`;

  if (!Array.isArray(item.notes)) {
    problems.push(
      `${label} has a "notes" field that is not an array. It is a list of field note ids, or ` +
        `left out entirely.`
    );
    return;
  }
  for (const id of item.notes) {
    if (!noteList.some((note) => note && note.id === id)) {
      problems.push(
        `${label} cross-references a field note ${JSON.stringify(id)}, which does not exist in ` +
          `src/content/notes.js. Check the spelling, or write the note.`
      );
    }
  }
}

function checkShowcase(showcase, problems) {
  const say = (text) => problems.push(`The showcase "${idOf(showcase)}" ${text}`);

  if (!showcase || typeof showcase !== "object") {
    problems.push("Every entry in showcases must be an object. See src/content/showcases.js.");
    return;
  }
  checkZone(showcase.zone, (text) => problems.push(`A showcase ${text}`));

  for (const field of ["id", "title", "what", "happened", "sprite"]) {
    if (!isFilledString(showcase[field])) {
      say(`needs a non-empty "${field}".`);
    }
  }
  checkTileShape(showcase.tile, say);
  checkSpriteIsACharacterOrProp(showcase.sprite, say);
  checkLinks(showcase.links, say);
  checkLength(showcase.what, "what", say);
  checkLength(showcase.happened, "happened", say);

  // Lessons are centralised in src/content/notes.js, on purpose: what building a
  // thing taught is general, and stapling it to the one object that happened to
  // teach it is how nine stations ended up each teaching a bit of the same thing.
  for (const field of ["lessons", "lesson", "learned", "lessonsLearned"]) {
    if (showcase[field] !== undefined) {
      say(
        `has a "${field}" field. Lessons do not live on showcases — a showcase says what a ` +
          `thing is and what came of it. What building it taught goes in the Field Notes, in ` +
          `src/content/notes.js, where it applies to everything rather than to one object.`
      );
    }
  }
}

/** Anything drawn as an entity over terrain has to have transparency to draw over. */
function checkSpriteIsACharacterOrProp(sprite, say) {
  if (!isFilledString(sprite)) return;
  if (!spriteExists(sprite)) {
    say(`uses sprite "${sprite}", which is not a name in src/content/sprites.js.`);
  } else if (!isOverlay(sprite)) {
    say(
      `uses sprite "${sprite}", which is an opaque terrain tile. Drawn over the map it paints a ` +
        `solid square of ground where the object should be. Pick one with a transparent ` +
        `background.`
    );
  }
}

function checkZone(zone, say, field = "zone") {
  if (!ZONE_IDS.includes(zone)) {
    say(`has ${field} ${JSON.stringify(zone)}. It must be one of ${ZONE_IDS.join(", ")}.`);
  }
}

function checkTileShape(tile, say) {
  if (!tile || !Number.isInteger(tile.x) || !Number.isInteger(tile.y)) {
    say("needs tile: { x, y } with whole-number tile coordinates.");
  }
}

function checkUniqueIds(list, kind, problems) {
  const seen = new Set();
  for (const item of list) {
    const id = idOf(item);
    if (id === "(no id)") continue;
    if (seen.has(id)) {
      problems.push(
        `There are two ${kind}s with the id "${id}". Ids have to be unique — progress is saved ` +
          `against them, so a duplicate makes two things share one saved state.`
      );
    }
    seen.add(id);
  }
}

function checkZoneCounts(stationList, guideList, problems) {
  for (const zone of ZONE_IDS) {
    const inZone = stationList.filter((station) => station && station.zone === zone);
    if (inZone.length < MIN_STATIONS_PER_ZONE) {
      problems.push(
        `Zone ${zone} has ${inZone.length} stations. Every zone needs at least ` +
          `${MIN_STATIONS_PER_ZONE}: a zone with nothing to attempt is a corridor.`
      );
    }
    const flagships = inZone.filter((station) => station.flagship === true);
    const wants = inZone.length >= FLAGSHIP_NEEDED_FROM ? FLAGSHIPS_PER_ZONE : 0;
    if (flagships.length !== wants) {
      problems.push(
        `Zone ${zone} has ${inZone.length} stations and ${flagships.length} flagships (${
          flagships.map((s) => `"${idOf(s)}"`).join(", ") || "none"
        }), but wants ${wants}. A zone with two or more stations marks exactly one, because ` +
          `one per zone gets talked through live. A zone with a single station marks none — ` +
          `there is nothing for it to be distinct from.`
      );
    }
    const inZoneGuides = guideList.filter((guide) => guide && guide.zone === zone);
    if (inZoneGuides.length !== 1) {
      problems.push(
        `Zone ${zone} has ${inZoneGuides.length} guides. Every zone has exactly one, near its ` +
          `entrance — they are what makes that zone's gate answer findable without a narrator.`
      );
    }
  }
}

// ----------------------------------------------------------------- placement

function checkPlacement(grid, placed, problems) {
  const byTile = new Map();

  for (const { kind, id, item } of placed) {
    const tile = item && item.tile;
    if (!tile || !Number.isInteger(tile.x) || !Number.isInteger(tile.y)) continue; // already said

    if (tile.x < 0 || tile.y < 0 || tile.x >= grid.width || tile.y >= grid.height) {
      problems.push(
        `The ${kind} "${id}" is at tile (${tile.x}, ${tile.y}), off a map that is ` +
          `${grid.width}x${grid.height} tiles.`
      );
      continue;
    }

    if (grid.solid[index(grid.width, tile.x, tile.y)] === 1) {
      problems.push(
        `The ${kind} "${id}" is at tile (${tile.x}, ${tile.y}), which is a solid tile in the ` +
          `map — there is a "${whatIsThere(grid, tile.x, tile.y)}" on it. It has to sit on ` +
          `walkable ground: move it, or clear that tile in src/content/map.js.`
      );
      continue;
    }

    const key = `${tile.x},${tile.y}`;
    const already = byTile.get(key);
    if (already) {
      problems.push(
        `The ${kind} "${id}" and the ${already.kind} "${already.id}" are both on tile ` +
          `(${tile.x}, ${tile.y}). Two things cannot share a tile: whichever is found first is ` +
          `the only one you can ever open.`
      );
    } else {
      byTile.set(key, { kind, id });
    }

    if (kind === "station" || kind === "guide") {
      const open = NEIGHBOURS.some(([dx, dy]) => canEnter(grid, tile.x + dx, tile.y + dy));
      if (!open) {
        problems.push(
          `The ${kind} "${id}" at tile (${tile.x}, ${tile.y}) is walled in on all four sides, ` +
            `so nobody can ever stand next to it and open it.`
        );
      }
    }
  }
}

/**
 * What is standing on a tile, named the way the sprite contract names it.
 *
 * The parsed grid holds sprite names rather than legend characters, and the
 * sprite name is the more useful half anyway: "there is a tree_green on it" is
 * something you can go and find in the map, where "the character is t" still
 * needs looking up.
 */
function whatIsThere(grid, x, y) {
  const i = index(grid.width, x, y);
  return grid.overlay[i] || grid.terrain[i];
}

// --------------------------------------------------------- the map, as walked

function checkTheMapAsWalked(grid, stations, gates, guides, showcases, problems) {
  // One grid per unlock state, so no check leaves marks on another one.
  const build = (isZoneUnlocked) => {
    const g = copyOf(grid);
    markSolid(g, stations, "station");
    markSolid(g, guides, "guide");
    markSolid(g, showcases, "showcase");
    lockGates(g, gates, isZoneUnlocked);
    return g;
  };

  // --- the barrier proof: a locked zone must be provably unreachable
  // Read out of the map rather than hardcoded, so a fourth zone would be
  // covered by this the day somebody adds one.
  const zonesInMap = grid.zones.map((zone) => zone.id).sort((a, b) => a - b);
  for (let i = 0; i < zonesInMap.length; i++) {
    const open = new Set(zonesInMap.slice(0, i + 1));
    const g = build((zoneId) => open.has(zoneId));
    const reached = zonesReachable(g, reachableFrom(g, g.spawn));
    const expected = [...open].sort((a, b) => a - b);
    if (JSON.stringify(reached) !== JSON.stringify(expected)) {
      problems.push(
        `With zones ${expected.join(", ")} unlocked, the player can reach zones ` +
          `${reached.join(", ")}. A locked zone has to be provably unreachable: one walkable ` +
          `tile left in a barrier column lets somebody skip a whole zone's content, which is ` +
          `the one thing the gates exist to prevent. Check the barrier columns in ` +
          `src/content/map.js.`
      );
    }
  }

  // --- reachability: with everything open, everything must be walkable-to
  const openGrid = build(() => true);
  const reachable = reachableFrom(openGrid, openGrid.spawn);
  const everything = [
    ...stations.map((s) => ({ kind: "station", id: idOf(s), tile: s.tile })),
    ...gates.map((g) => ({ kind: "gate", id: idOf(g), tile: g.tile })),
    ...guides.map((g) => ({ kind: "guide", id: guideId(g), tile: g.tile })),
  ];
  for (const { kind, id, tile } of everything) {
    if (!tile) continue;
    const canStandBeside = NEIGHBOURS.some(([dx, dy]) =>
      reachable.has(`${tile.x + dx},${tile.y + dy}`)
    );
    if (!canStandBeside) {
      problems.push(
        `The ${kind} "${id}" at tile (${tile.x}, ${tile.y}) cannot be walked to from the spawn ` +
          `even with every gate open, so nobody will ever see it.`
      );
    }
  }

  // --- walking distance between stations that follow one another in a zone
  for (const zone of ZONE_IDS) {
    const route = stations
      .filter((station) => station && station.zone === zone && station.tile)
      .sort((a, b) => a.tile.x - b.tile.x || a.tile.y - b.tile.y);

    for (let i = 0; i + 1 < route.length; i++) {
      const from = route[i];
      const to = route[i + 1];
      const steps = walkingDistance(openGrid, from.tile, to.tile);
      if (steps === Infinity) {
        problems.push(
          `There is no walking route between station "${idOf(from)}" and station "${idOf(to)}", ` +
            `which follow one another in zone ${zone}.`
        );
      } else if (steps > MAX_WALK_TILES) {
        problems.push(
          `Station "${idOf(from)}" and station "${idOf(to)}" follow one another in zone ${zone} ` +
            `but are ${steps} tiles apart on foot, over the limit of ${MAX_WALK_TILES} ` +
            `(about ${(steps * MOVE_MS) / 1000} seconds of walking). The talk is narrated while ` +
            `moving, and dead air crossing empty scenery is how this format fails in front of ` +
            `an audience. Move them closer together in src/content/map.js.`
        );
      }
    }
  }
}

/**
 * A fresh grid with the same layers.
 *
 * Each unlock state gets its own copy, because markSolid and lockGates write
 * into the collision layer and the checks would otherwise see each other's
 * work.
 */
function copyOf(grid) {
  return {
    width: grid.width,
    height: grid.height,
    spawn: grid.spawn,
    terrain: grid.terrain,
    overlay: grid.overlay,
    solid: Uint8Array.from(grid.solid),
    zones: grid.zones,
    zoneAt: grid.zoneAt,
  };
}

/** Every tile reachable on foot from `start`, as a set of "x,y" keys. */
function reachableFrom(grid, start) {
  const seen = new Set([`${start.x},${start.y}`]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const { x, y } = queue[head];
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (seen.has(key) || !canEnter(grid, nx, ny)) continue;
      seen.add(key);
      queue.push({ x: nx, y: ny });
    }
  }
  return seen;
}

/** Which zone ids the player can actually set foot in. */
function zonesReachable(grid, reachable) {
  const zoneIds = new Set();
  for (const key of reachable) {
    const [x, y] = key.split(",").map(Number);
    const zoneId = grid.zoneAt(x, y);
    if (zoneId > 0) zoneIds.add(zoneId);
  }
  return [...zoneIds].sort((a, b) => a - b);
}

/**
 * Steps between two station tiles, measured the way a player walks it.
 *
 * Stations are solid, so nobody ever stands ON one: this is the distance from a
 * tile you can stand on beside the first to a tile you can stand on beside the
 * second, by breadth-first search over walkable tiles. Straight-line distance
 * would happily report six tiles for two stations either side of a wall.
 */
function walkingDistance(grid, fromTile, toTile) {
  const targets = new Set(
    NEIGHBOURS.map(([dx, dy]) => `${toTile.x + dx},${toTile.y + dy}`).filter((key) => {
      const [x, y] = key.split(",").map(Number);
      return canEnter(grid, x, y);
    })
  );
  if (targets.size === 0) return Infinity;

  const starts = NEIGHBOURS.map(([dx, dy]) => ({ x: fromTile.x + dx, y: fromTile.y + dy })).filter(
    (tile) => canEnter(grid, tile.x, tile.y)
  );
  if (starts.length === 0) return Infinity;

  const distance = new Map();
  const queue = [];
  for (const start of starts) {
    const key = `${start.x},${start.y}`;
    if (distance.has(key)) continue;
    distance.set(key, 0);
    queue.push(start);
  }

  for (let head = 0; head < queue.length; head++) {
    const { x, y } = queue[head];
    const here = distance.get(`${x},${y}`);
    if (targets.has(`${x},${y}`)) return here;
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (distance.has(key) || !canEnter(grid, nx, ny)) continue;
      distance.set(key, here + 1);
      queue.push({ x: nx, y: ny });
    }
  }
  return Infinity;
}

function isFilledString(value) {
  return typeof value === "string" && value.trim() !== "";
}
