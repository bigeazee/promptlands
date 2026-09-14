/**
 * THE CONTENT VALIDATION SUITE
 * ============================
 *
 * CLAUDE.md calls this the highest-value test in the repository, and it is: it
 * is the thing standing between somebody's first pull request and a broken live
 * site. Every other test here protects code. This one protects contributors.
 *
 * Every rule is tested twice, and the second half is the half that matters:
 *
 *   1. the real content satisfies it
 *   2. the rule FIRES on content that breaks it, with a message that says what
 *      to do about it
 *
 * A validator nobody has watched fail is not a validator. A rule with only the
 * first test passes just as happily when the check has been commented out.
 *
 * The messages are asserted, not just the count, because the message is the
 * whole product here. The person reading it has usually just hand-edited one
 * line of a file they have never opened before.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { MAX_WALK_TILES, RECEIPT_FIELDS, validateContent } from "../src/content/validate.js";
import { gates } from "../src/content/gates.js";
import { legend, mapDef } from "../src/content/map.js";
import { exhibits } from "../src/content/exhibits.js";
import { NOTE_CATEGORIES, notes } from "../src/content/notes.js";
import { guides } from "../src/content/guides.js";
import { invitation } from "../src/content/invitation.js";
import { stations } from "../src/content/stations.js";

/** The real content, deep-copied, with one thing broken in it. */
function brokenContent(mutate) {
  const bundle = structuredClone({ stations, gates, guides, exhibits, invitation, mapDef, legend });
  if (mutate) mutate(bundle);
  return validateContent(bundle);
}

/** Assert that some problem matches, and hand it back so it can be read. */
function fires(problems, pattern) {
  const hit = problems.filter((problem) => pattern.test(problem));
  assert.ok(
    hit.length > 0,
    `expected a problem matching ${pattern}\nbut got:\n  ${problems.join("\n  ") || "(none)"}`
  );
  return hit[0];
}

function station(bundle, id) {
  const found = bundle.stations.find((s) => s.id === id);
  assert.ok(found, `test fixture expected a station "${id}"`);
  return found;
}

/** Replace one character in one map row. */
function setTile(bundle, x, y, char) {
  const row = bundle.mapDef.rows[y];
  bundle.mapDef.rows[y] = row.slice(0, x) + char + row.slice(x + 1);
}

// ============================================================== the real thing

test("the real content is valid: no problems at all", () => {
  const problems = validateContent({ stations, gates, guides, exhibits, invitation, mapDef, legend });
  assert.deepEqual(
    problems,
    [],
    `the shipped content must validate cleanly:\n  ${problems.join("\n  ")}`
  );
});

test("validateContent collects every problem instead of stopping at the first", () => {
  const problems = brokenContent((bundle) => {
    bundle.stations[0].title = "";
    bundle.stations[1].receipt.cost = "";
    bundle.gates[0].options.forEach((option) => {
      option.correct = false;
    });
  });
  assert.ok(
    problems.length >= 3,
    `three mistakes should produce at least three messages, got:\n  ${problems.join("\n  ")}`
  );
});

test("validateContent never throws, whatever it is handed", () => {
  assert.doesNotThrow(() => validateContent());
  assert.doesNotThrow(() => validateContent({}));
  assert.doesNotThrow(() => validateContent({ stations: 7, gates: null, guides: "no" }));
  assert.ok(validateContent({}).length > 0, "and it still reports what is wrong");
});

// ================================================================ definitions

test("a station missing a required field fires, naming the station id", () => {
  for (const field of ["title", "sprite", "problem", "build", "prompt"]) {
    const problems = brokenContent((bundle) => {
      station(bundle, "requirements-linter")[field] = "";
    });
    const message = fires(problems, new RegExp(`Station "requirements-linter".*"${field}"`));
    assert.ok(!/row \d/.test(message), "a definition fault has no row and column");
  }
});

test("a station with no id at all still produces a usable message", () => {
  const problems = brokenContent((bundle) => {
    delete station(bundle, "requirements-linter").id;
  });
  fires(problems, /Station "\(no id\)" needs an id/);
});

test("a station with a zone outside 1-3 fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").zone = 4;
  });
  fires(problems, /Station "requirements-linter" has zone 4\. It must be one of 1, 2, 3\./);
});

test("two stations with the same id fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").id = "interactive-prd";
  });
  fires(problems, /two stations with the id "interactive-prd"/);
});

