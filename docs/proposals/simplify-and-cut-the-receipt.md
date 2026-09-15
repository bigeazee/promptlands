# Proposal: simplify the prose, cut the receipt, open the map up

Status: proposal, nothing built. Written to be argued with.

---

## 1. The short version

1. **The receipt goes.** Seven fields on every object, and the `(est.)` convention with it. One short line replaces it, and the honesty rule becomes "if you did not measure it, leave it out".
2. **The prose is cut by about 72%**, from 6,451 player-facing words to roughly 1,800.
3. **Most stations become sketches on purpose**: a title, two sentences, and a visible note that nobody has built it. Four of the seven.
4. **Monty and Linky are relabelled showcases** and their copy is rewritten against what the code actually does. See section 2, which is the part you should read first.
5. **Zone 1 teaches the method**: pick a tool, describe what you want, ask it to build. Claude Code, OpenAI Codex and Gemini Code Assist are named, and the chat apps are named for one-page builds.
6. **Gate 1 becomes the data-safety question**, so nobody reaches Zone 2 without meeting the warning.
7. **Zone 3 ends with Make Your Own Map**, a challenge to fork this repo and turn it into training material for your own subject. It absorbs Beyond the Map. Hand It Over goes.

---

## 2. What the Monty repository says, and why it changes a decision

You sent me the repository, so I read it instead of the prose we wrote about it. The game is currently wrong about Monty in ways an audience member could catch by opening the page.

| The game says | The repository says |
|---|---|
| "One file" | Three files: `index.html`, `monty.css`, `monty.js` |
| "ten thousand imaginary versions" | 1,000 simulations by default, adjustable from 100 to 10,000 |
| "how many items your team finished in each of the last ten weeks" | Work items with a T-shirt size and an uncertainty level, plus a headcount |
| "samples from your own past weeks" | Samples triangular distributions from a Cone of Uncertainty model. It takes no history at all |
| "a fifty percent line, an eighty-five percent line" | P50, P80 and P90 |
| Hardest part: "trusting your own bad weeks enough to leave them in" | There are no weeks to leave in |
| Lines: "Not counted" | 4,334 lines across the three files |
| Build time: "Not recorded" | All 14 commits and 4 merged pull requests are dated 2026-05-01 |

The cross-reference from Monty to the field note about leaving bad weeks in your data is wrong for the same reason. That note describes a tool Monty is not.

**This is the risk the receipt was invented to prevent, and the receipt did not catch it**, because the receipt polices numbers and these are sentences.

### What is true, and it is better

Monty started as a single file built in a chat and uploaded. By the end of the same day it had been renamed for GitHub Pages, split into three files, given a roadmap document and a stakeholder snapshot export, across four pull requests. It still carries the storage adapter it was born with, preferring the Artifacts key-value store and falling back to `localStorage` for everything else.

So Monty walked Zone 1 to Zone 2 in one day, and the repository records it. That is a better story than the one we invented, and you can show the commit list.

### The decision it changes

You chose Monty in Zone 1, on the basis that it was one HTML file that did arithmetic. It is 4,334 lines, holds state in `localStorage`, and imports and exports CSV and JSON. That is the definition of Zone 2 in `CLAUDE.md`, almost word for word. It has no tests and no CI, so it is not Zone 3.

**I recommend moving Monty to Zone 2.** Your rule was that zones grade build complexity and nothing else, and applied honestly that rule puts it there. I am flagging it rather than doing it because it reverses a choice you made, and the reason is new information rather than second thoughts.

The cost: Zone 1 then has no proof object, so Wren has to point east instead of at something nearby. The alternative is keeping it in Zone 1 with corrected prose and accepting that one object sits off the axis.

A smaller point: the receipt says Monty calls no services. It loads two fonts from a CDN, and works without them.

---

## 3. The prose problem, measured

6,451 player-facing words across the content files. Measured patterns:

| Pattern | Count |
|---|---|
| Sentences | 475 |
| Dramatic fragments, under six words | 57, or 12% of all sentences |
| Em dashes | 36 |
| "actually" | 11 |
| "the point" or "the argument" | 12 |
| "quietly" | 8 |
| "X is not Y. It is Z." | 5 |

Twelve percent of the sentences are fragments like "Nobody can feel it.", "That gap is the point." and "Round them hard." One of those is emphasis. Fifty-seven is a tic, and it is the single most recognisable sign of machine-written prose.

The word count is the bigger problem. The longest station is 621 words. Nobody standing in a talk reads 621 words, and nobody browsing alone reads nine of them.

---

## 4. What replaces the receipt

Seven fields, in fixed order, on nine objects is 63 slots that all have to be filled. Most were filled with guesses wearing an `(est.)` badge. The badge was doing real work, and it was also the reason the card cost so much to maintain.

**Replace it with one line under the title**, with no fixed fields:

> Three files, no backend, no database. Built in a day.

> About an hour's work. Nothing to install.

Nothing appears unless it is known. A missing figure is simply absent, which is self-policing in a way `(est.)` never was, because writing nothing takes no effort and inventing something takes a sentence.

What dies with it: `RECEIPT_FIELDS` in the panel, the estimate note, the `(est.)` convention, the validator's six receipt rules, the field note about marking estimates, and the outstanding job of finding real figures for two objects.

What is lost: the fixed card made a Zone 1 and a Zone 3 object directly comparable. The zone label and the one-line summary carry that less precisely. I think that is a fair trade at a 72% word cut, and it is the part of this proposal I am least certain about.

---

## 5. Two kinds of challenge

A **full station** is one you would demo live. Problem, what you would build, a starter prompt. Roughly 150 words.

A **sketch** is a title, one line of problem, one line of what it could be, and a standing invitation. Roughly 50 words. The panel closes with a fixed line:

> Nobody has built this one. If you do, open a pull request.

This is your "leave many of them unfinished" ask, and it improves the invitation as a side effect. Beyond the Map put the ask in a chest at the far east end, where only somebody who finished the walk would find it. Spread across four sketches, the ask sits next to the specific idea it applies to.

Starter prompts go on the three full stations only. Every sketch points at one fill-in-the-blank template in the field notes. Nine prompts was nine things to keep working.

`demo: { type }` can go at the same time. A station is a sketch or it is built, and a built one has a link. Two states derived from one field, instead of three states that could contradict the links array.

---

## 6. The map afterwards

| Zone | Guide | Objects |
|---|---|---|
| 1 | Wren | Choose Your Own Adventure (full, flagship), Ambiguity Roulette (sketch), Meeting Cost Meter (sketch) |
| 2 | Bram | Monty (showcase), Backlog Swipe (full, built, flagship), Requirements Linter (sketch), Interactive PRD (sketch) |
| 3 | Sable | Linky (showcase), Make Your Own Map (full) |

Gate 1 between zones 1 and 2. Gate 2 between 2 and 3.

The existing flagship rule survives untouched: one flagship in a zone with two or more stations, none in a zone with one.

Word budget:

| | Now | Proposed |
|---|---|---|
| Seven challenges | 3,748 | ~700 |
| Two showcases | 531 | ~230 |
| The invitation | 596 | 0, folded in |
| Three guides | 329 | ~280 |
| Field notes | 1,165 across 17 | ~480 across 11 |
| Gates | 82 | ~85 |
| **Total** | **6,451** | **~1,800** |

---

## 7. Getting started, and the warning

Wren currently explains the difficulty curve. She should explain the method instead, because a player in Zone 1 has not started yet.

> Welcome to the west end. Everything out here is one conversation and one page you can send somebody a link to.
>
> Pick whichever AI you like. Claude Code, OpenAI Codex and Gemini Code Assist all do this. For one page, the chat apps are enough.
>
> Describe what you want in plain words, then ask it to build the thing. That really is the method out here.
>
> One rule before you start. Check what your employer allows, and never paste confidential, personal or customer data into a tool nobody has approved.
>
> Invent your examples instead. Made-up data proves the tool works just as well and costs you nothing if you are wrong.

