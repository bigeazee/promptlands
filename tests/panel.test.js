/**
 * WHAT THE PANEL PROMISES
 * =======================
 *
 * A station is a sketch or it is built, and the difference has to survive
 * contact with the panel:
 *
 *   sketch          "Nobody has built this one", and an ask
 *   built, links    the links
 *
 * Most of this map is sketches, and saying so plainly is the job. A panel that
 * implied an unbuilt idea was openable would be the one overstatement an
 * audience catches, and catching one is enough to stop them believing the rest.
 *
 * The third state this used to have is gone. "Built with nowhere to point" is
 * not a state any more: the validator refuses it, because somewhere to go and
 * look is the only evidence a content file can carry.
 *
 * Runs against tests/fake-dom.js, which is a tree builder and not a browser.
 * See the warning at the top of that file about what it will not tell you.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { byClass, installFakeDom } from "./fake-dom.js";

const BASE = {
  id: "example",
  zone: 3,
  flagship: false,
  title: "Example",
  problem: "A problem.",
  build: "A thing.",
  steps: ["One.", "Two.", "Three."],
  prompt: "Build me a thing.",
  status: "sketch",
  links: [],
};

/**
 * Open a station in a real panel built against the fake DOM, and hand back the
 * panel body so the test can read what came out.
 */
async function renderStation(overrides) {
  const dom = installFakeDom();
  try {
    // Imported inside the fake, because createPanel touches document as it runs.
    const { createPanel } = await import("../src/ui/panel.js");
    const root = dom.document.createElement("div");
    dom.body.append(root);
    createPanel(root).open({ ...BASE, ...overrides });
    return byClass(root, "panel-body")[0];
  } finally {
    dom.detach();
  }
}

/** The same, for a showcase: it takes a different open path. */
async function renderVia(method, content) {
  const dom = installFakeDom();
  try {
    const { createPanel } = await import("../src/ui/panel.js");
    const root = dom.document.createElement("div");
    dom.body.append(root);
    createPanel(root)[method](content);
    return byClass(root, "panel-body")[0];
  } finally {
    dom.detach();
  }
}

const SHOWCASE = {
  id: "example-showcase",
  zone: 1,
  title: "Example Showcase",
  what: "What it is.",
  happened: "What came of it.",
  links: [],
};

test("a sketch says nobody has built it, and asks somebody to", async () => {
  const body = await renderStation({ status: "sketch", links: [] });

  assert.match(body.textContent, /Nobody has built this one/);
  assert.match(body.textContent, /open a pull request/);
  assert.equal(byClass(body, "demo-links").length, 0, "and offers no link to open");
});

test("a sketch never implies the thing is waiting to be opened", async () => {
  const body = await renderStation({ status: "sketch", links: [] });

  assert.ok(
    !/coming soon/i.test(body.textContent),
    "an unbuilt idea must not promise something nobody has promised"
  );
});

test("a built station renders its links", async () => {
  const body = await renderStation({
    status: "built",
    links: [{ label: "The thing", href: "https://example.invalid/thing" }],
  });

  const items = byClass(body, "demo-links")[0].children;
  assert.equal(items.length, 1);
  assert.equal(items[0].children[0].href, "https://example.invalid/thing");
  assert.equal(items[0].textContent, "The thing");
  assert.ok(!/Nobody has built this one/.test(body.textContent));
});

test("a station with no prompt renders no copy box", async () => {
  const withPrompt = await renderStation({});
  assert.equal(byClass(withPrompt, "prompt-text").length, 1);

  const without = await renderStation({ prompt: undefined, steps: undefined });
  assert.equal(
    byClass(without, "prompt-text").length,
    0,
    "a sketch nobody wrote a prompt for shows an empty box to nobody"
  );
});

// ================================================================= showcases

test("a showcase says what it is and what happened, and asks nothing", async () => {
  const body = await renderVia("openShowcase", SHOWCASE);
  const text = body.textContent;

  assert.match(text, /What it is/);
  assert.match(text, /What happened/);
  assert.ok(!/Get started/.test(text), "a showcase has no steps and no starter prompt");
  assert.ok(!/What you.d build/.test(text), "a showcase is not a challenge");
});

test("a showcase is never labelled as unbuilt", async () => {
  const body = await renderVia("openShowcase", SHOWCASE);
  assert.ok(
    !/Nobody has built this one/.test(body.textContent),
    "a showcase is the one thing on the map that definitely was built"
  );
});

// ================================================== nothing carries a receipt

test("no panel renders a receipt any more", async () => {
  for (const body of [
    await renderStation({}),
    await renderStation({ status: "built", links: [{ label: "x", href: "https://e.invalid" }] }),
    await renderVia("openShowcase", SHOWCASE),
  ]) {
    assert.equal(byClass(body, "receipt").length, 0);
    assert.equal(byClass(body, "receipt-note").length, 0);
    assert.ok(!/\(est\.\)/.test(body.textContent), "and nothing explains a marker that is gone");
  }
});

test("a receipt left on a station by an old edit is ignored, not rendered", async () => {
  const body = await renderStation({
    receipt: { buildTime: "An evening (est.)", tool: "Claude web" },
  });

  assert.equal(byClass(body, "receipt").length, 0);
  assert.ok(!/An evening/.test(body.textContent));
});

test("both open paths refuse an empty argument rather than rendering a blank", async () => {
  await assert.rejects(() => renderVia("open", null), /needs a station object/);
  await assert.rejects(() => renderVia("openShowcase", null), /needs a showcase object/);
});