test("a zone with no stations at all fires, naming the zone", () => {
  // The rule used to be "exactly three". It is now "at least one": things that
  // already exist moved off the difficulty curve and became exhibits, so Zone 3
  // legitimately holds one challenge. What still has to hold is that no zone is
  // a corridor.
  const empty = brokenContent((bundle) => {
    bundle.stations = bundle.stations.filter((s) => s.zone !== 3);
  });
  fires(empty, /Zone 3 has 0 stations\. Every zone needs at least 1/);
});

test("flagships are required where there is something to be distinct from", () => {
  // Two in a multi-station zone is wrong.
  const two = brokenContent((bundle) => {
    station(bundle, "requirements-linter").flagship = true;
  });
  fires(two, /Zone 2 has 3 stations and 2 flagships .* but wants 1/);

  // None in a multi-station zone is wrong.
  const none = brokenContent((bundle) => {
    station(bundle, "backlog-swipe").flagship = false;
  });
  fires(none, /Zone 2 has 3 stations and 0 flagships \(none\), but wants 1/);

  // And one in a SINGLE-station zone is also wrong: a marker only means
  // anything when something nearby is unmarked.
  const lonely = brokenContent((bundle) => {
    station(bundle, "hand-it-over").flagship = true;
  });
  fires(lonely, /Zone 3 has 1 stations and 1 flagships .* but wants 0/);
});

test("a station with too few or too many steps fires", () => {
  const few = brokenContent((bundle) => {
    station(bundle, "requirements-linter").steps = ["only one"];
  });
  fires(few, /Station "requirements-linter" has 1 steps\. The house style is 3 to 5/);

  const many = brokenContent((bundle) => {
    station(bundle, "requirements-linter").steps = ["a", "b", "c", "d", "e", "f"];
  });
  fires(many, /Station "requirements-linter" has 6 steps/);
});

test("an empty step fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").steps[1] = "   ";
  });
  fires(problems, /Station "requirements-linter" has an empty step/);
});

// -------------------------------------------------------------- the receipt

test("every real receipt has all seven fields, in CLAUDE.md's order", () => {
  for (const item of stations) {
    assert.deepEqual(
      Object.keys(item.receipt),
      RECEIPT_FIELDS,
      `station "${item.id}" must carry the seven receipt fields in order`
    );
  }
});

test("a receipt missing a field fires, listing the seven", () => {
  const problems = brokenContent((bundle) => {
    delete station(bundle, "requirements-linter").receipt.cost;
  });
  const message = fires(problems, /Station "requirements-linter" has receipt fields/);
  assert.match(message, /never add an eighth/);
  assert.match(message, /buildTime, tool, cost, lines, dataTouched, skill, hardestPart/);
});

test("a receipt with an eighth field fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").receipt.testsWritten = "145";
  });
  fires(problems, /Station "requirements-linter" has receipt fields \[.*testsWritten\]/);
});

test("a receipt with the fields in the wrong order fires", () => {
  const problems = brokenContent((bundle) => {
    const receipt = station(bundle, "requirements-linter").receipt;
    const reordered = { tool: receipt.tool, buildTime: receipt.buildTime };
    for (const field of RECEIPT_FIELDS) {
      if (field !== "tool" && field !== "buildTime") reordered[field] = receipt[field];
    }
    station(bundle, "requirements-linter").receipt = reordered;
  });
  fires(problems, /Station "requirements-linter" has receipt fields \[tool, buildTime/);
});

test("a blank receipt field fires, and says what to write instead of guessing", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").receipt.lines = "";
  });
  const message = fires(problems, /Station "requirements-linter" has an empty receipt field "lines"/);
  assert.match(message, /never guess a number/);
});

// ------------------------------------------------------------------- demos

test("an unknown demo type fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").demo = { type: "interpretive-dance" };
  });
  fires(problems, /Station "requirements-linter" needs demo: \{ type \} where type is one of/);
});

test('demo.type "embedded" fires, because it is not implemented', () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").demo = { type: "embedded" };
  });
  fires(problems, /Station "requirements-linter" has demo\.type "embedded", which is not implemented/);
});

test('demo.type "external" with no links is legal: it is the honest state', () => {
  // A thing that has been built but has nowhere public to point at. The panel
  // says "No demo linked for this one yet", which is true; "placeholder" would
  // say "Playable demo coming soon", which would be a promise nobody has made.
  const problems = brokenContent((bundle) => {
    station(bundle, "interactive-prd").links = [];
  });
  assert.deepEqual(
    problems.filter((problem) => /"interactive-prd".*(demo|link)/.test(problem)),
    [],
    "external with no links must not be reported as a problem"
  );
});