The same warning opens the field notes, and a "How to start" entry there names the three tools again for anyone who walks past Wren.

**Gate 1 becomes:**

> What should never go into an AI tool your organisation has not approved?
>
> - Real company, customer or personal data ✓
> - Requirements you have not finished writing
> - Anything longer than a few hundred words
> - Code somebody else wrote

Gate 2 keeps its current question about where the human effort goes, so the discipline argument still has a gate behind it. It also stops being the only thing Wren exists to set up, which frees her to do the job above.

---

## 8. Make Your Own Map

The Zone 3 challenge, and the one the talk should end on.

**The problem.** Training material gets written once, sent round as a deck, and read by the people who already knew it. Nobody walks through a slide.

**What you would build.** This map, forked, with your subject in it. Onboarding for a team, a process nobody can remember, the thing you explain in the same meeting every month. You change the words in one file and the game is about your subject instead of this one.

It earns Zone 3 on the complexity axis: a fork, a repository, an edit, a pull request and a deploy. Linky carries tests, CI and containers as the showcase beside it.

It replaces Hand It Over, which asked people to add tests and CI to a tool they had not built yet. It also absorbs Beyond the Map's ask and links, so the invitation becomes something you do rather than something you read.

The prediction essay in Beyond the Map goes. It is 216 words of forecasting that will date faster than anything else in the repository, and it is better said out loud by you, where being wrong costs nothing.

---

## 9. One station, before and after

**Now, 398 words.** Opening of the Meeting Cost Meter:

> Everybody already knows the standing meeting is too big and too long. Nobody can feel it. "Fourteen people, an hour a week" is an abstraction, and abstractions do not change anyone's behaviour. A number climbing on a shared screen is not an abstraction.

**Proposed, 55 words including the standing invitation.** The whole station:

> **Meeting Cost Meter**
>
> Everyone knows the standing meeting is too big. Nobody feels it.
>
> A page where you type in a headcount and a rough hourly rate, press start, and watch a number climb. Round the rate hard, because nobody's salary belongs on a shared screen.
>
> *Nobody has built this one. If you do, open a pull request.*

---

## 10. What it costs

Almost the whole content layer, which is why it is two work packages rather than one.

**WP9, the model.** Remove receipts from the panel, the validator, the tests and the docs. Fold the invitation into a station type. Replace `demo.type` with a built-or-sketch state. No new prose. Mechanical, and the tests prove it.

**WP10, the map.** Rewrite every player-facing word in one pass: challenges, showcases, guides, Gate 1, field notes, and Make Your Own Map. One pass by one session, because a single voice is the point and three sessions would give three.

Files: all eight content files, `panel.js`, `notes.js`, `ui.css`, `main.js`, both test files, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`.

**`CLAUDE.md` currently calls the receipt "the most important element in the game" and says never to omit a field.** Sections 7 and 8 have to be rewritten to say the opposite. Worth naming plainly, because everything else in this repository is built to obey that file.

---

## 11. What I am not touching

The engine, the map grid, the sprite contract, the progress store, the Backlog Swipe demo, integer scaling, the no-fail-state rule, the three-zone shape, and guides as people you talk to. None of that is the problem, and all of it works.

---

## 12. What I need from you

1. **Monty to Zone 2, or stay in Zone 1 with corrected prose?** Section 2. My recommendation is to move it.
2. **Is one line enough to replace the receipt**, or should the cheapness evidence live only in what you say out loud?
3. **Monty's build time.** The repository says one day for everything after the first upload. It does not record how long the original file took in the chat before that. If you remember, that number is worth having.
4. **Was Monty built with Claude Code?** The branch names say so and I would rather you confirmed it than have me infer it into the game.
