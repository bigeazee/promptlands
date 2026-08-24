# Work Package 6 — Backlog Swipe, as a linked demo

**Branch:** create `wp6-backlog-swipe` from `main`.

**Status when you start:** PromptLands is finished, deployed and public. Nine stations, three
guides, two gates, 155 passing tests. Backlog Swipe is the Zone 2 flagship station and it
currently shows a "playable demo coming soon" placeholder. **This package builds the thing
that placeholder has been promising.**

---

## 0. Read this first

**Read `CLAUDE.md` in full.** Its hard constraints apply to the demo exactly as they apply to
the game: no build step, no framework, no runtime dependencies, client-side only, no tracking,
no network calls of any kind, and the content safety rule.

Then serve the game with `python3 -m http.server 8000`, walk to Backlog Swipe in Zone 2, and
read the station panel. **That panel is your specification.** Its "Get started" section
contains a copy-pasteable prompt describing exactly this tool, because the station's whole
proposition is that a product manager could build it themselves in an evening. You are doing
the exercise the station sets. If what you build does not match what the station promises,
one of the two is wrong — say which, in your summary.

---

## 1. What this package delivers

A working Backlog Swipe at `demos/backlog-swipe/`, deployed with the site, linked from the
station panel. The station stops saying "coming soon" and starts pointing at a real thing.

**In scope:** the demo, its tests, the three non-prose fields on the Backlog Swipe station that
have to change, and one line in `CLAUDE.md`'s repository layout.

**Explicitly NOT in scope:**

- **Any prose on any station, including Backlog Swipe's.** A separate session is rewriting
  the station copy in parallel. Touching `problem`, `build`, `steps` or `prompt` will collide
  with it. See section 6 — you report what needs changing, you do not change it.
- The other mini-game (Choose Your Own Adventure). Different package.
- The game engine, the map, the guides, the gates.

---

## 2. Where it lives, and how it ships

```
demos/backlog-swipe/index.html    the page
demos/backlog-swipe/rank.js       the pure logic, an ES module
tests/backlog-swipe.test.js       node:test over rank.js
```

Deployed at **`https://bigeazee.github.io/promptlands/demos/backlog-swipe/`**.

**No deployment change is needed.** `.github/workflows/pages.yml` trims by exclusion —
`rm -rf docs tests .github CLAUDE.md package.json` — so a new `demos/` directory publishes
automatically. Do not edit that workflow. Do not add `demos/` to the trim list.

**Every path relative**, as everywhere else in this repo. The site is served from a subpath.

**Why two files rather than the one the station's prompt asks for.** The prompt tells a reader
to ask for "ONE self-contained HTML file", and that is the right instruction for somebody
building this in an evening. But binary insertion and the disagreement diff are easy to get
subtly wrong, and this repo's standard is that logic which can be pure and tested is pure and
tested. So the ranking and comparison logic goes in `rank.js` as an ES module that both the
page and `node:test` import. No build step, no bundler, no dependencies — open the folder and
it works. Note the discrepancy in your summary; the prose session may want to soften "one
file" to "no libraries, no build step".

---

## 3. The ranking mechanic — decided, and not the obvious reading

The station copy currently says "swipe thirty or forty times, in about four minutes". **That
is wrong and is being corrected.** One comparison per item cannot produce a ranking, and a
disagreement map built on a near-random order measures noise.

**Build binary insertion.** Each new item is binary-searched into the order established so
far: show it against the midpoint of the range still in play, and halve the range with each
answer. Roughly four to five comparisons per item, about 120 for a 30-item list, which really
is about four minutes at two seconds a comparison.

- **Progress is items placed, not comparisons made**: "item 12 of 30 placed". The reader needs
  to know how much is left, and comparisons-remaining is not knowable in advance.
- The comparison question is always the same two-way choice the station describes: this item
  against that one, with "more important" and "less important".
- Resume half-finished sessions from `localStorage`, under the key
  `promptlands.backlog-swipe.v1`. Namespace it; the game already owns `promptlands.v1` and
  the two must never read each other's data.

---

## 4. The export format — an interface, so own it

Two people export, then one of them loads both files. That only works if the format is stable,
so fix it now and write it down on the page.

```json
{
  "tool": "promptlands.backlog-swipe",
  "version": 1,
  "who": "Alex",
  "items": [
    { "id": "42", "title": "Search returns stale results" }
  ]
}
```

`items` is **in ranked order, most important first**. `who` is a name the person types before
exporting, so the comparison screen can say whose ranking is whose rather than "file 1" and
"file 2". Filename should include that name, so two files in a Downloads folder are telling
apart.

**On loading, refuse honestly.** A file that is not this tool's, a `version` you do not
recognise, malformed JSON, or two files with no items in common — each gets a plain sentence
saying what is wrong and what to do. This gets opened by people with no help available.

---

## 5. The disagreement map — the point of the whole thing

Read the station's `build` text before you write this. The argument is that a sorted list
hides the disagreement and this screen is the disagreement.

Given two loaded results:

- For every item present in **both**, compute each person's rank position and the gap between
  them.
- Show **only items where the gap is non-zero**, sorted **biggest gap first**.
- Show each row as: the title, where A put it, where B put it, and the size of the gap.
- Items present in **one file only** are listed separately, below, as a short note — they are
  not disagreements, they are different inputs.

**Do not compute a combined score. Do not produce a merged list. Do not resolve anything.**
The station's `hardestPart` receipt field says, in the game, right now: *"Not turning the
disagreement back into a single sorted list."* That is the design constraint, stated by the
product itself. A "suggested final order" button would undo the entire point.