test("a link with no href fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "interactive-prd").links = [{ label: "somewhere" }];
  });
  fires(problems, /Station "interactive-prd" has a link with no href/);
});

// ------------------------------------------------------------------ sprites

test("an unknown station sprite fires, and says where sprite names come from", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").sprite = "space_hopper";
  });
  const message = fires(problems, /Station "requirements-linter" uses sprite "space_hopper"/);
  assert.match(message, /src\/content\/sprites\.js/);
});

test("an unknown gate sprite fires, for both the locked and unlocked sprite", () => {
  const locked = brokenContent((bundle) => {
    bundle.gates[0].sprite = "portcullis";
  });
  fires(locked, /Gate "gate-1-2" uses sprite "portcullis"/);

  const unlocked = brokenContent((bundle) => {
    bundle.gates[0].spriteUnlocked = "portcullis";
  });
  fires(unlocked, /Gate "gate-1-2" uses spriteUnlocked "portcullis"/);
});

test("an unknown guide sprite fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[0].sprite = "billboard";
  });
  fires(problems, /The guide for zone 1 uses sprite "billboard"/);
});

test("an unknown sprite in the map legend fires, naming the legend character", () => {
  const problems = brokenContent((bundle) => {
    bundle.legend["."] = { terrain: "astroturf" };
  });
  const message = fires(problems, /legend entry "\."/);
  assert.match(message, /astroturf/);
  assert.ok(!/row \d/.test(message), "a legend fault names the character, not a row");
});

// ------------------------------------------------------------------- gates

test("a gate with no correct option fires, saying nobody could pass it", () => {
  const problems = brokenContent((bundle) => {
    bundle.gates[0].options.forEach((option) => {
      option.correct = false;
    });
  });
  fires(problems, /Gate "gate-1-2" has 0 correct options.*nobody could ever pass it/s);
});

test("a gate with two correct options fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.gates[0].options[0].correct = true;
  });
  fires(problems, /Gate "gate-1-2" has 2 correct options.*any of them would open the door/s);
});

test("a gate with fewer than three options fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.gates[0].options = bundle.gates[0].options.slice(0, 2);
  });
  fires(problems, /Gate "gate-1-2" needs at least three options/);
});

test("a gate missing its question or its nudge fires", () => {
  for (const field of ["question", "nudge"]) {
    const problems = brokenContent((bundle) => {
      bundle.gates[1][field] = "";
    });
    fires(problems, new RegExp(`Gate "gate-2-3" needs a non-empty "${field}"`));
  }
});

test("two gates with the same id fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.gates[1].id = bundle.gates[0].id;
  });
  fires(problems, /two gates with the id "gate-1-2"/);
});

// ------------------------------------------------------------------ guides

test("a zone without exactly one guide fires, naming the zone", () => {
  const none = brokenContent((bundle) => {
    bundle.guides = bundle.guides.filter((guide) => guide.zone !== 2);
  });
  fires(none, /Zone 2 has 0 guides\. Every zone has exactly one/);

  const two = brokenContent((bundle) => {
    const extra = structuredClone(bundle.guides[0]);
    extra.zone = 3;
    extra.tile = { x: 66, y: 8 };
    bundle.guides.push(extra);
  });
  fires(two, /Zone 3 has 2 guides/);
});

test("a guide missing a field fires, naming the zone it belongs to", () => {
  for (const field of ["name", "sprite"]) {
    const problems = brokenContent((bundle) => {
      bundle.guides[1][field] = "";
    });
    const message = fires(problems, new RegExp(`The guide for zone 2 needs a non-empty "${field}"`));
    assert.ok(!/row \d/.test(message), "a definition fault has no row and column");
  }
});

test("a guide with no lines fires: a guide with nothing to say is not a guide", () => {
  const missing = brokenContent((bundle) => {
    delete bundle.guides[0].lines;
  });
  fires(missing, /The guide for zone 1 needs "lines"/);

  const empty = brokenContent((bundle) => {
    bundle.guides[0].lines = [];
  });
  fires(empty, /The guide for zone 1 has an empty "lines"/);

  const notArray = brokenContent((bundle) => {
    bundle.guides[0].lines = "just the one thing";
  });
  fires(notArray, /The guide for zone 1 has "lines" that is not an array/);
});

test("an empty dialogue box fires, naming which one", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[2].lines[1] = "   ";
  });
  fires(problems, /The guide for zone 3 has an empty entry at lines\[1\]/);
});

