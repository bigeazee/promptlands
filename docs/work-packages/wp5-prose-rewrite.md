# Work Package 5 — The challenges, the format, and the prose

**Branch:** create `wp5-prose` from `main`.

**Status when you start:** PromptLands is finished and deployed. Nine stations, three guides,
two gates, a 92x20 three-zone map, 155 passing tests, live on GitHub Pages. Nothing here is
broken. **This package changes what the stations ask people to do and how that reads — not
how the game works.**

---

## 0. Read this first

**Read `CLAUDE.md` in full.** Then serve the game with `python3 -m http.server 8000` and play
it: walk all three zones, talk to all three guides, open all nine stations. Read the prose on
screen, in the panel, at the size an audience sees it — not in your editor. Length reads
completely differently in a 66-character panel over a compressed video call than it does in a
code file, and that difference is most of the problem you have been asked to fix.

---

## 1. Two phases. Do not skip the first one.

### Phase 1 — review with the user, before you write anything

The user's judgement is that **the station panels carry too much that is not relevant**. Your
first job is not to rewrite. It is to work out with them what should be there at all.

Bring them three things and talk it through:

**a) What each station currently asks the reader to build.** Section 3 has the one-line
summary of all nine. For each, the question is whether that is the right challenge — whether
it is the thing a product manager would actually go and do, at that level of the curve.

**b) What is in a station panel that is not earning its place.** You will have read all nine
by then. Say which parts you think are padding, which are load-bearing, and where the
difference between zones has gone soft. You have read this more carefully than anyone; an
opinion is what is wanted, not a neutral summary.

**c) Whether the four-section format is right.** Every station is: the problem, what you'd
build, get started (three to five steps plus a copy-pasteable prompt), the receipt. That
shape is fixed in `CLAUDE.md` and enforced by the validator. It may be the wrong shape, or
the right shape with the wrong weighting.

**Come out of that conversation with an agreed direction, and write it down at the top of
your summary.** Do not start rewriting until you have one. "Different" is not "better", and
this is somebody's talk.

### Phase 2 — the rewrite

Everything below is about doing it without breaking things that are not obviously fragile.

---

## 2. Scope

**In scope by default — two files:**

- `src/content/guides.js`
- `src/content/stations.js`

**Out of scope by default:**

- `src/content/gates.js` — the two gate questions, their options and the nudge keep their
  current wording. Read them; do not edit them. See section 5.1.
- The map, the sprites, the engine, the deployment, the docs.

**If Phase 1 concludes the format should change, the scope widens — and that needs saying out
loud before you build it.** The four sections and the seven-field receipt are not just how
`stations.js` happens to be shaped. They are written into `CLAUDE.md` as hard rules, rendered
by `src/ui/panel.js`, and enforced by `src/content/validate.js` with tests behind it. Changing
the format therefore means changing:

- `CLAUDE.md` section 7 — the data model and the four-section rule
- `src/ui/panel.js` — the section headings and the receipt table
- `src/content/validate.js` and `tests/content.test.js` — the rules and their proofs
- every one of the nine stations, together, so none is left in the old shape

That is a contract change, not an edit. **Propose it, get explicit agreement, then build it.**
Do not let the format drift one station at a time.

---

## 3. What each station currently asks the reader to build

The spine of the Phase 1 conversation. Read in map order, west to east.

| Zone | Station | The challenge, as it stands |
|---|---|---|
| 1 | **Choose Your Own Adventure** *(flagship)* | A branching scenario as one web page, sent as a link, so you can see the different routes people take through a decision they all claim to agree on |
| 1 | Ambiguity Roulette | A page you paste one requirement into; it shows four straight-faced readings of it side by side |
| 1 | Meeting Cost Meter | One page: headcount and a rough hourly cost in, a number ticking upward in real time out |
| 2 | **Backlog Swipe** *(flagship)* | A page that shows one backlog item at a time and asks whether it matters more than the last; two people swipe the same CSV and the output is the disagreement |
| 2 | Requirements Linter | A page that marks up what is *missing* from a requirement — passive voice, undefined actors, unquantified adjectives — rather than judging it |
| 2 | Interactive PRD | The spec ships as the clickable prototype, with the requirements attached to the screens as openable annotations |
| 3 | **Linky** *(flagship)* | A containerised web service that draws the link graph around an item and lets you rewire it, with tests, CI and a published image |
| 3 | Monty | One file that runs ten thousand imaginary versions of the next few months from ten weekly throughput numbers |
| 3 | Beyond the Map | Fork this repository and add your own station, by pull request |

Each also carries three to five `steps` and a copy-pasteable `prompt`. The steps are where the
"too much information" judgement most likely bites: several run to 30–40 words each and give
advice about *how to run the exercise with colleagues* as well as how to build the thing.

---

## 4. The map — every field that is prose

About 5,440 words in total.

### `src/content/guides.js` — ~330 words

Three characters. For each: `name`, `lines[]` (what a first-time visitor hears, one dialogue
box per entry) and `repeat[]` (the shorter thing they say once you have already met them).

| Zone | Name | Lines | Repeat |
|---|---|---|---|
| 1 | Wren | 4 | 1 |
| 2 | Bram | 6 | 1 |
| 3 | Sable | 5 | 1 |

The names are in scope. They are said out loud during the talk, so if one is awkward in the
mouth, change it — everywhere, including `repeat`.

### `src/content/stations.js` — ~5,110 words

Per station: `title`, `problem`, `build`, `steps[]`, `prompt`, and the seven `receipt` values.
Word counts, so you can see where the weight sits:

