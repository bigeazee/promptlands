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
 * guessing. The stations carry some of that, but a station is about one idea.
 * The guide is the only place a zone gets to state its own point, and BOTH GATE
 * ANSWERS LIVE IN A GUIDE'S `lines`. If you rewrite one of these, re-read
 * src/content/gates.js and check the answer is still there.
 *
 * Wren carries the most weight of the three. She is where somebody who has
 * never done any of this finds out how to start: pick a tool, say what you
 * want, ask it to build the thing. She also carries the one rule that matters
 * more than anything else on this map, which is what not to paste into a tool
 * nobody has approved. Gate 1 tests it, so nobody reaches Zone 2 without having
 * been told.
 *
 * `lines` is what a first-time visitor hears, one dialogue box per entry.
 * `repeat` is the shorter thing they say once you have already spoken to them -
 * so coming back is a reminder, not the whole speech again. THE GATE ANSWER
 * MUST BE IN `lines`, never only in `repeat`.
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
      "Oh, a new face. Welcome to the west end. Everything out here is one page you can send somebody a link to.",
      "Pick whichever AI you like. Claude Code, OpenAI Codex and Gemini Code Assist all do this sort of thing.",
      "For something this small a chat app will do. Nothing to install, nothing to look after afterwards.",
      "Describe what you want in plain words, then ask it to build the thing. That really is the whole method out here.",
      "One rule before you start, and it is the only one I will nag you about. Check which tools your employer has approved.",
      "Keep real company, customer or personal data out of anything that is not on that list. Make your examples up instead.",
      "Invented examples show off the tool just as well, and cost you nothing at all if you get one wrong.",
    ],
    repeat: [
      "Pick a tool, say what you want in plain words, and keep real data out of anything unapproved.",
    ],
  },

  {
    zone: 2,
    tile: { x: 34, y: 8 },
    // Warm, and it sits on grass rather than against the buildings.
    sprite: "npc_ranger",
    name: "Bram",
    lines: [
      "Through the gate, then. The tools out here remember things.",
      "They hold on to what you did between visits. Take a file in, hand you one back.",
      "That is what makes one useful to somebody who is not you.",
      "Writing them is still quick, mind. That is not where your evening goes.",
      "Your evening goes on deciding what the thing should do, then checking that what came back actually does it.",
      "Ask anyone further east and they will tell you the same. Nearly all of their effort goes on reviewing, testing and deciding.",
    ],
    repeat: [
      "Quick to write. The evening goes on reviewing, testing and deciding.",
    ],
  },

  {
    zone: 3,
    tile: { x: 65, y: 8 },
    // Cool grey on warm decking: the strongest contrast available in Zone 3.
    sprite: "npc_knight",
    name: "Sable",
    lines: [
      "Far enough east that other people depend on what you make. Everything here lives in a repository.",
      "Tests run on every push. There is an image anybody can pull and a version you can put a date against.",
      "None of that is optional once somebody else is relying on the thing.",
      "The AI still writes most of the code. I am not going to pretend otherwise.",
      "Deciding what is safe to ship is still yours, though. Nothing will ever prompt you for it.",
    ],
    repeat: [
      "The AI writes the code. Deciding what is safe to ship is still yours.",
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