test("a dialogue line too long for the box fires, giving its length", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[1].lines[0] = "x".repeat(200);
  });
  const message = fires(problems, /The guide for zone 2 has lines\[0\] at 200 characters/);
  assert.match(message, /Split it into two entries/);
});

test("repeat is optional, but the same shape when it is there", () => {
  const withoutRepeat = brokenContent((bundle) => {
    delete bundle.guides[0].repeat;
  });
  assert.ok(
    !withoutRepeat.some((p) => /"repeat"/.test(p)),
    "a guide with no repeat is legal: they simply say everything again"
  );

  const badRepeat = brokenContent((bundle) => {
    bundle.guides[0].repeat = ["y".repeat(200)];
  });
  fires(badRepeat, /The guide for zone 1 has repeat\[0\] at 200 characters/);
});

test("an opaque sprite fires: a guide drawn as a terrain tile is a hole in the ground", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[0].sprite = "grass";
  });
  const message = fires(problems, /The guide for zone 1 uses sprite "grass", which is an opaque/);
  assert.match(message, /npc_/);
});

test("a guide with a receipt fires: a guide is not a station", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[0].receipt = { buildTime: "an afternoon" };
  });
  fires(problems, /The guide for zone 1 has a receipt\. A guide is not a station/);
});

test("a guide in a zone that does not exist fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.guides[0].zone = 9;
  });
  fires(problems, /A guide has zone 9\. It must be one of 1, 2, 3\./);
});

// ============================================================== placement

test("a station off the edge of the map fires, giving the map size", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "requirements-linter").tile = { x: 400, y: 3 };
  });
  fires(problems, /The station "requirements-linter" is at tile \(400, 3\), off a map that is 92x20 tiles\./);
});

test("a station on a solid map tile fires, and says how to fix it", () => {
  const problems = brokenContent((bundle) => {
    // (0, 10) is the treeline down the western edge of zone 1.
    station(bundle, "cyoa").tile = { x: 0, y: 10 };
  });
  const message = fires(problems, /The station "cyoa" is at tile \(0, 10\), which is a solid tile/);
  assert.match(message, /walkable ground/);
  assert.match(message, /src\/content\/map\.js/);
});

test("two things on the same tile fires - the case zones.js deliberately misses", () => {
  const stationOnGate = brokenContent((bundle) => {
    station(bundle, "meeting-cost-meter").tile = { ...bundle.gates[0].tile };
  });
  fires(
    stationOnGate,
    /The gate "gate-1-2" and the station "meeting-cost-meter" are both on tile \(30, 10\)/
  );

  const guideOnStation = brokenContent((bundle) => {
    bundle.guides[0].tile = { ...station(bundle, "cyoa").tile };
  });
  fires(
    guideOnStation,
    /The guide "guide-zone-1" and the station "cyoa" are both on tile \(10, 8\)/
  );
});

test("a station walled in on all four sides fires: nobody could ever open it", () => {
  const problems = brokenContent((bundle) => {
    // Trees on all four neighbours of the zone 1 flagship.
    setTile(bundle, 9, 8, "T");
    setTile(bundle, 11, 8, "T");
    setTile(bundle, 10, 7, "T");
    setTile(bundle, 10, 9, "T");
  });
  fires(problems, /The station "cyoa" at tile \(10, 8\) is walled in on all four sides/);
});

// ========================================================= the map, as walked

test("a hole in a barrier column fires: that is a whole zone skipped", () => {
  const problems = brokenContent((bundle) => {
    // One walkable tile in the wall between zone 1 and zone 2, with open
    // ground on both sides of it.
    setTile(bundle, 30, 12, ".");
  });
  const message = fires(problems, /With zones 1 unlocked, the player can reach zones 1, 2/);
  assert.match(message, /barrier column/);
});

test("a hole in the second barrier fires too, and names the zones reached", () => {
  const problems = brokenContent((bundle) => {
    setTile(bundle, 61, 12, "%");
  });
  fires(problems, /With zones 1, 2 unlocked, the player can reach zones 1, 2, 3/);
});

test("an unreachable station fires, even with every gate open", () => {
  const problems = brokenContent((bundle) => {
    // Two floor tiles sealed inside the zone 3 brick. The station has somewhere
    // to be stood next to, so this is a reachability fault and nothing else.
    setTile(bundle, 64, 4, "_");
    setTile(bundle, 64, 5, "_");
    station(bundle, "interactive-prd").tile = { x: 64, y: 5 };
  });
  fires(
    problems,
    /The station "interactive-prd" at tile \(64, 5\) cannot be walked to from the spawn even with every gate open/
  );
});

