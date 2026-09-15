/**
 * THE STATIONS
 * ============
 *
 * One object per thing on the map you can walk up to and open. This file is the
 * whole of it: adding a station means adding an object here and changing nothing
 * else, ever. If you find yourself editing src/engine/ to add one, the data
 * model needs extending - the station is not special.
 *
 * Every station needs:
 *   problem   the pain it addresses, in plain language, no jargon
 *   build     a short description of the thing
 *   status    "sketch" if nobody has built it, "built" if it exists
 *   prompt    optional: an opening prompt the reader can copy and paste as-is
 *   steps     optional: concrete steps, three to five when present
 *
 * MOST OF THESE HAVE NOT BEEN BUILT, and the panel says so in as many words.
 * A station is a "sketch" until somebody builds the thing and links to it, at
 * which point it becomes "built" and the link is the proof. There is no third
 * state and nothing to keep in sync - the validator refuses a "built" station
 * with nowhere to point, so the claim cannot outlive the evidence.
 *
 * UNFINISHED IS THE NORMAL STATE HERE, not an embarrassment to be dressed up.
 * Every sketch closes with a standing invitation to go and build it, which is
 * most of what this repository is for. A station that quietly implied it
 * existed would cost more than an empty one ever could.
 *
 * KEEP IT SHORT. Two or three sentences per section. This is narrated live to
 * people watching a compressed video stream, and the previous version of this
 * file ran to six hundred words a station, which is four hundred more than
 * anybody reads standing up. Three stations carry a starter prompt because they
 * are the ones walked to on the day. The rest are deliberately thin.
 *
 * This file is published on the open internet. Keep every example invented and
 * generic: no employer process detail, no system or team names, no real ticket
 * references, no data about anybody. See CLAUDE.md section 1.
 */

/**
 * Drawn on the tile directly above any station with `flagship: true`, so a
 * content author never has to remember to pick a different sprite to make a
 * flagship look like one.
 *
 * Why a beehive: it has to read as "this one" on green grass, at 16 pixels, on a
 * compressed video stream, from the back of a room. That rules out most of the
 * contract. It is transparent-backed, so it sits ON the grass rather than
 * punching a square out of it; it fills nearly the whole tile; it is the one
 * strongly saturated warm shape in the set, which is the furthest thing from
 * grass green a codec can hold on to; and its outline is unbroken, so it stays
 * a recognisable silhouette after compression.
 */
export const FLAGSHIP_MARKER_SPRITE = "beehive";

