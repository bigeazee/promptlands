/**
 * THE SHOWCASES
 * =============
 *
 * Things that already exist and were used in earnest. They are on this map as
 * proof, not as homework.
 *
 * SHOWCASES ARE NOT ON THE DIFFICULTY CURVE. Stations are challenges, and the
 * zones grade how complex a challenge is to build. A showcase was already
 * built, so "how hard would this be for you?" is the wrong question to ask of
 * it. It sits in whichever zone matches the complexity of its OWN build, which
 * keeps it honest against the same axis.
 *
 * So a showcase goes where its own build complexity puts it, never where its
 * importance would. Monty is in Zone 2 because it holds its state between
 * visits and moves CSV and JSON in and out, which is the Zone 2 definition
 * almost word for word. It is not in Zone 3: there are no tests and no CI.
 *
 * CHECK THE CLAIMS HERE AGAINST THE REPOSITORY BEFORE YOU EDIT THEM. The first
 * version of this file described a Monty that samples your last ten weeks of
 * throughput out of a single HTML file. It does neither. It also put Linky's
 * test count at 145 when the real figure was over a thousand. Nothing caught
 * any of it, because prose is the part no test reads, and a showcase that is
 * wrong about what the thing does is worse than no showcase at all.
 *
 * NO LESSONS HERE. A showcase says what a thing is (`what`) and what came of it
 * (`happened`). What building it TAUGHT is general, applies far beyond the thing
 * that happened to teach it, and lives in the Field Notes - see
 * src/content/notes.js. Do not add a lessons field, and do not smuggle lessons
 * into `happened`.
 *
 * This file is published on the open internet. See CLAUDE.md section 1.
 */

export const showcases = [
  {
    id: "monty",
    zone: 2,
    tile: { x: 36, y: 12 },
    sprite: "anvil",
    title: "Monty",

    what:
      "A forecasting tool. You list the work, give each item a size and a level of uncertainty, " +
      "and say how many people are on it. It then runs a thousand simulated schedules and " +
      "reports the date by which half of them had finished, the date for four fifths, and the " +
      "date for nine tenths.\n\n" +
      "Alongside those it draws the spread, so you can see whether the answers cluster tightly " +
      "or scatter across two months. The spread is the part worth arguing about.",

    happened:
      "Its output sat behind a release estimate that senior people acted on.\n\n" +
      "About an hour in a chat produced the first working version. One more day turned that into " +
      "three files in a public repository, built with Claude Code. There is no backend, no " +
      "database and no server anywhere in it, and you can still open it by double-clicking the " +
      "file.",

    notes: ["show-the-spread"],
    links: [
      { label: "Open Monty", href: "https://bigeazee.github.io/monty/" },
      { label: "The repository", href: "https://github.com/bigeazee/monty" },
    ],
  },

  {
    id: "linky",
    zone: 3,
    tile: { x: 70, y: 8 },
    sprite: "server",
    title: "Linky",

    what:
      "A small web service that draws the links between items in a work tracker and lets you " +
      "rewire them by dragging. It runs as a container: one command to pull it, one to run it.\n\n" +
      "It talks to your tracker using credentials that never leave the machine it is running on, " +
      "and it makes no other outbound connection at all. It also ships with a demo mode that " +
      "serves sixty-six invented issues, so it can be shown to a room without a real instance or " +
      "a single real ticket anywhere near the screen.",

    happened:
      "The AI wrote most of the code. The two decisions that mattered most were in none of the " +
      "prompts: keeping the access token on the server so it never reaches the browser, and " +
      "refusing to fetch an address that somebody using it supplies. Nothing asked about either, " +
      "and nothing pointed out that they were missing. Both came from a person who had seen them " +
      "go wrong before.\n\n" +
      "Around that sits the machinery that lets a colleague run it safely. It lives in a " +
      "repository, every push runs the test suite, and there are 1,975 of those tests. The image " +
      "is rebuilt every Monday whether or not the code changed, because the base image picks up " +
      "security fixes. It is published for two processor architectures, so it runs on somebody " +
      "else's laptop as well as the machine it was written on.",

    notes: ["tokens-off-the-browser", "rebuild-on-a-schedule"],
    links: [
      {
        label: "Pull the published container image from Docker Hub",
        href: "https://hub.docker.com/r/edwinjclark/linky",
      },
    ],
  },
];

/**
 * The sprite drawn on the tile above a showcase, so proof is distinguishable
 * from homework at a glance without reading anything.
 *
 * A plaque is what stands beside a thing in a museum, which is exactly the job.
 * The sprite has been unused since the zone guides stopped being signposts and
 * became people, so this reclaims it rather than adding one.
 */
export const SHOWCASE_MARKER_SPRITE = "plaque";

/**
 * Showcases are identified by `id` like stations, because unlike guides there is
 * no natural one-per-zone rule to lean on: Zone 2 and Zone 3 have one each today
 * and nothing says a zone could not hold two.
 *
 * @param {{id: string}} showcase
 * @returns {string}
 */
export function showcaseId(showcase) {
  return showcase && showcase.id;
}
