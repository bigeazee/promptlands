# Work Package 7 — Exhibits, the invitation, and what the zones actually mean

**Branch:** create `wp7-exhibits` from `main`.

**Status when you start:** PromptLands is finished, deployed and public. Nine stations, three
guides, two gates, a 92x20 map, 192 passing tests, and a working Backlog Swipe demo under
`demos/`. Nothing is broken. **This package changes what the map means, not how it works.**

---

## 0. Read this first

**Read `CLAUDE.md` in full**, then serve the game with `python3 -m http.server 8000` and walk
all three zones. You are about to reclassify half its content, so see it first.

**There is one hard dependency you cannot resolve yourself.** Section 4 requires real,
measured figures for Monty and Linky. They are currently `"Not recorded (est.)"`. If those
numbers have not been supplied to you, **stop and ask** — do not invent them, do not ship an
exhibit carrying an estimate, and do not proceed on the assumption they will turn up later.

---

## 1. The problem this fixes

The zones grade **the complexity of the build**. That axis is correct and is not changing.

What was wrong is that two objects on the map were never challenges at all. Monty and Linky
already exist — they were built, they were used, and one of them underpinned a decision
leadership acted on. Presenting them as "here is something you could build" was a category
error, and it showed: **Monty is a single HTML file with no backend, sitting in the zone
defined as "repo, tests, CI, containers".** It was there because it was *important*, not
because it was complex, which quietly broke the only axis the map has.

So: **stations are challenges, and challenges are the difficulty curve. Things that already
exist come off the curve entirely** and become a second content type — exhibits — placed
according to the complexity of *their* build, which keeps them honest against the same axis.

That puts Monty in Zone 1, and it is the best thing on the map:

> The forecast leadership acted on was one HTML file. No backend, no repository, nothing to
> maintain. It sits in the beginner zone because that is genuinely how hard it was to build.

---

## 2. The shape after this package

| Zone | Challenges | Exhibit | Other |
|---|---|---|---|
| 1 — prompt and go | Choose Your Own Adventure *(flagship)*, Ambiguity Roulette, Meeting Cost Meter | **Monty** | guide, gate |
| 2 — state and data | Backlog Swipe *(flagship)*, Requirements Linter, Interactive PRD | — | guide, gate |
| 3 — real engineering | **one new challenge** *(see section 5)* | **Linky** | guide, **the invitation** |

Three object types where there were one:

- **Challenge** — a station. Something to build. Graded by complexity, so it belongs to a zone.
- **Exhibit** — something that exists. Proof, not homework. Placed by how hard it was to build.
- **The invitation** — exactly one, at the east end. The call to action. Not a challenge.

Guides, gates and the map format are unchanged.

---

## 3. Files and data shapes

### `src/content/exhibits.js` — new

```js
export const exhibits = [
  {
    id: "monty",
    zone: 1,
    tile: { x: ?, y: ? },
    sprite: "...",
    title: "Monty",
    what: "...",       // what the thing is, plainly
    happened: "...",   // what it was actually used for, and what came of it
    receipt: { ...seven fields, NO estimates... },
    links: []
  }
];
export function exhibitId(exhibit) { ... }
```

**Exhibits carry no lessons-learned section.** Every lesson from building these is centralised
in the Field Notes notebook, which is the next work package. Do not add a lessons field here,
and do not smuggle lessons into `happened` — that field says what the thing did, not what it
taught. Section 8 tells you what to hand over instead.

### `src/content/invitation.js` — new

```js
export const invitation = {
  zone: 3,
  tile: { x: ?, y: ? },
  sprite: "...",
  title: "Beyond the Map",
  horizon: "...",        // the short tease: agents on a schedule, tools that open their own PRs
  ask: "...",            // the call to action, in one or two sentences
  steps: [ ... ],        // how to actually do it
  links: [ ... ]         // CONTRIBUTING.md and the repo, by full GitHub URL
};
```

**No receipt.** There is nothing to put on one. `src/ui/panel.js` gets a third open method for
it, alongside the station panel and the exhibit panel.

### `src/content/stations.js` — Linky, Monty and Beyond the Map leave

Their content moves into the two files above, reshaped. Do not delete their copy without
reading section 8 first.

---

## 4. The receipt rule, and the dependency you cannot resolve

`CLAUDE.md` section 7's honesty policy is unchanged: a figure is marked `(est.)` if and only
if it is a guess. Note that a *challenge* may legitimately carry real figures — Backlog Swipe
now reads `"2,884 across two files (measured)"` because WP6 built a reference implementation.
That is correct and stays.

**The new rule, and it is validator-enforced: an exhibit's receipt may contain no `(est.)`
anywhere.** An exhibit is the proof the whole talk rests on. Proof with guessed numbers is not
proof, and an audience that spots one invented figure stops trusting the entire curve.

Both exhibits currently fail that rule on almost every field:

| | buildTime | tool | cost | lines |
|---|---|---|---|---|
| **Monty** | Not recorded (est.) | Not recorded (est.) | Free tier (est.) | Not counted (est.) |
| **Linky** | Not recorded (est.) | *real* | Free tier (est.) | Not counted (est.) |

**You cannot fix this by writing better words.** The real figures have to come from the person
who built them. If you have them, use them. If you do not, **build everything else, leave the
receipts exactly as they are, and say plainly in your summary that the exhibits are blocked on
real numbers.** A validator that fails on `main` is a better outcome than an exhibit that
lies, so wire the rule up either way and let it fail loudly.