export const stations = [
  // ------------------------------------------------------------------ zone 1
  // One conversation, one page, and a link you can send somebody.

  {
    id: "cyoa",
    zone: 1,
    flagship: true,
    title: "Choose Your Own Adventure",
    tile: { x: 10, y: 8 },
    sprite: "chest",

    problem:
      "Ask eight people how a decision actually gets made and they all nod along. Ask them to " +
      "write it down and you get eight different answers.",

    build:
      "A branching scenario you send as a link. The reader gets a situation, picks what they " +
      "would do, and the next situation follows from that choice. At the end they see the route " +
      "they took and can send it back to you.\n\n" +
      "Three people who each said the process was obvious will finish somewhere different, and " +
      "now you can all see where they split.",

    prompt:
      "Build me a branching scenario as ONE self-contained HTML file. No libraries, no build " +
      "step, no network calls.\n\n" +
      "Here is the opening situation and the first set of choices:\n" +
      "[paste yours here]\n\n" +
      "Each screen shows one short situation and two to four choices. Track the route the reader " +
      "took, list it at the end, and add a button that copies it. No score and no wrong " +
      "answers.\n\n" +
      "Keep every piece of scenario text in one clearly marked block at the top of the file, so " +
      "I can rewrite the wording without touching any code.\n\n" +
      "Then ask me for the branches you still need.",

    status: "sketch",
    notes: ["write-it-first", "one-file-first"],
    links: [],
  },

  {
    id: "meeting-cost-meter",
    zone: 1,
    flagship: false,
    title: "Meeting Cost Meter",
    tile: { x: 21, y: 8 },
    sprite: "terminal",

    problem: "Everyone knows the standing meeting is too big. Nobody feels it.",

    build:
      "A page where you type in a headcount and a rough hourly rate, press start, and watch a " +
      "number climb. Round the rate hard before you put it on a screen. Nobody's actual salary " +
      "belongs in this.",

    status: "sketch",
    notes: ["round-the-numbers", "resist-features"],
    links: [],
  },

  // ------------------------------------------------------------------ zone 2
  // Still one file, but it remembers what you did and it moves data in and out.

  {
    id: "backlog-swipe",
    zone: 2,
    flagship: true,
    title: "Backlog Swipe",
    tile: { x: 40, y: 8 },
    sprite: "table",

    problem:
      "Prioritisation meetings end in agreement, because agreeing is how meetings end. Everyone " +
      "nods at the ordered list, and then quietly works on whatever they personally thought " +
      "mattered.",

    build:
      "A page that shows one backlog item at a time and asks whether it matters more than the " +
      "last one you saw. Thirty items takes about four minutes.\n\n" +
      "When two people have both done it, it shows only the items they ranked differently, " +
      "biggest gap first. A single sorted list hides the argument. This one puts it on a screen " +
      "where you can have it.",

    prompt:
      "Build me a prioritisation tool as ONE self-contained HTML file. No libraries, no build " +
      "step, no network calls.\n\n" +
      "It loads a CSV with two columns, id and title. It shows one item at a time in large type, " +
      "with buttons for more important and less important, and it keeps my place if I close the " +
      "tab.\n\n" +
      "Let me export my answers as a JSON file. Then let me load TWO exported files and show only " +
      "the items the two people ranked differently, sorted by the size of the gap.\n\n" +
      "Do not merge them into one list or average the two scores. Show the disagreement.",

    status: "built",
    notes: ["small-asks", "write-it-first"],
    links: [
      {
        label: "Open Backlog Swipe",
        href: "https://bigeazee.github.io/promptlands/demos/backlog-swipe/",
      },
    ],
  },

  {
    id: "requirements-linter",
    zone: 2,
    flagship: false,
    title: "Requirements Linter",
    tile: { x: 50, y: 12 },
    sprite: "book",

    problem:
      "A requirement can be wrong in a way that reading it will never catch, because you fill in " +
      "the missing half yourself without noticing you did it. So does everybody else, slightly " +
      "differently.",

    build:
      "A page you paste a requirement into that marks what is missing rather than saying whether " +
      "it is any good. Passive voice, where the actor went. Adjectives with no number behind " +
      "them. Sentences with nothing to test them against. It remembers your own list of words to " +
      "watch for.",

    status: "sketch",
    notes: ["small-asks", "invent-the-examples"],
    links: [],
  },

  {
    id: "interactive-prd",
    zone: 2,
    flagship: false,
    title: "Interactive PRD",
    tile: { x: 58, y: 8 },
    sprite: "chest_wood",

    problem:
      "The twelve-page specification gets read properly by two people, on the day it goes out. " +
      "Everybody else skims the headings and works from the picture in their head.",

    build:
      "A clickable set of screens with the rules attached to them. Click a field and the rule for " +
      "that field opens beside it. Nobody has to read twelve pages, because the twelve pages are " +
      "wherever the reader is standing.\n\n" +
      "You are inside one of these right now.",

    status: "sketch",
    notes: ["write-it-first", "one-file-first"],
    links: [],
  },

  // ------------------------------------------------------------------ zone 3
  //
  // The only challenge in Zone 3, and therefore not a flagship: with nothing to
  // be distinct FROM, a marker would be noise. It stands at the east end of the
  // map because it is the one the talk finishes on.

  {
    id: "make-your-own-map",
    zone: 3,
    flagship: false,
    title: "Make Your Own Map",
    tile: { x: 88, y: 8 },
    sprite: "chest_locked",

    problem:
      "Training material gets written once, sent round as a deck, and read by the people who " +
      "already knew it. Nobody walks through a slide.",

    build:
      "This map, forked, with your subject in it. A new starter's first week, a process nobody " +
      "can remember, the handful of decisions people keep getting wrong.\n\n" +
      "You change the words in one file and the game is about your thing instead of this one. " +
      "The map, the tests and the checks come with it, and publishing it is a setting on your " +
      "own copy.",

    prompt:
      "I have forked a small browser game called PromptLands. It is vanilla JavaScript with no " +
      "build step and no dependencies, and everything the player reads is a plain object in " +
      "src/content/.\n\n" +
      "I want to turn it into training material about:\n" +
      "[what you want to teach]\n\n" +
      "Read CONTRIBUTING.md and src/content/stations.js first, then rewrite the stations, the " +
      "zone guides and the gate questions to cover my subject, keeping exactly the same shape.\n\n" +
      "Keep every example invented. This gets published on the open internet, so no employer " +
      "detail, no system or team names, no real ticket references and no data about anybody.\n\n" +
      "Then run node --test and fix whatever the content validation reports.",

    status: "sketch",
    notes: ["repo-and-tests", "ask-it-to-review-itself"],
    links: [
      {
        label: "How to change it, and a backlog of ideas (CONTRIBUTING.md)",
        href: "https://github.com/bigeazee/promptlands/blob/main/CONTRIBUTING.md",
      },
      {
        label: "The repository this game is built from",
        href: "https://github.com/bigeazee/promptlands",
      },
    ],
  },
];
