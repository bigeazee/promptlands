# Work Package 8 — Field Notes

**Branch:** create `wp8-field-notes` from `main`, **after WP7 has merged.** This package seeds
its content from WP7's hand-over and cross-references the content types WP7 creates.

---

## 0. Read this first

**Read `CLAUDE.md` in full.** Then play the game, open a few stations, and talk to a guide.

The thing to notice while you do: **the station steps are teaching as well as instructing.**
"Round them hard. Nobody's actual salary belongs in this." "A suite you never run is a suite
that lies." "Present the shape rather than the date." Those are good sentences in the wrong
place — advice that applies everywhere, stapled to whichever station happened to need it.

---

## 1. What this package delivers

A **Field Notes** notebook: one place holding the guidance and the lessons learned, reachable
from anywhere in the game in a single keypress.

Two reasons it is centralised rather than attached to the things that taught it. It is a
*reference* — somebody who wants to know what not to put in a prompt should not have to
remember which station mentioned it. And the lessons from Monty and Linky deliberately do not
live on those exhibits: an exhibit says what a thing was and what came of it; what building it
taught is general, and belongs with the rest of the guidance.

**In scope:** the notes content, the overlay, the HUD control, the cross-reference field, and
validation.

**NOT in scope:** rewriting or trimming station prose. A separate session is doing that.
You add the destination; they do the moving.

---

## 2. Content

### `src/content/notes.js` — new

```js
export const notes = [
  {
    id: "ask-for-tests",
    category: "Working with the AI",
    title: "Ask for tests before you ask for features",
    body: "..."     // two or three short paragraphs at most
  }
];
```

Flat, human-editable, exactly like every other content file, so a contributor adds a note by
pull request the same way they add a station.

**Seed it from WP7's hand-over summary**, which quotes every sentence in Linky's and Monty's
old copy that reads as a lesson rather than a description. That is the highest-value material
you have — it is the only content in this project that came from somebody actually shipping
something.

Then add the general guidance. Suggested categories, to refine against what you actually
write: **Prompting**, **Working with the AI**, **Safety and data**, **Knowing when to stop**.
Twelve to twenty notes is the right order of magnitude. Fewer and it is not a reference; many
more and nobody reads it.

Two rules on the content. **The content safety rule applies in full** — this is published.
And **a note earns its place by being useful more than once**; anything true of exactly one
station belongs in that station.

### Cross-references

Stations and exhibits gain an optional `notes: ["ask-for-tests", "small-prompts"]` field,
rendered as a short "See also" line in the panel. **One-directional only** — content points at
notes, notes never point back. Bidirectional references are two things to keep in sync and
this project has enough of those.

---

## 3. The overlay

### `src/ui/notes.js` — new

```js
export function createNotes(root)
// -> { open(), close(), isOpen(), onClose(handler) }
```

`onClose` is a registration fired on every close, matching the panel, the quiz and the
dialogue. **Do not invent a fourth convention.**

- Opens on **`N`**, and on a control in the HUD next to Reset and Export. It is a reference,
  so reaching it must never require walking anywhere or remembering where something was.
- **Every note is available from the start.** Nothing unlocks. This game has no fail states
  and no gated rewards, and a reference you have to earn is not a reference.
- Notes grouped under their category headings, all bodies visible, the whole thing scrollable
  with Up, Down, PageUp and PageDown — the same keys the station panel already uses, for the
  same reason: `input.js` calls `preventDefault()` on the arrows so the page can never scroll
  under a screen share. **Do not weaken that.**
- Escape closes. Opening pauses the game and calls `input.clearPresses()`; closing resumes.
  Add it to `anyOverlayOpen()` in `src/main.js` — that list exists because WP5 shipped a bug
  by forgetting it, and the dialogue reopened underneath itself.
- Legible at half a laptop screen, like everything else.

---

## 4. Validation

`src/content/validate.js` grows a `checkNote`. Every rule needs a test proving it fires on
deliberately malformed content.

- Every note has a non-empty `id`, `category`, `title` and `body`
- Note ids are unique
- **Every id in a station's or exhibit's `notes` array resolves to a real note** — this is the
  one that matters, because a typo would render a "See also" pointing at nothing
- `notes` is optional everywhere; absent is legal and means no cross-references

---

## 5. Acceptance criteria

- [ ] `node --test` passes; CI green
- [ ] `N` and the HUD control both open the notebook, from anywhere, at any point
- [ ] Every note is readable immediately, with nothing locked
- [ ] Escape closes it; movement is frozen while open and the game still renders behind
- [ ] Arrow keys scroll the notebook and the page itself never scrolls
- [ ] At least one station and both exhibits carry a working "See also" line
- [ ] A `notes` entry pointing at a nonexistent id fails the validator with a message naming
      the station and the bad id
- [ ] The lessons from WP7's hand-over are all present and none were lost
- [ ] Legible at half a laptop screen
- [ ] No employer-identifiable content anywhere

---

## 6. When you are done

Push the branch. **Do not open a pull request and do not merge to `main`.** Write a summary
covering:

1. The list of notes you wrote, by category, with one line each
2. Anything from WP7's hand-over you could not find a home for
3. Which stations and exhibits you cross-referenced, and which you deliberately did not
4. Any guidance still stuck in station steps that ought to move — **as a list for the prose
   session, not as an edit you made**
5. Any interface in sections 2 to 4 you think is wrong
6. Anything you softened or left out under the content safety rule
