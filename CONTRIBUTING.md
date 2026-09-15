# Contributing to PromptLands

The whole point of this repository is that you can fork it, add a station
describing something you would build, and open a pull request — without knowing
JavaScript, without installing anything, and without a build step.

A station is **one object in one file**. That is the entire contribution.

---

## Run it locally first

PromptLands uses native ES modules, and browsers refuse to load those over the
`file://` protocol.

**Double-clicking `index.html` will not work.** You get a blank page and a CORS
error in the console, and nothing about the error tells you that the fix is
"serve it over HTTP". This is the single thing that wastes people's first hour,
so it is the first thing in this guide.

Serve the folder instead, from the repository root:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Any static file server does the same job —
`npx serve`, `php -S localhost:8000`, whatever you already have. There is
nothing to install and nothing to build.

To run the tests you need Node 18 or newer:

```
node --test
```

No `npm install`. There are no dependencies, and the tests use `node:test`,
which is built into Node. If you ever find yourself adding a package to run the
tests, something has gone wrong.

---

## Add a station

### 1. Open `src/content/stations.js`

Every station you walked past in the game is one object in the `stations` array
in that file. Nothing else in the repository needs to change — not the engine,
not the map, not the UI. If you find yourself editing `src/engine/`, stop:
either there is a simpler way to say what you want, or the data model needs
extending, and that is worth raising as an issue first.

### 2. Copy the station closest to what you want to say

Then change it. Here is the shape, with every field that matters:

```js
{
  id: "your-station",          // unique, lower case, hyphens
  zone: 2,                     // 1, 2 or 3
  flagship: false,             // exactly one flagship per zone, and they are taken
  title: "Your Station",
  tile: { x: 44, y: 12 },      // see "Where to put it" below
  sprite: "book",              // a name from src/content/sprites.js

  problem: "...",              // the PM pain, in plain language, no jargon
  build: "...",                // a short description of the thing
  steps: ["...", "...", "..."],// three to five concrete steps
  prompt: "Copy-paste starter prompt goes here",

  status: "sketch",            // "sketch" or "built" — see below
  links: [],
}
```

`status` has two values:

| Use | When |
|---|---|
| `"sketch"` | Nobody has built it. The panel says so and asks somebody to. |
| `"built"` with `links` | It exists, and the links are where to go and look. |

**`"built"` with no links is rejected.** Saying a thing exists is a claim about the
world, and somewhere to go and look is the only evidence this file can hold. If you
have built it but cannot point anybody at it, it is a sketch until you can.

`prompt` and `steps` are both optional. A sketch with neither is a normal, finished
station.

### 3. Fill in the problem and the build, and keep them short

Every station panel has the same sections in the same order — **the problem**,
**what you'd build**, whether it exists, and **get started** where there is a
prompt — because the consistency is what lets somebody compare a zone 1 station
with a zone 3 one and see the difficulty curve.

**Short is the house style, not a compromise.** Two or three sentences each. The
game is narrated live to people watching a video stream, and nobody reads six
hundred words standing up.

The validation suite enforces a ceiling, and the ceiling is roughly double the
house style so it only catches real overshoot:

| Field | Ceiling | Aim for |
|---|---|---|
| `problem` | 60 words | about 30 |
| `build` | 140 words | about 60 |
| `prompt` | 250 words | about 110 |
| A field note body | 90 words | about 50 |

Two more things the suite checks, both about voice rather than length. **No em
dashes**: a full stop, a comma or a rewrite reads better and they are the
clearest tell of text nobody edited. And no one-line punchlines stacked up. One
short sentence for emphasis is fine; five in a row is a tic.

### 4. If you did not measure it, leave it out

There used to be a receipt here: seven fixed fields on every station, with
anything unmeasured marked `(est.)`. It is gone. Sixty-three slots across nine
objects were sixty-three things that had to be filled, and most got filled with a
plausible guess wearing a marker.

So there is no slot to pad. A figure worth having goes in your prose as a
sentence, where you can say how you arrived at it: "about an hour, and I did not
write down how long the first version took." Anything you did not measure simply
does not appear. An audience that spots one invented figure stops trusting the
rest, and nothing here forces you to invent one.

### 5. Re-read the content safety rule against your copy

**This site is public on the open internet.** Before you open the pull request,
read your own words back with this list in hand:

- No employer-internal process detail, system names, environment names or team
  names
- No real ticket keys, project keys or internal URLs
- No participant, customer or personal data of any kind, real or
  realistic-looking
- Invent a neutral domain if your example needs one

If you are unsure whether something crosses the line, leave it out and say so in
the pull request. Nobody will mind.

### 6. Run the tests

```
node --test
```

Fix anything the content validation suite reports, and open your pull request.

---

## Where to put it

The `tile` is where your station stands on the map in `src/content/map.js`, and
four rules apply. All four are checked by the tests, so you will not break the
site by getting one wrong — but knowing them saves a round trip.

1. **It has to be walkable ground.** Stations are made solid at boot, so you
   stand *next* to one rather than on it. The tile itself must be plain ground
   in the map's ASCII grid — grass (`.`), the gravel plaza (`%`), the zone 3
   decking (`_`) — not a tree, a wall or a fence.