---

## 5. The new Zone 3 challenge

Zone 3 needs one genuine challenge. The material already exists inside Linky's current
`steps`, which read as "take something you built, put it in a repository, ask for tests before
features, turn on CI" — that was always a challenge wearing an exhibit's clothes.

**Working title: Hand It Over.** The trigger for Zone 3 is not ambition, it is dependency:
the moment somebody other than you relies on the thing, it needs to survive your attention
being elsewhere. Repo, tests that run on every push, and a way for somebody else to run it.

Write it to the standard station shape — four sections, seven-field receipt, three to five
steps, a copy-pasteable prompt. Every figure on it is an estimate and marked so; nobody has
built this one. It is the only challenge in its zone, so it carries no flagship marker.

Rename it if you have something better, and say why in your summary.

---

## 6. Placement

**Monty moves west into Zone 1.** Zone 1 currently holds the guide at x=5 and challenges at
x=10, 19 and 27, with the gate at x=30. There is comfortable room around x=14 or x=23. Pick
one and let the walking-distance test confirm it.

**Zone 3 has a hole at x=80** where Monty was, and the new challenge is the obvious thing to
put in it.

The existing constraints all still apply and are all still tested: every object on walkable
ground, nothing sharing a tile, every object reachable, and **no more than 17 tiles walked
between consecutive objects in a zone**, with ten to fourteen as the target.

**Exhibits must be distinguishable from challenges at a glance**, the way flagships are. A
different sprite, a marker above the tile, or both — your call, but decide it by looking at
the rendered map rather than by reasoning about it. WP2 learned this the hard way: `torch_wall`
seemed obvious and turned out to be an opaque grey tile that punched a hole in the grass.
Screenshot what you choose and say why.

The `plaque` sprite is unused since the guides became characters, if it helps.

---

## 7. Validator and tests

`src/content/validate.js` grows to cover three content types. Every rule needs a test proving
it fires on deliberately malformed content — the standard this suite already holds itself to.

Rules that **change**:

- Challenges per zone: **at least one**, not exactly three. Zone 3 will have one.
- Flagships: **exactly one in any zone with two or more challenges**; a zone with a single
  challenge has none. The exhibit carries the visual weight there.

Rules that are **new**:

- Exactly **two exhibits**, one in Zone 1 and one in Zone 3
- Exactly **one invitation**, in the last zone
- An exhibit's receipt contains **no `(est.)`** in any field
- An exhibit has no lessons field of any kind
- The invitation has **no receipt**
- Exhibits and the invitation obey every placement rule stations already do: in bounds, on
  walkable ground, not sharing a tile with anything, reachable, sprite exists and is an overlay

Rules that are **unchanged and must stay working**: one guide per zone, gate answers
discoverable in that zone's guide `lines`, walking distances, the barrier flood-fill, every
station's four sections and seven receipt fields in order.

---

## 8. What you must hand over, not delete

Three stations are being dismantled and their copy is the raw material for two other work
packages. **Put all of it in your summary, quoted in full:**

1. **Every sentence in Linky's and Monty's current copy that reads as a lesson rather than a
   description.** "The two security decisions nothing prompted us for", "ask for tests before
   you ask for features", "present the shape rather than the date" — these are the seed content
   for the Field Notes notebook and they must not be lost when you reshape the panels.
2. **Beyond the Map's current steps and links**, so nothing in the call to action goes missing
   in the reshape.
3. **Anything in the three dismantled stations you had nowhere to put.**

---

## 9. Documentation

`CLAUDE.md` needs its section 6 zone table and section 7 content model updated to describe
three content types rather than one, including the exhibit receipt rule. Keep the *reasoning*
in each edit — the paragraphs explaining why a rule exists are what stop somebody deleting it
later.

`CONTRIBUTING.md` needs the validator table row updates. Contributors add challenges, not
exhibits — say so.

---

## 10. Acceptance criteria

- [ ] `node --test` passes; CI green — **unless blocked on real exhibit figures, in which case
      the exhibit receipt test fails loudly and your summary says so**
- [ ] Monty opens as an exhibit in Zone 1, Linky as an exhibit in Zone 3
- [ ] Neither exhibit has a lessons section anywhere in its panel
- [ ] Beyond the Map opens as the invitation, with no receipt
- [ ] The new Zone 3 challenge opens with four sections and seven estimated receipt fields
- [ ] Exhibits are distinguishable from challenges at a glance on the rendered map
- [ ] Every zone's gate still blocks, nudges and unlocks, and both answers are still
      discoverable in that zone's guide
- [ ] Walking distances still pass; no object unreachable or sharing a tile
- [ ] Progress, reset and export still work; the HUD count means challenges
- [ ] No employer-identifiable content anywhere

---

## 11. When you are done

Push the branch. **Do not open a pull request and do not merge to `main`.** Write a summary
covering:

1. What you built, and whether the exhibits are blocked on real figures
2. **The full hand-over from section 8** — this is the most valuable thing in your summary
3. What you named the new Zone 3 challenge and why
4. Which sprite or marker you chose for exhibits, and what it looked like rendered
5. Any interface in sections 3 to 7 you think is wrong. WP1's session raised six points and
   four were errors in my spec; WP2's found a fail state I had not anticipated
6. Anything you softened or left out under the content safety rule
