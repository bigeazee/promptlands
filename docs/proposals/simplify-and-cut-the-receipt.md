# Plan: simplify the prose, cut the receipt, open the map up

Settled. All nine open questions answered. Nothing built yet.

---

## 1. Decisions

| | Decision |
|---|---|
| Monty's zone | Moves to Zone 2 |
| The receipt | Removed entirely. Nothing replaces it |
| Linky | Read via the GitHub API, not cloned. Findings in section 3 |
| The spine | Solving real problems, and enjoying it. Discipline demoted to Zone 3 |
| Full stations | Choose Your Own Adventure, Backlog Swipe, Make Your Own Map |
| Live demo | Most of the talk is spent on Linky |
| Monty's build time | About an hour in a chat, then one day to make it a repository |
| Monty's tool | Claude Code |
| Ambiguity Roulette | Deleted |
| Voice | Mine to write. Plain, short, no machine tics |

---

## 2. What the Monty repository says

The game's copy describes a tool Monty is not.

| The game says | The repository says |
|---|---|
| "One file" | Three files |
| "ten thousand imaginary versions" | 1,000 by default, adjustable from 100 to 10,000 |
| "how many items your team finished in each of the last ten weeks" | Work items with a T-shirt size and an uncertainty level, plus a headcount |
| "samples from your own past weeks" | Triangular distributions from a Cone of Uncertainty model. It takes no history |
| "a fifty percent line, an eighty-five percent line" | P50, P80 and P90 |
| Hardest part: "trusting your own bad weeks" | There are no weeks |
| Lines: "Not counted" | 4,334 across the three files |

The field note about leaving bad weeks in your data is cross-referenced from Monty and describes the same tool Monty is not. It goes.

**What is true and usable.** About an hour in a chat produced the first single file. One day turned it into three files in a public repository on Pages, with a roadmap and a snapshot export, across four pull requests. Built with Claude Code. It still carries the Artifacts storage adapter it was born with, falling back to `localStorage` everywhere else. No backend, no database, and you can still open it by double-clicking it.

Monty moves to Zone 2, where holding state and moving CSV and JSON around is the zone definition almost verbatim.

---

## 3. What the Linky repository says

Read through the API. Every claim in the game's copy checks out except one.

| The game says | The repository says |
|---|---|
| "145 automated tests" | **1,975** |
| Every push runs the test suite | True, on `main` and on pull requests |
| Rebuilt weekly for security fixes | True, Mondays at 06:00 UTC, and `npm update` runs first |
| More than one processor architecture | True, amd64 and arm64 |
| Token stays on the server | True, proxied, held in memory, never in storage or cookies |
| Refuses user-supplied URLs | True, private ranges blocked and HTTPS required |

The test count is wrong by a factor of thirteen, in your favour.

**Two things worth putting in the talk that are not in the game.** Linky ships a demo mode that starts a stand-in tracker with 66 invented issues, so the whole thing can be demonstrated live without touching a real instance or a single real ticket. Given that you are spending most of your time on Linky, that is the safest demo path available and it is already built. It also vendors its own libraries and makes no outbound connection except to the tracker you configure.

**One thing to decide.** Linky is a Jira tool and the repository says so. The game currently says "a work tracker". The public image on Docker Hub presumably names Jira already, so either is defensible. I will stay generic unless you say otherwise, because it costs nothing.

---

## 4. The receipt goes, and nothing replaces it

Out: `RECEIPT_FIELDS` in the panel, the receipt card and its styles, the `(est.)` convention, the estimate note, the six validator rules that policed it, the field note about marking estimates, and the sections of `CLAUDE.md` and `CONTRIBUTING.md` that mandate it.

Facts worth keeping move into the prose as sentences. Monty's hour in a chat and Linky's test count are better said in a line of copy than printed in a table.

`CLAUDE.md` currently calls the receipt the most important element in the game and says never to omit a field. Sections 7 and 8 get rewritten to say the opposite. Naming that plainly because every other file obeys that one.

---

## 5. Two kinds of station

A **full station** is one you walk to on the day: a problem, what you would build, and a starter prompt. Roughly 150 words.

A **sketch** is a title, one line of problem, one line of what it could be, and a fixed closing line:

> Nobody has built this one. If you do, open a pull request.

Roughly 45 words. Three of the six are sketches, which is the "leave them unfinished" ask. It also puts the invitation next to each idea instead of locking it in a chest at the east end.

`demo: { type }` goes. A station is a sketch or it is built, and a built one has a link.

---

## 6. The map afterwards

| Zone | Guide | Objects |
|---|---|---|
| 1 | Wren | Choose Your Own Adventure (full, flagship), Meeting Cost Meter (sketch) |
| 2 | Bram | Monty (showcase), Backlog Swipe (full, flagship), Requirements Linter (sketch), Interactive PRD (sketch) |
| 3 | Sable | Linky (showcase), Make Your Own Map (full) |

Ambiguity Roulette is deleted. Hand It Over and Beyond the Map are replaced by Make Your Own Map, which takes the ask and the links.

**Two placement jobs.** Monty needs a Zone 2 tile. Zone 1 now has two stations seventeen tiles apart, exactly the validator limit, so Meeting Cost Meter moves west.

Word budget:

| | Now | Proposed |
|---|---|---|
| Stations | 3,748 across seven | ~590 across six |
| Showcases | 531 | ~280, Linky weighted |
| The invitation | 596 | 0, folded in |
| Guides | 329 | ~270 |
| Field notes | 1,165 across 17 | ~480 across 11 |
| Gates | 82 | ~85 |
| **Total** | **6,451** | **~1,700** |

A 74% cut.

---

## 7. The spine, and what the guides say

The map argued that the AI is much the same at all three levels and what changes is the discipline around it. It now argues that you can build things that solve real problems, that it is enjoyable, and that here is how to start. Discipline stays as Zone 3's answer, where Sable and Gate 2 already live.

**Wren** teaches the method and carries the data warning: pick a tool, describe what you want in plain words, ask it to build. Claude Code, OpenAI Codex and Gemini Code Assist are named, and the chat apps are named for one-page builds. Then the rule: check what your employer allows, and never paste confidential, personal or customer data into a tool nobody has approved. Invent your examples instead.

**Gate 1** tests that warning, so nobody reaches Zone 2 without meeting it. **Gate 2** keeps the question about where the human effort goes.

---

## 8. Build order

**WP9, the model.** Remove receipts from the panel, validator, tests and docs. Delete the invitation type. Replace `demo.type` with a built-or-sketch state. Rename `exhibits.js` to `showcases.js`. No new prose, and the tests prove it.

**WP10, the map.** Every player-facing word in one pass, so the voice is single: six stations, two showcases, three guides, Gate 1, the field notes, and Make Your Own Map.

Files: all eight content files, `panel.js`, `notes.js`, `ui.css`, `main.js`, both test files, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`.

---

## 9. Not touching

The engine, the map grid, the sprite contract, the progress store, the Backlog Swipe demo, integer scaling, the no-fail-state rule, the three-zone shape, and guides as people you talk to.