test("stations too far apart fires, and reports the distance it measured", () => {
  const problems = brokenContent((bundle) => {
    // Up into the trees at the top of zone 1, well off the lane.
    station(bundle, "ambiguity-roulette").tile = { x: 15, y: 2 };
  });
  const message = fires(problems, /follow one another in zone 1 but are \d+ tiles apart on foot/);
  assert.match(message, /"cyoa"/);
  assert.match(message, /"ambiguity-roulette"/);
  assert.match(message, new RegExp(`over the limit of ${MAX_WALK_TILES}`));
  assert.match(message, /seconds of walking/);
});

test("walking distance is measured on foot, not as the crow flies", () => {
  // (10, 8) to (15, 2) is eleven tiles in a straight line, comfortably inside
  // the limit. On foot, round the trees and back down to the lane, it is not.
  // Straight-line distance would wave this through.
  const problems = brokenContent((bundle) => {
    station(bundle, "ambiguity-roulette").tile = { x: 15, y: 2 };
  });
  const message = fires(problems, /are \d+ tiles apart on foot/);
  const measured = Number(message.match(/are (\d+) tiles apart on foot/)[1]);
  const straightLine = Math.abs(15 - 10) + Math.abs(2 - 8);

  assert.ok(straightLine <= MAX_WALK_TILES, "the straight line is inside the limit");
  assert.ok(
    measured > straightLine,
    `on foot (${measured}) has to be further than the straight line (${straightLine})`
  );
});

// ================================================== map faults, and their scope

test("a ragged map row is reported by row, not by station", () => {
  const problems = brokenContent((bundle) => {
    bundle.mapDef.rows[4] = bundle.mapDef.rows[4].slice(0, -1);
  });
  fires(problems, /map row 4 has 91 characters but row 0 has 92/);
});

test("a map character with no legend entry names the row, the column and the character", () => {
  const problems = brokenContent((bundle) => {
    setTile(bundle, 12, 6, "Z");
  });
  fires(problems, /map row 6, column 12 \(tile x=12, y=6\): character "Z" has no entry in the legend/);
});

test("an overlay sprite used as a terrain tile is rejected, naming the character", () => {
  const problems = brokenContent((bundle) => {
    bundle.legend["."] = { terrain: "chest" };
  });
  fires(problems, /legend entry "\.".*is an overlay sprite and cannot be used as a terrain tile/s);
});

test("a spawn on a solid tile is reported with the legend character", () => {
  const problems = brokenContent((bundle) => {
    bundle.mapDef.spawn = { x: 0, y: 0 };
  });
  fires(problems, /spawn \(0, 0\) is on a solid tile/);
});

// ================================================================== exhibits
//
// An exhibit is proof rather than homework, and the rules below are what stop it
// quietly becoming either a station or a fiction.

test("the exhibits are what the map says they are", () => {
  assert.ok(exhibits.length > 0, "there has to be at least one thing that actually exists");
  for (const exhibit of exhibits) {
    assert.deepEqual(
      Object.keys(exhibit.receipt),
      RECEIPT_FIELDS,
      `exhibit "${exhibit.id}" must carry the seven receipt fields in order`
    );
  }
});

test("an exhibit with an estimate on its receipt fires: evidence does not guess", () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits[0].receipt.lines = "~900 (est.)";
  });
  const message = fires(problems, /The exhibit "monty" has estimates on its receipt \(lines\)/);
  assert.match(message, /evidence with guessed numbers is not evidence/);
  assert.match(message, /Not recorded/);
});

test('"Not recorded" is legal on an exhibit: it is a fact, not an estimate', () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits[0].receipt.buildTime = "Not recorded";
  });
  assert.ok(
    !problems.some((p) => /estimates on its receipt/.test(p)),
    "saying nobody wrote it down is not the same as guessing what it would have been"
  );
});

test("an exhibit carrying lessons fires: lessons are centralised", () => {
  for (const field of ["lessons", "lesson", "learned", "lessonsLearned"]) {
    const problems = brokenContent((bundle) => {
      bundle.exhibits[0][field] = ["something I learned"];
    });
    const message = fires(problems, new RegExp(`The exhibit "monty" has a "${field}" field`));
    assert.match(message, /src\/content\/notes\.js/);
  }
});

