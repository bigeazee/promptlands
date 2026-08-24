# Work Package 5 — Rewriting the prose

**Branch:** create `wp5-prose` from `main`.

**Status when you start:** PromptLands is finished and deployed. Nine stations, three guides,
two gates, a 92x20 three-zone map, 155 passing tests, live on GitHub Pages. Nothing here is
broken. **This package changes words, not behaviour.**

---

## 0. Read this first

**Read `CLAUDE.md` in full.** Then serve the game with `python3 -m http.server 8000` and play
it: walk all three zones, talk to all three guides, open all nine stations. Read the prose on
screen, in the panel, at the size an audience sees it — not in your editor. Length reads
completely differently in a 66-character panel over a video call than it does in a code file.

**The editorial direction is not in this brief.** You will be told separately what the rewrite
is aiming for — shorter, warmer, funnier, more concrete, or something else. **If you have not
been told, ask before you write anything.** Do not invent a direction: this is somebody's
talk, and "different" is not the same as "better".

What this brief gives you instead is the map, the fence and the tripwires: where the prose is,
what is structure rather than prose, and the rules a rewrite can break without anybody
noticing until it is in front of an audience.

---

## 1. Scope

**In scope — two files, nothing else:**

- `src/content/guides.js`
- `src/content/stations.js`

**Explicitly NOT in scope:**

- `src/content/gates.js` — the two gate questions, their options and the nudge keep their
  current wording. Read them; do not edit them. See section 4.
- Any string baked into the interface: "The way ahead", "Not quite — the answer is somewhere
  in this zone", "Playable demo coming soon", the four section headings, the seven receipt
  labels. These live in `src/ui/`, not in content.
- The map, the sprites, the engine, the tests, the docs. If your diff touches a file outside
  the two named above, something has gone wrong.

---

## 2. The map — every field that is prose

About 5,440 words in total.

### `src/content/guides.js` — ~330 words

Three characters. For each: `name`, `lines[]` (what a first-time visitor hears, one dialogue
box per entry), `repeat[]` (the shorter thing they say once you have already met them).

| Zone | Name | Lines | Repeat |
|---|---|---|---|
| 1 | Wren | 4 | 1 |
| 2 | Bram | 6 | 1 |
| 3 | Sable | 5 | 1 |

The names are in scope. They are said out loud during the talk, so if one is awkward in the
mouth, change it — but change it everywhere, including `repeat`.

### `src/content/stations.js` — ~5,110 words

Nine stations. For each: `title`, `problem`, `build`, `steps[]`, `prompt`, and the seven
`receipt` values.

Word counts, so you can see where the weight sits:

| Zone | Station | Words |
|---|---|---|
| 1 | Choose Your Own Adventure *(flagship)* | ~513 |
| 1 | Ambiguity Roulette | ~421 |
| 1 | Meeting Cost Meter | ~395 |
| 2 | Backlog Swipe *(flagship)* | ~609 |
| 2 | Requirements Linter | ~567 |
| 2 | Interactive PRD | ~619 |
| 3 | Linky *(flagship)* | ~743 |
| 3 | Monty | ~578 |
| 3 | Beyond the Map | ~666 |

They are walked west to east in the order above, so they are also read in that order. Whatever
you do to the voice, do it consistently across the nine — the difficulty curve is the argument
of the talk, and it only reads if the only thing changing between zones is the content.

---

## 3. The fence — structure, not prose

Do not change any of these. They are not editorial:

`id`, `zone`, `tile`, `sprite`, `flagship`, `demo.type`, `links[].href`, and the guides'
`zone`, `tile` and `sprite`.

**The section headings are not in the content.** "The problem", "What you'd build", "Get
started" and "The receipt" are in `src/ui/panel.js`, as are the seven receipt labels ("Build
time", "Tool used", "Cost", "Lines of code", "Data touched", "Skill required", "Hardest
part"). If you think one should be reworded, **say so in your summary rather than editing
`src/ui/`** — that is a different package.

---

## 4. The tripwires

Four ways to break this that no reviewer will spot by reading your diff.

### 4.1 Both gate answers live inside specific guide lines

The gate at the end of each zone asks a question whose answer must be findable in that zone,
so somebody playing alone with nobody narrating can answer honestly rather than guessing. The
guides carry both answers, and they carry them in `lines` — never only in `repeat`, because a
returning player hears `repeat` and must not be the one who misses it.

