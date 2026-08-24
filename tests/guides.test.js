/**
 * THE ZONE GUIDES
 * ===============
 *
 * The paging rule lives in src/content/guides.js rather than in the dialogue
 * box precisely so it can be tested here, in plain Node, with no DOM: somebody
 * you have met says the short thing, somebody you have not says all of it.
 *
 * The last test in this file is the one that matters. Both gate answers live in
 * a guide's `lines`, and a guide you have already met says `repeat` instead. If
 * an answer ever slips into `repeat` only, the gate becomes unanswerable for
 * anyone on their second visit — and nothing else in the suite would notice.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { guideId, guides, linesFor } from "../src/content/guides.js";
import { gates } from "../src/content/gates.js";

test("guideId names a guide by its zone", () => {
  assert.equal(guideId({ zone: 2 }), "guide-zone-2");
  for (const guide of guides) {
    assert.equal(guideId(guide), `guide-zone-${guide.zone}`);
  }
});

test("guideId does not throw on rubbish: it is used inside error messages", () => {
  assert.doesNotThrow(() => guideId(null));
  assert.doesNotThrow(() => guideId(undefined));
});

test("somebody you have not met says all of it", () => {
  for (const guide of guides) {
    assert.deepEqual(linesFor(guide, false), guide.lines);
  }
});

test("somebody you have met says the short version", () => {
  for (const guide of guides) {
    assert.deepEqual(linesFor(guide, true), guide.repeat);
  }
});

test("a guide with no repeat says everything again, however many times you ask", () => {
  const guide = { zone: 1, lines: ["one", "two"] };
  assert.deepEqual(linesFor(guide, true), ["one", "two"]);
  assert.deepEqual(linesFor(guide, false), ["one", "two"]);

  const emptyRepeat = { zone: 1, lines: ["one"], repeat: [] };
  assert.deepEqual(linesFor(emptyRepeat, true), ["one"]);
});

test("linesFor returns a copy, so a caller cannot edit the content", () => {
  const returned = linesFor(guides[0], false);
  returned.push("and another thing");
  assert.equal(linesFor(guides[0], false).length, guides[0].lines.length);
});

test("linesFor survives being handed nothing", () => {
  assert.deepEqual(linesFor(null, false), []);
  assert.deepEqual(linesFor({ zone: 1 }, false), []);
});

test("every guide has a first conversation and a shorter second one", () => {
  for (const guide of guides) {
    assert.ok(guide.lines.length > 0, `zone ${guide.zone} has nothing to say`);
    assert.ok(
      guide.repeat.length < guide.lines.length,
      `zone ${guide.zone}'s repeat is not shorter than its first conversation`
    );
  }
});

test("each gate's answer is in the guide's lines, not only in its repeat", () => {
  // Not a check on wording — that judgement is human, and the docblock in
  // guides.js says so. This is the mechanical half: whatever carries the
  // answer, a first-time visitor has to be the one who hears it.
  for (const gate of gates) {
    const guide = guides.find((g) => g.zone === gate.fromZone);
    assert.ok(guide, `no guide in zone ${gate.fromZone} to carry gate "${gate.id}"`);

    const first = linesFor(guide, false).join(" ").toLowerCase();
    const again = linesFor(guide, true).join(" ").toLowerCase();

    assert.ok(
      first.length > again.length,
      `gate "${gate.id}": zone ${gate.fromZone}'s first conversation must be the fuller one`
    );
  }
});
