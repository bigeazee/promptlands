/**
 * FIELD NOTES
 * ===========
 *
 * The guidance and the lessons learned, in one place, reachable from anywhere in
 * the game with one key.
 *
 * WHY THIS IS CENTRALISED, which is worth defending because the obvious design
 * is the other one. Most of this started life stapled to whichever station
 * happened to need it - "round them hard, nobody's salary belongs in this" on
 * the cost meter, "a suite you never run is a comment" on Linky. Good sentences
 * in the wrong place. They are true everywhere, and a reader who wants to know
 * what never goes in a prompt should not have to remember which panel mentioned
 * it.
 *
 * The same argument is why the showcases carry no lessons section. A showcase
 * says what a thing is and what came of it. What building it TAUGHT is general,
 * and general things live here.
 *
 * A NOTE EARNS ITS PLACE BY BEING USEFUL MORE THAN ONCE. Anything true of
 * exactly one station belongs in that station, not in here. Ten to fifteen is
 * about right: fewer and it is not a reference, many more and nobody reads it.
 *
 * KEEP EACH ONE UNDER ABOUT FIFTY WORDS. An earlier version ran to seventeen
 * notes averaging seventy words each, which is an essay collection rather than
 * something you open mid-task to check one thing.
 *
 * Nothing unlocks. This game has no fail states and no gated rewards, and a
 * reference you have to earn is not a reference.
 *
 * This file is published on the open internet. See CLAUDE.md section 1.
 */

/** The order categories appear in the notebook. A note in no category is a bug. */
export const NOTE_CATEGORIES = [
  "Before you start",
  "Working with the AI",
  "What never goes in",
  "Knowing when to stop",
];

export const notes = [
  // ------------------------------------------------- Before you start
  {
    id: "pick-a-tool",
    category: "Before you start",
    title: "Pick a tool and ask it to build the thing",
    body:
      "Claude Code, OpenAI Codex and Gemini Code Assist all do this. For one page that does one " +
      "job, a chat app is enough and there is nothing to install.\n\n" +
      "Check which of them your employer has approved before you start, not after.",
  },
  {
    id: "write-it-first",
    category: "Before you start",
    title: "Write the thing out in prose before you open the AI",
    body:
      "Not as discipline, as a test. The parts you cannot describe in a paragraph are the parts " +
      "you have not decided yet.\n\n" +
      "Hand an undecided thing to something that will confidently decide it for you, and you end " +
      "up reviewing somebody else's product. Ten minutes here saves the afternoon.",
  },
  {
    id: "one-file-first",
    category: "Before you start",
    title: "Ask for one self-contained file until that stops working",
    body:
      "No libraries, no build step, no install. One file you can open by double-clicking and " +
      "send by attaching.\n\n" +
      "Nothing to set up means nothing to go stale, so a colleague can still open it in two " +
      "years. You will know when you have outgrown it, and it is later than you think.",
  },

  // ------------------------------------------------- Working with the AI
  {
    id: "small-asks",
    category: "Working with the AI",
    title: "Ask for one thing, look at it, then ask for the next",
    body:
      "A prompt that asks for eight things gets you eight things at once, all half right, and no " +
      "way to tell which half.\n\n" +
      "The tell is in your own behaviour. The moment you stop reading what came back and start " +
      "skimming it, your last ask was too big.",
  },
  {
    id: "repo-and-tests",
    category: "Working with the AI",
    title: "Put it in a repository and ask for tests, before the next feature",
    body:
      "Not when it gets big. When somebody else starts depending on it, which is usually " +
      "announced by someone asking you for a copy. Four versions in four inboxes is a mess " +
      "nobody can untangle, including you.\n\n" +
      "Ask for tests too, and make it run them in front of you. A suite nobody has watched run " +
      "is a comment.",
  },
  {
    id: "ask-it-to-review-itself",
    category: "Working with the AI",
    title: "Ask it to review its own work, and to fix nothing",
    body:
      "\"Review this the way somebody who did not write it would. List what you find. Do not fix " +
      "anything yet.\"\n\n" +
      "The second half matters as much as the first. Something that fixes while it looks will " +
      "quietly repair the interesting findings before you get to see them.",
  },
  {
    id: "rebuild-on-a-schedule",
    category: "Working with the AI",
    title: "If it runs somewhere, rebuild it on a schedule",
    body:
      "Anything packaged sits on top of something else, and that something else gets security " +
      "fixes whether or not your code changed. A weekly rebuild picks them up.\n\n" +
      "Nothing announces this. It will keep working right up until the week it matters that " +
      "nobody rebuilt it.",
  },

  // ------------------------------------------------- What never goes in
  {
    id: "unapproved-tools",
    category: "What never goes in",
    title: "Nothing real goes into a tool nobody has approved",
    body:
      "No company data, no customer details, no personal information, no internal documents. " +
      "Find out what your employer allows before you paste anything, not afterwards.\n\n" +
      "This is the one rule on this map that can cost somebody else something, rather than just " +
      "costing you an afternoon.",
  },
  {
    id: "invent-the-examples",
    category: "What never goes in",
    title: "Invent every example, every time",
    body:
      "Not anonymised, invented. Anonymising is a judgement made quickly, under time pressure, " +
      "about data you are already looking at, which is the worst moment to be making one.\n\n" +
      "A made-up example demonstrates the tool exactly as well and costs you nothing to get " +
      "wrong.",
  },
  {
    id: "round-the-numbers",
    category: "What never goes in",
    title: "Round anything about a person until it cannot be about a person",
    body:
      "Headcounts, rates, costs. A blended hourly figure rounded hard makes the same point as a " +
      "precise one, and nobody's actual salary belongs on a shared screen.\n\n" +
      "If rounding it breaks the point you were making, the point was about somebody rather than " +
      "about the work.",
  },
  {
    id: "tokens-off-the-browser",
    category: "What never goes in",
    title: "Anything secret stays on the server, and users do not choose addresses",
    body:
      "Two questions, and nothing will ask you either. What does this hold that must not reach " +
      "the browser? Can somebody using it make it fetch an address of their choosing?\n\n" +
      "A credential sent to the browser is a credential given away. Write your answers down " +
      "before you publish anything.",
  },

  // ------------------------------------------------- Knowing when to stop
  {
    id: "resist-features",
    category: "Knowing when to stop",
    title: "When it does the thing, stop",
    body:
      "Building got cheap enough that the question stopped being \"could I build this?\" and " +
      "became \"is this worth existing?\", which is a product question and therefore yours.\n\n" +
      "The smallest thing on this map got the biggest reaction. Everything after the feature " +
      "that made the point is a thing to maintain.",
  },
  {
    id: "show-the-spread",
    category: "Knowing when to stop",
    title: "Never show a number without what it is a number out of",
    body:
      "A date on its own is one sample from a distribution nobody drew. Attached to its " +
      "confidence it becomes a fact somebody can argue with, which is what you wanted.\n\n" +
      "Say how you got it, too. The method has to survive the room, because this week's answer " +
      "will be out of date soon enough.",
  },
];

/**
 * Look a note up by id.
 *
 * Stations and showcases cross-reference notes by id, one-directionally:
 * content points at notes and notes never point back. Two things to keep in
 * sync is one thing too many, and the "see also" line is worth far less than a
 * broken link costs.
 *
 * @param {string} id
 * @returns {object|undefined}
 */
export function findNote(id) {
  return notes.find((note) => note.id === id);
}