test("an exhibit missing a required field fires, naming the exhibit", () => {
  for (const field of ["title", "what", "happened", "sprite"]) {
    const problems = brokenContent((bundle) => {
      bundle.exhibits[1][field] = "";
    });
    fires(problems, new RegExp(`The exhibit "linky" needs a non-empty "${field}"`));
  }
});

test("an exhibit drawn with an opaque sprite fires", () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits[0].sprite = "grass";
  });
  fires(problems, /The exhibit "monty" uses sprite "grass", which is an opaque terrain tile/);
});

test("a map with no exhibits fires: an argument needs evidence in it", () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits = [];
  });
  fires(problems, /There are no exhibits/);
});

test("an exhibit standing on a station fires, like any other collision", () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits[0].tile = { ...station(bundle, "cyoa").tile };
  });
  fires(problems, /both on tile/);
});

// =============================================================== the invitation

test("the invitation has no receipt, and adding one fires", () => {
  assert.equal(invitation.receipt, undefined, "the shipped invitation must not carry one");

  const problems = brokenContent((bundle) => {
    bundle.invitation.receipt = { buildTime: "an evening" };
  });
  const message = fires(problems, /The invitation has a receipt/);
  assert.match(message, /whose whole job is to be believed/);
});

test("a missing invitation fires: the game would end by running out of map", () => {
  const problems = brokenContent((bundle) => {
    bundle.invitation = null;
  });
  fires(problems, /There is no invitation/);
});

test("an invitation missing a required field fires", () => {
  for (const field of ["title", "horizon", "ask", "prompt"]) {
    const problems = brokenContent((bundle) => {
      bundle.invitation[field] = "";
    });
    fires(problems, new RegExp(`The invitation needs a non-empty "${field}"`));
  }
});

test("the invitation obeys the same step and link rules as a station", () => {
  const few = brokenContent((bundle) => {
    bundle.invitation.steps = ["only one"];
  });
  fires(few, /The invitation has 1 steps\. The house style is 3 to 5/);

  const badLink = brokenContent((bundle) => {
    bundle.invitation.links = [{ label: "nowhere" }];
  });
  fires(badLink, /The invitation has a link with no href/);
});

test("the invitation is placed and reachable like everything else", () => {
  const offMap = brokenContent((bundle) => {
    bundle.invitation.tile = { x: 999, y: 999 };
  });
  fires(offMap, /invitation.*\(999, 999\)/);
});

// =============================================================== field notes

test("the shipped field notes are all well formed and in a real category", () => {
  assert.ok(notes.length >= 10, "a reference with fewer than ten entries is a list");
  for (const note of notes) {
    assert.ok(NOTE_CATEGORIES.includes(note.category), `"${note.id}" is in a listed category`);
  }
});

test("a note in an unlisted category fires: the notebook would never show it", () => {
  const original = notes[0].category;
  notes[0].category = "Miscellaneous";
  try {
    const problems = brokenContent();
    const message = fires(problems, /The field note ".*" has category "Miscellaneous"/);
    assert.match(message, /written but never shown/);
  } finally {
    notes[0].category = original;
  }
});

test("a note missing a required field fires, naming the note", () => {
  for (const field of ["title", "body"]) {
    const original = notes[0][field];
    notes[0][field] = "";
    try {
      fires(brokenContent(), new RegExp(`The field note ".*" needs a non-empty "${field}"`));
    } finally {
      notes[0][field] = original;
    }
  }
});

test("a see-also pointing at a note that does not exist fires, naming both", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "cyoa").notes = ["write-it-first", "a-note-nobody-wrote"];
  });
  const message = fires(problems, /"cyoa" cross-references a field note "a-note-nobody-wrote"/);
  assert.match(message, /Check the spelling, or write the note/);
});

test("an exhibit's see-also is checked too, not just a station's", () => {
  const problems = brokenContent((bundle) => {
    bundle.exhibits[0].notes = ["not-a-real-note"];
  });
  fires(problems, /"monty" cross-references a field note "not-a-real-note"/);
});

test("notes is optional: leaving it out entirely is legal", () => {
  const problems = brokenContent((bundle) => {
    delete station(bundle, "cyoa").notes;
  });
  assert.ok(
    !problems.some((p) => /cross-references a field note/.test(p)),
    "a station that points at nothing is fine"
  );
});

test("a notes field that is not an array fires", () => {
  const problems = brokenContent((bundle) => {
    station(bundle, "cyoa").notes = "write-it-first";
  });
  fires(problems, /"cyoa" has a "notes" field that is not an array/);
});