2. **Nothing else can be on it.** No other station, no gate, no guide.
3. **It needs a walkable neighbour**, or nobody can stand next to it to press E.
4. **It has to be close to its neighbours.** Within a zone, stations are walked
   between in order from west to east, and no two stations that follow one
   another may be more than **17 tiles apart on foot** — measured by walking the
   map, not in a straight line. Ten to fourteen is the target. The talk is
   narrated live while moving, and dead air spent crossing scenery is the main
   way this format fails in front of an audience.

If your station is a flagship, the tile **directly above it** also needs to be
clear: that is where the beehive marker is drawn.

Sprites come from `src/content/sprites.js` and nowhere else. Use a name from
`SPRITES`; if the tile you want has no name, add one — that is a one-line change
and always the right move. The scenery on the map deliberately avoids every
sprite a station uses, so that a crate on the ground is never mistaken for
something you can open. Please keep it that way.

---

## What the validation suite will reject, and how to read it

`node --test` runs `tests/content.test.js`, which is the test that stops a pull
request breaking the live site. It collects **every** problem it finds and
prints them all, so you never have to fix one thing at a time.

Each message tells you which thing is wrong and where to look. There are two
kinds, and they read differently on purpose:

**A fault in something you defined** names the thing by its id:

```
Station "backlog-swipe" is marked "built" but has no links. Somewhere to go and
look is the only evidence this file can carry, so a station without one says
"sketch" instead.
```

**A fault in the map grid** names the row, the column and the character:

```
parseMap: map row 6, column 12 (tile x=12, y=6): character "Z" has no entry in
the legend.
```

The rules it enforces:

| It rejects | Because |
|---|---|
| A missing or empty station field | Every panel has all four sections |
| A station with no `status`, or one that is not `sketch` or `built` | The panel has to know whether the thing exists |
| `status: "built"` with no links | A claim about the world with no evidence behind it |
| Steps present but fewer than three or more than five | Fewer and nobody can follow it, more and nobody reads it |
| A duplicate `id` | Progress is saved against ids |
| A zone that is not 1, 2 or 3 | There are three zones |
| A zone with no stations at all | A zone with nothing to attempt is a corridor |
| A zone of two or more stations without exactly one flagship | One per zone gets talked through live |
| A flagship in a zone with only one station | A marker means nothing with nothing to be distinct from |
| A lessons field on a showcase | Lessons are centralised in src/content/notes.js |
| A showcase missing what it is or what happened | Those are the whole of a showcase |
| A "See also" pointing at a note that does not exist | It would render a cross-reference to nothing |
| A zone with more or fewer than one guide | The guide is what makes that zone's gate answer findable |
| A sprite name that is not in `sprites.js` | A typo would be a hole in the live site |
| A tile off the map, or on a solid tile | You could never reach it |
| Two things on the same tile | Only the first one could ever be opened |
| A station walled in on all four sides | Nobody could stand next to it |
| A gate without exactly one correct answer | Nobody could pass it, or everybody could |
| A guide's dialogue line over 140 characters | It would overflow the box on the day |
| A guide drawn with an opaque sprite | They would arrive as a hole in the ground |
| A hole in a zone barrier | Somebody could skip a whole zone's content |
| Adjacent stations more than 17 tiles apart | Dead air in the middle of a talk |

---

## The community backlog

Ideas nobody has picked up yet. Take one, change it beyond recognition, or
ignore all of them and write your own — they are here so that "contributions
welcome" turns into "here is something to do this evening".

- **Stakeholder Simulator** — a page that answers your draft update in the voice
  of four different stakeholders, so you find the question you were going to get
  asked before the meeting rather than during it.
- **Onboarding Text Adventure** — the first week as a playable scenario. New
  joiners find the gaps in your documentation by walking into them, and every
  dead end they hit is a page somebody needs to write.
- **UAT Bug Bounty** — a lightweight board where testers log what they found,
  vote on severity, and see the count climb. All the reporting, none of the
  workflow.
- **Roadmap What-If** — drag a delivery date and watch everything downstream
  move, so a conversation about one slip stops being a conversation about one
  slip.
- **Pre-mortem Generator** — describe what you are about to ship and get twenty
  ways it could go wrong, ranked by how boring they are. The boring ones are the
  ones that actually happen.
- **Ambiguity Roulette** — paste in one requirement sentence and show four
  straight-faced readings of it side by side, then let the room vote for the one
  they thought it said. When the vote splits you have found the sentence to
  rewrite, before anybody built anything. This was a station on the map until
  the content was cut back; it is a good idea and nobody has built it.

---

## House rules for pull requests

These are constraints, not preferences, and a pull request that breaks one will
be asked to change:

- **No build step.** Vanilla JavaScript, native ES modules, served as-is.
- **No framework and no dependencies.** No React, no bundler, no TypeScript, and
  nothing that ships to the browser from `npm`.
- **Client-side only.** No backend, no API calls, no fetch to anybody.
- **No tracking.** No analytics, no telemetry, no cookies, no measurement.
- **No proprietary art, music or character names.** The art is Kenney, CC0 — see
  `CREDITS.md`. If you add art from anywhere else, check its licence and update
  that file.
- **No fail states.** No timers, no lives, no score, and no way to lose. A wrong
  answer at a gate gets a gentle nudge and an immediate retry, for ever.

Keep the tone of your copy plain. The reader is a product manager, not an
engineer, and the fastest way to lose them is a sentence that assumes they
already know what you are talking about.
