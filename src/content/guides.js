/**
 * THE ZONE GUIDES
 * ===============
 *
 * One person standing near the entrance to each zone. Walk up, press E, and
 * they tell you what this part of the map is and what level of effort it
 * represents, a line at a time.
 *
 * THESE ARE NOT DECORATION. The gate at the end of a zone asks a question whose
 * answer has to be findable in that zone, so that somebody playing this alone -
 * with nobody narrating over the top of it - can answer honestly instead of
 * guessing. The stations carry most of that, but a station is about one idea.
 * The guide is the only place a zone gets to state its own point, and BOTH GATE
 * ANSWERS LIVE IN A GUIDE'S `lines`. If you rewrite one of these, re-read
 * src/content/gates.js and check the answer is still there.
 *
 * `lines` is what a first-time visitor hears, one dialogue box per entry.
 * `repeat` is the shorter thing they say once you have already spoken to them -
 * so coming back is a reminder, not the whole speech again. THE GATE ANSWER
 * MUST BE IN `lines`, never only in `repeat`.
 *
 * A guide is not a station. There are no sections, no steps, no prompt and NO
 * RECEIPT - there is nothing to put on one, and a receipt with invented figures
 * on it is the fastest way to lose an audience.
 *
 * Guides are solid, like stations: you stand next to one, never on it. They do
 * not count towards the visited-stations total, which is stations only.
 *
 * Keep each line under about 140 characters. One box holds one thought, and the
 * content validation test rejects anything longer rather than letting it
 * overflow the box on the day.
 *
 * This file is published on the open internet. See CLAUDE.md section 1.
 */

export const guides = [
  {
    zone: 1,
    tile: { x: 5, y: 8 },
    // Warm brown against Zone 1's green grass.
    sprite: "npc_villager",
    name: "Wren",
    lines: [
      "Oh — a new face! Welcome to the west end. Everything out here is one conversation and one page you can send somebody a link to.",
      "Nothing to install. Nothing to look after. I described what I wanted and I had the thing by the end of an evening.",
      "Here is the part that surprised me. The AI answering me out here is the same one they use in the far east of the map.",
      "So what changes as you walk east is not the AI. It is the discipline you wrap around it.",
    ],
    repeat: [
      "Same AI all the way east. What changes is the discipline you wrap around it.",
    ],
  },

  {
    zone: 2,
    tile: { x: 34, y: 8 },
    // Warm, and it sits on grass rather than against the buildings.
    sprite: "npc_ranger",
    name: "Bram",
    lines: [
      "Past the gate, then. Good. The tools out here remember things.",
      "They hold on to what you did between clicks. Take a CSV or a JSON file in, hand you one back.",
      "That is what makes them useful to somebody who is not you.",
      "Writing them still takes minutes, mind. That is not where the evening goes.",
      "Your evening goes on deciding what the thing should do, and then checking that what came back actually does it.",
      "That shift is the whole of this level. Ask anyone east of here — nearly all of their effort goes on reviewing, testing and deciding.",
    ],
    repeat: [
      "Minutes to write. The evening goes on deciding what it should do, and checking that it does.",
    ],
  },

  {
    zone: 3,
    tile: { x: 65, y: 8 },
    // Cool grey on warm decking: the strongest contrast available in Zone 3.
    sprite: "npc_knight",
    name: "Sable",
    lines: [
      "Far enough east that it gets serious. Everything here lives in a repository.",
      "Tests run on every push. There is an image anybody can pull and a release you could put a date against.",
      "None of that is optional, once other people depend on the thing.",
      "The AI still writes most of the code. I want to be straight with you about that.",
      "But the judgement about what is safe to ship is still mine. Nothing ever prompts you for it.",
    ],
    repeat: [
      "The AI writes the code. Deciding what is safe to ship is still yours, and nothing prompts you for it.",
    ],
  },
];

/**
 * A stable identifier for a guide.
 *
 * Guides are identified by zone rather than by an `id` field: there is exactly
 * one per zone, so the zone already is the identity, and an id would be a
 * second thing to keep unique for no gain. Error messages, the collision layer
 * and the record of who you have met all need something to call them, and this
 * is it.
 *
 * @param {{zone: number}} guide
 * @returns {string}
 */
export function guideId(guide) {
  return `guide-zone-${guide && guide.zone}`;
}

/**
 * The lines to show this time.
 *
 * Pure, and exported separately from the dialogue box so the rule can be tested
 * in plain Node with no DOM: somebody you have met says the short thing, and
 * somebody you have not says all of it. A guide with no `repeat` always says
 * everything, which is the safe default - the gate answer is in `lines`.
 *
 * @param {{lines: string[], repeat?: string[]}} guide
 * @param {boolean} seen have they been spoken to before?
 * @returns {string[]}
 */
export function linesFor(guide, seen) {
  if (!guide) return [];
  if (seen && Array.isArray(guide.repeat) && guide.repeat.length > 0) {
    return guide.repeat.slice();
  }
  return Array.isArray(guide.lines) ? guide.lines.slice() : [];
}