| Zone 1 | | Zone 2 | | Zone 3 | |
|---|---|---|---|---|---|
| Choose Your Own Adventure | ~513 | Backlog Swipe | ~609 | Linky | ~743 |
| Ambiguity Roulette | ~421 | Requirements Linter | ~567 | Monty | ~578 |
| Meeting Cost Meter | ~395 | Interactive PRD | ~619 | Beyond the Map | ~666 |

Whatever you do to the voice, do it consistently across the nine. The difficulty curve is the
argument of the talk, and it only reads if the only thing changing between zones is the
content.

---

## 5. The fence and the tripwires

**Structure, not prose — do not change:** `id`, `zone`, `tile`, `sprite`, `flagship`,
`demo.type`, `links[].href`, and the guides' `zone`, `tile` and `sprite`.

Four ways to break this that no reviewer will spot by reading your diff.

### 5.1 Both gate answers live inside specific guide lines

The gate at the end of each zone asks a question whose answer must be findable in that zone,
so somebody playing alone with nobody narrating can answer honestly rather than guessing. The
guides carry both answers, and they carry them in `lines` — never only in `repeat`, because a
returning player hears `repeat` and must not be the one who misses it.

| Gate | Correct answer | Currently carried by |
|---|---|---|
| `gate-1-2` | "The discipline you wrap around it" | `Wren.lines[3]` — *"So what changes as you walk east is not the AI. It is the discipline you wrap around it."* |
| `gate-2-3` | "Reviewing, testing and deciding" | `Bram.lines[5]` — *"...Ask anyone east of here — nearly all of their effort goes on reviewing, testing and deciding."* |

You may move where the answer sits and reword it entirely. You may not lose it. **Read
`src/content/gates.js` after rewriting and check both answers are still in `lines`.** The gate
wording is fixed, so the guide has to meet it.

### 5.2 Receipt honesty

`CLAUDE.md` section 7 has the reasoning: an audience that spots one invented number stops
trusting the whole difficulty curve, and that curve is the entire argument of the talk.

Seven of the nine stations describe things nobody has built, and every figure on those is
marked `(est.)`. **Linky and Monty are the trap** — they exist, so their receipts should carry
real figures, but the real figures are not known yet, so they are marked too: Linky's
`buildTime`, `cost` and `lines`; Monty's `buildTime`, `tool`, `cost` and `lines`.

A rewrite must not quietly turn any of those into a claim. `src/ui/panel.js` prints a note
under the receipt whenever a field contains `(est.)`, so dropping a marker changes what the
panel asserts as well as what the field says.

Facts you may reword but not contradict: Linky has 145 automated tests, a multi-architecture
container image, CI on every push and a weekly rebuild for CVEs; Monty is a single file with
no backend, no APIs and no stored data.

### 5.3 The starter prompts have a job

Each `prompt` is 110–215 words and is in scope. It is not only read — somebody copies it into
Claude and expects the thing the station describes to come back. Rewriting for voice must keep
it working as a prompt.

**Try at least one.** Paste a rewritten prompt into Claude, see what comes back, and say in
your summary which one you tried and whether it still produced the right thing.

### 5.4 Content safety

**The published site is public on the open internet.** No employer-internal process detail,
system names, environment names or team names; no real ticket or project keys; no internal
URLs; no participant, patient or genomic data of any kind, real or realistic-looking. Every
example invented or clearly anonymised.

Two existing lines protect readers and should survive in some form: Ambiguity Roulette tells
the reader to use invented sentences, and its receipt says "None. Use invented sentences,
never anything confidential"; Meeting Cost Meter says nobody's actual salary belongs in it.

**If you are unsure whether something crosses the line, leave it out and flag it.**

---

## 6. What the validator will reject

`node --test` runs a content validation suite. These are its limits, so you may as well know
them before you hit them:

- A guide dialogue line over **140 characters** — one box holds one thought
- A guide whose `repeat` is not shorter than its `lines`
- Fewer than **3** or more than **5** steps on a station
- A receipt with anything other than the seven fields, in order, none blank
- An empty `title`, `problem`, `build`, `prompt`, `name` or dialogue entry

None of these are style opinions. They are what the panel and the dialogue box can physically
hold, and what the game needs to stay honest. If the Phase 1 review concludes one of them is
wrong, that is a format change — section 2.

---

## 7. Acceptance criteria

- [ ] Phase 1 happened, and the agreed direction is written down in your summary
- [ ] `node --test` passes; CI green on the branch
- [ ] The diff touches only the files the agreed scope allows
- [ ] All nine stations and all three guides read correctly in the running game, on screen
- [ ] Both gate answers are still discoverable in the `lines` of that zone's guide
- [ ] Every estimated figure is still marked `(est.)`, and no estimate became a claim
- [ ] At least one rewritten starter prompt has been pasted into Claude and still works
- [ ] The nine stations read as one voice, and the three guides sound like three people
- [ ] No employer-identifiable content anywhere

---

## 8. When you are done

Push the branch. **Do not open a pull request and do not merge to `main`.** Write a summary
covering:

1. **The direction agreed in Phase 1, in your own words**, so it is on the record
2. Which station challenges changed, and which you argued to keep as they were
3. **Before-and-after word count per station and per guide** — the shape of the change should
   be visible at a glance
4. Whether the format changed, and if so exactly which files moved with it
5. Which starter prompt you tried, and what came back
6. Anything you wanted to change but could not because it was out of scope
7. Anything you left out or softened because of the content safety rule
8. Any place where you think the rewrite lost something the old wording was doing — you have
   read both versions more carefully than anyone else will