---

## 6. What to change on the station — and what to leave alone

In `src/content/stations.js`, on `backlog-swipe` **only these three**:

```js
demo: { type: "external" },
links: [
  { label: "Open Backlog Swipe", href: "https://bigeazee.github.io/promptlands/demos/backlog-swipe/" }
],
```

...and the `receipt`. **This is the interesting part.**

Six of the nine stations describe things nobody has built, so every figure on them is marked
`(est.)`. Backlog Swipe has been one of them. **You are about to make it a thing that exists**,
which means its receipt can stop guessing:

- `lines` — count them. `wc -l` on what you shipped. This is a measurement now, not an estimate.
- `cost` — it uses no services, so this is knowable exactly.
- `buildTime` — **report what it actually took, but do not write the wording yourself.** A
  figure that describes how long an AI session took is not the same claim as how long a
  product manager's evening would take, and which of those the receipt should state is a
  judgement for the project owner. Put your measurement in your summary and leave the field
  as it is.

`CLAUDE.md` section 7 explains why this matters more than it looks: an audience that spots one
invented number stops trusting the whole difficulty curve, and that curve is the argument of
the talk. This is the first station where an estimate becomes a measurement. Get it right.

**Do not touch `title`, `problem`, `build`, `steps` or `prompt` on any station.** A parallel
session is rewriting all of that. Instead, **list in your summary every sentence in Backlog
Swipe's copy that your build has made untrue** — "thirty or forty times" is one; there will be
others. That list is how the two pieces of work get reconciled.

One more edit, and only this one: add `demos/` to the repository layout in `CLAUDE.md`
section 5, with a one-line description. Nothing else in that file.

---

## 7. Building it

**Input: keyboard, click and touch, all three.** Left and right arrow keys, two large buttons,
and real drag gestures on a touchscreen. The game itself is desktop-keyboard-only and says so;
this page is not, and a colleague should be able to open it on a phone on the train.

**It will mostly be used self-serve**, by somebody who opened a link after a talk with nobody
to explain it. So the page carries its own instructions: what to load, what the CSV needs to
look like, what to do with the export, and how the comparison works. Assume no narrator.

**Ship a built-in sample backlog** anyway, behind a "try it without a file" option. Somebody
who has to prepare a CSV before seeing anything will close the tab. Twenty to thirty invented
items, obviously fictional, generic enough to belong to no organisation — the content safety
rule covers sample data exactly as it covers station copy.

**CSV import** takes two columns, `id` and `title`, with a header row. Be forgiving: extra
columns, quoted fields containing commas, a byte-order mark, Windows line endings, and a file
somebody exported from a spreadsheet. Say something useful when it cannot be read.

**Legibility.** It may end up on a shared screen. Large type, high contrast, and one item
filling the view during a comparison. Match the game's palette — the tokens at the top of
`src/ui/ui.css` — so the two feel like one product.

---

## 8. Tests

`node --test` must pass, including the existing 155. `node:test` and `node:assert` only.

**`tests/backlog-swipe.test.js`** over the pure logic in `rank.js`:

- Binary insertion places an item correctly at the top, the bottom and the middle of an
  existing order
- A full run over a known set of answers produces the expected final order
- The number of comparisons for 30 items stays in the region of n log n, not n²
- Resuming a half-finished session continues from where it stopped
- The disagreement diff: identical rankings produce an empty map; a reversal produces every
  item, biggest gap first; items in one file only are separated out, not scored
- Malformed input — not our tool, unknown version, no overlapping items — is rejected with a
  message rather than throwing

CSV parsing is logic too. Test it against quoted commas, a BOM, CRLF endings and a missing
header.

---

## 9. Acceptance criteria

I verify these by running the code.

- [ ] `node --test` passes; CI green on the branch
- [ ] The demo works from `demos/backlog-swipe/index.html` over a local server
- [ ] A 30-item CSV can be ranked end to end in about four minutes of ordinary use
- [ ] Progress reads as items placed, and resuming a half-finished session works after a reload
- [ ] Two exported files load and produce a disagreement map, biggest gap first, with no
      merged list and no combined score anywhere on the screen
- [ ] Items present in only one file are shown separately from disagreements
- [ ] Arrow keys, buttons and touch drag all work
- [ ] The built-in sample gets somebody from opening the page to a ranking with no file
- [ ] A malformed CSV and a wrong JSON file both produce a readable explanation, never a
      blank screen or a console error
- [ ] The Backlog Swipe station panel links out and the link resolves
- [ ] `grep -rnE '(src|href)="/|from "/' demos/` finds nothing — every path relative
- [ ] No network calls of any kind: no fetch, no CDN, no font hosts, no analytics
- [ ] No package.json dependencies, no framework, no build step
- [ ] The sample backlog is invented and identifies no organisation

---

## 10. When you are done

Push the branch. **Do not open a pull request and do not merge to `main`.** Write a summary
covering:

1. What you built, and anything you could not get working
2. **The measured figures for the receipt** — line count, cost, and how long the build actually
   took — with the wording left for the project owner to decide
3. **Every sentence in Backlog Swipe's station copy that your build has made untrue**, quoted,
   so the prose rewrite can reconcile against it
4. The comparison count your binary insertion actually needs for 20, 30 and 40 items
5. Any interface in sections 3 to 5 you think is wrong. WP1's session raised six points and
   four were errors in my spec; WP2's found a fail state I had not anticipated. This is the
   most useful thing you will write
6. Anything about the sample data you softened or left out under the content safety rule
