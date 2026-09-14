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
 * what never goes in a prompt should not have to remember which of nine panels
 * mentioned it.
 *
 * The same argument is why the exhibits carry no lessons section. An exhibit
 * says what a thing is and what came of it. What building it TAUGHT is general,
 * and general things live here.
 *
 * A NOTE EARNS ITS PLACE BY BEING USEFUL MORE THAN ONCE. Anything true of
 * exactly one station belongs in that station, not in here. Twelve to twenty is
 * about right: fewer and it is not a reference, many more and nobody reads it.
 *
 * Nothing unlocks. This game has no fail states and no gated rewards, and a
 * reference you have to earn is not a reference.
 *
 * This file is published on the open internet. See CLAUDE.md section 1.
 */

/** The order categories appear in the notebook. A note in no category is a bug. */
export const NOTE_CATEGORIES = [
  "Asking for things",
  "Working with the AI",
  "What never goes in",
  "Knowing when to stop",
];

export const notes = [
  // ------------------------------------------------- Asking for things
  {
    id: "write-it-first",
    category: "Asking for things",
    title: "Write the thing out in prose before you open the AI",
    body:
      "Not as discipline — as a test. The parts you cannot describe in a paragraph are the " +
      "parts you have not decided yet, and handing an undecided thing to something that will " +
      "confidently decide it for you is how you end up reviewing somebody else's product.\n\n" +
      "It takes ten minutes and it is the single highest-leverage thing on this list.",
  },
  {
    id: "small-asks",
    category: "Asking for things",
    title: "Ask for one thing, look at it, then ask for the next",
    body:
      "A prompt that asks for eight things gets you eight things at once, all half right, and " +
      "no way to tell which half. A prompt that asks for one gets you something you can judge.\n\n" +
      "The tell is in your own behaviour: the moment you stop reading what came back and start " +
      "skimming it, your last ask was too big.",
  },
  {
    id: "say-where-it-runs",
    category: "Asking for things",
    title: "Say where it will be seen, not just what it should do",
    body:
      "\"It will be on a shared screen in a meeting\" changes the answer more than three " +
      "paragraphs of feature description. So does \"one person will use this on a laptop\" and " +
      "\"I am going to send this as a link and not be there\".\n\n" +
      "Nothing infers the room. You have to say it.",
  },
  {
    id: "one-file-first",
    category: "Asking for things",
    title: "Ask for one self-contained file until that genuinely stops working",
    body:
      "No libraries, no build step, no install. One file you can open by double-clicking it " +
      "and send by attaching it.\n\n" +
      "It is not a limitation, it is what makes the thing survive: nothing to set up means " +
      "nothing to go stale, and a colleague can open it in two years. You will know when you " +
      "have outgrown it, and the answer is usually later than you think.",
  },

  // ------------------------------------------------- Working with the AI
  {
    id: "tests-before-features",
    category: "Working with the AI",
    title: "Ask for tests before you ask for features, and make it run them",
    body:
      "A test suite you have never watched run is a comment. Ask for the output, including " +
      "whatever fails, and read that rather than the code.\n\n" +
      "This is also the moment the job changes. Up to here you were reading every line. From " +
      "here you read every result, and that swap is most of what \"working with\" one of these " +
      "things actually means.",
  },
  {
    id: "repo-before-features",
    category: "Working with the AI",
    title: "Put it in a repository before you add the next feature",
    body:
      "Not when it gets big. When somebody else starts depending on it — which is usually " +
      "sooner, and usually announced by someone asking for a copy.\n\n" +
      "Four versions in four inboxes is the failure mode, and it is unrecoverable rather than " +
      "merely annoying: nobody can tell which one is right, including you.",
  },
  {
    id: "ask-it-to-review-itself",
    category: "Working with the AI",
    title: "Ask it to review its own work as a hostile reader, and to fix nothing",
    body:
      "\"Review this the way somebody who did not write it would. List what you find. Do not " +
      "fix anything yet.\" The second half matters as much as the first: a model that fixes " +
      "while it looks will quietly repair the interesting findings before you see them.\n\n" +
      "Then you decide which of the list matter. That decision is the part that is yours.",
  },
  {
    id: "read-results-not-lines",
    category: "Working with the AI",
    title: "The judgement is which decisions not to delegate",
    body:
      "It will write the code faster than you can read it, and getting better at reading faster " +
      "is not the answer.\n\n" +
      "The work that stays yours is deciding what the thing is for, what it must never do, and " +
      "whether what came back actually does what you asked. Nothing prompts you for any of " +
      "that, and nothing will point out that you skipped it.",
  },
  {
    id: "rebuild-on-a-schedule",
    category: "Working with the AI",
    title: "If it runs somewhere, rebuild it on a schedule",
    body:
      "Anything packaged sits on top of something else, and that something else gets security " +
      "fixes whether or not your code changed. A weekly rebuild picks them up.\n\n" +
      "An image nobody rebuilds is an image quietly rotting. It will keep working, right up " +
      "until the part where it matters that it did not.",
  },

  // ------------------------------------------------- What never goes in
  {
    id: "invent-the-examples",
    category: "What never goes in",
    title: "Invent every example, every time",
    body:
      "Not anonymised — invented. Anonymising is a judgement you make quickly, under time " +
      "pressure, about data you are already looking at, and it is the wrong moment to be " +
      "making judgements.\n\n" +
      "A made-up example demonstrates the tool exactly as well and costs you nothing to be " +
      "wrong about.",
  },
  {
    id: "round-the-numbers",
    category: "What never goes in",
    title: "Round anything about a person until it cannot be about a person",
    body:
      "Headcounts, rates, costs, throughput. A blended hourly figure rounded hard makes the " +
      "same point as a precise one, and nobody's actual salary ever belongs on a shared screen.\n\n" +
      "If rounding it breaks the point you were making, the point was about somebody rather " +
      "than about the work.",
  },
  {
    id: "tokens-off-the-browser",
    category: "What never goes in",
    title: "Anything secret stays on the server, and users do not choose URLs",
    body:
      "Two questions, and nothing will ask you either of them. What does this hold that must " +
      "not reach the browser? And can somebody using it make it fetch an address of their " +
      "choosing?\n\n" +
      "A credential sent to the browser is a credential given away, whatever the page does with " +
      "it afterwards. A service that fetches whatever it is handed can be pointed at things " +
      "that were never meant to be reachable from outside. Write your answers down before you " +
      "publish anything.",
  },
  {
    id: "mark-your-estimates",
    category: "What never goes in",
    title: "Mark every figure you did not measure",
    body:
      "\"~400 (est.)\" costs one word. An audience that spots a single invented number stops " +
      "believing the ones that were real, and you do not get to find out which number did it.\n\n" +
      "Where something genuinely was not recorded, say that. \"Not recorded\" is a true " +
      "statement about the past. It is not a guess, and it does not need a marker.",
  },

  // ------------------------------------------------- Knowing when to stop
  {
    id: "resist-features",
    category: "Knowing when to stop",
    title: "When it does the thing, stop",
    body:
      "Building is now cheap enough that the constraint moved. The question stopped being " +
      "\"could I build this?\" — you could — and became \"is this worth existing?\", which is a " +
      "product question and therefore yours.\n\n" +
      "The smallest thing on this map got the biggest reaction. Every feature after the one " +
      "that made the point is a thing to maintain.",
  },
  {
    id: "leave-the-bad-weeks-in",
    category: "Knowing when to stop",
    title: "Do not tidy the data before you feed it in",
    body:
      "The bad weeks, the outliers, the fortnight everyone was ill. Those are not noise " +
      "obscuring the signal — for anything you are forecasting, they are most of the signal.\n\n" +
      "A model built on your good weeks tells you what would happen if nothing went wrong, " +
      "which is a question nobody asked.",
  },
  {
    id: "show-the-spread",
    category: "Knowing when to stop",
    title: "Never show a number without what it is a number out of",
    body:
      "A date on its own is a single sample from a distribution nobody drew. Attached to its " +
      "confidence it becomes a fact somebody can argue with, which is what you wanted.\n\n" +
      "Say out loud why you are doing it, too. The method has to survive the room, because " +
      "this week's particular answer will be out of date soon enough either way.",
  },
  {
    id: "disagreement-is-output",
    category: "Knowing when to stop",
    title: "When people disagree, do not average it away",
    body:
      "The temptation with any tool that collects opinions is to resolve them into one answer, " +
      "because one answer looks finished.\n\n" +
      "The disagreement was the finding. A merged list tells you what to do next and hides the " +
      "argument you actually needed to have; showing the gap is uncomfortable and considerably " +
      "more useful.",
  },
];

/**
 * Look a note up by id.
 *
 * Stations and exhibits cross-reference notes by id, one-directionally: content
 * points at notes and notes never point back. Two things to keep in sync is one
 * thing too many, and the "see also" line is worth far less than a broken link
 * costs.
 *
 * @param {string} id
 * @returns {object|undefined}
 */
export function findNote(id) {
  return notes.find((note) => note.id === id);
}