| Gate | Correct answer | Currently carried by |
|---|---|---|
| `gate-1-2` | "The discipline you wrap around it" | `Wren.lines[3]` — *"So what changes as you walk east is not the AI. It is the discipline you wrap around it."* |
| `gate-2-3` | "Reviewing, testing and deciding" | `Bram.lines[5]` — *"That shift is the whole of this level. Ask anyone east of here — nearly all of their effort goes on reviewing, testing and deciding."* |

You may move where the answer sits and reword it entirely. What you may not do is lose it.
**Read `src/content/gates.js` after you have rewritten, and check both answers are still
there in `lines`.** The gate wording is fixed, so the guide has to meet it.

### 4.2 Receipt honesty

`CLAUDE.md` section 7 has the reasoning: an audience that spots one invented number stops
trusting the whole difficulty curve, and that curve is the entire argument of the talk.

Seven of the nine stations describe things nobody has built. Every figure on those is an
estimate and says so. **Linky and Monty are different and are the trap** — they exist, so their
receipts should carry real figures, but the real figures are not known yet, so they are marked
too:

- Linky — `buildTime: "Not recorded (est.)"`, `cost: "Free tier (est.)"`, `lines: "Not counted (est.)"`
- Monty — `buildTime`, `tool`, `cost` and `lines`, all `(est.)`

A rewrite must not quietly turn any of those into a claim. `src/ui/panel.js` prints a note
under the receipt whenever any field contains `(est.)`, so dropping the marker changes what
the panel asserts as well as what the field says.

Facts stated as facts, which you may reword but not contradict: Linky has 145 automated tests,
a multi-architecture container image, CI on every push and a weekly rebuild for CVEs; Monty is
a single file with no backend, no APIs and no stored data.

### 4.3 The starter prompts have a job

Each station's `prompt` is 110–215 words and is in scope. But it is not only read — somebody
copies it into Claude and expects the thing the station describes to come back. Rewriting for
voice must keep it working as a prompt.

**Try at least one.** Paste a rewritten prompt into Claude, see what you get, and say in your
summary which one you tried and whether it still produced the right thing.

### 4.4 Content safety

**The published site is public on the open internet.** Every piece of content must be generic
and non-attributable: no employer-internal process detail, system names, environment names or
team names; no real ticket or project keys; no internal URLs; no participant, patient or
genomic data of any kind, real or realistic-looking. Every example is invented or clearly
anonymised.

Two existing lines exist specifically to keep readers safe and should survive in some form:
Ambiguity Roulette tells the reader to use invented sentences and its receipt says "None. Use
invented sentences, never anything confidential"; Meeting Cost Meter says nobody's actual
salary belongs in it.

**If you are unsure whether something crosses the line, leave it out and flag it in your
summary.**

---

## 5. What the validator will reject

`node --test` runs a content validation suite. These are the limits it enforces, so you may as
well know them before you hit them:

- A guide dialogue line over **140 characters** — one box holds one thought
- A guide whose `repeat` is not shorter than its `lines`
- Fewer than **3** or more than **5** steps on a station
- A receipt with anything other than the seven fields, in order, none blank
- An empty `title`, `problem`, `build`, `prompt`, `name` or dialogue entry

None of these are style opinions; they are what the panel and the dialogue box can physically
hold, and what the game needs to stay honest.

---

## 6. Acceptance criteria

- [ ] `node --test` passes; CI green on the branch
- [ ] The diff touches `src/content/guides.js` and `src/content/stations.js` and nothing else
- [ ] All nine stations and all three guides read correctly in the running game, on screen
- [ ] Both gate answers are still discoverable in the `lines` of the guide in that zone
- [ ] Every estimated figure is still marked `(est.)`, and no estimate became a claim
- [ ] At least one rewritten starter prompt has been pasted into Claude and still works
- [ ] The nine stations read as one voice, and the three guides sound like three people
- [ ] No employer-identifiable content anywhere

---

## 7. When you are done

Push the branch. **Do not open a pull request and do not merge to `main`.** Write a summary
covering:

1. The editorial direction you were given, in your own words, so it is on the record
2. **Before-and-after word count per station and per guide** — the shape of the change should
   be visible at a glance
3. Which starter prompt you tried, and what came back
4. Anything you wanted to change but could not because it was out of scope — particularly the
   section headings or the gate wording, since those are the two most likely to feel wrong
   once the voice around them moves
5. Anything you left out or softened because of the content safety rule
6. Any place where you think the rewrite lost something the old wording was doing — you have
   read both versions more carefully than anyone else will
