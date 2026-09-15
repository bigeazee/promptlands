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
 * importance would. The gap between how cheap a thing was to build and how far
 * it ended up being trusted is the argument of the whole talk, and that gap
 * only reads if the placement is honest about the first half of it.
 *
 * Check the claims here against the repository before you edit them. The first
 * version of this file described a Monty that samples your last ten weeks of
 * throughput out of a single HTML file. It does neither, and nothing caught it
 * for months, because prose is the part no test reads.
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
    zone: 1,
    tile: { x: 15, y: 13 },
    sprite: "anvil",
    title: "Monty",

    what:
      "One file that runs ten thousand imaginary versions of the next few months. You give it " +
      "how many items your team finished in each of the last ten weeks and how many are left. " +
      "It samples from your own past weeks, over and over, and counts how many of those ten " +
      "thousand futures have finished by each date.\n\n" +
      "What comes out is not a date. It is a shape: a fifty percent line, an eighty-five " +
      "percent line, and the distance between them, which is a fact about your team that " +
      "nobody has to argue about.",

    happened:
      "Its output sat behind a release estimate that senior people acted on.\n\n" +
      "Look at where it is standing. There is no backend, no API and no data store anywhere " +
      "in it. It is a page that does arithmetic quickly, and it belongs in the first zone of " +
      "this map because that is honestly how hard it was to build. It is not here because it " +
      "was difficult. It is here because an honest range turned out to be rarer, and worth " +
      "more, than a confident date.",


    notes: ["leave-the-bad-weeks-in", "show-the-spread"],
    links: [],
  },

  {
    id: "linky",
    zone: 3,
    tile: { x: 70, y: 8 },
    sprite: "server",
    title: "Linky",

    what:
      "A small web service that draws the link graph around an item and lets you rewire it in " +
      "place. It runs as a container: one command to pull it, one to run it, and it talks to " +
      "your tracker's API using credentials that never leave the machine it is running on.\n\n" +
      "The drawing is not the interesting part. What made it something another person could " +
      "safely run is the machinery around it. It lives in a Git repository. Every push runs " +
      "the test suite — 145 automated tests — and the image is rebuilt every week whether or " +
      "not anything changed, because the base image picks up security fixes and an image " +
      "nobody rebuilds is an image quietly rotting. It is published for more than one " +
      "processor architecture, so it runs on a colleague's laptop as well as on the machine " +
      "it was written on.",

    happened:
      "The AI wrote most of the code. The two decisions that mattered most were in none of the " +
      "prompts: keeping the access token on the server so it never reaches the browser, and " +
      "refusing to fetch URLs that a user supplies, so the service cannot be talked into " +
      "making requests on somebody else's behalf.\n\n" +
      "Nothing asked for either. Nothing pointed out that they were missing. They came from a " +
      "person who had seen both go wrong before — and that, not the code, is the argument this " +
      "whole map has been making.",


    notes: ["tokens-off-the-browser", "rebuild-on-a-schedule", "read-results-not-lines"],
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
 * no natural one-per-zone rule to lean on: Zone 1 and Zone 3 have one each today
 * and nothing says a zone could not hold two.
 *
 * @param {{id: string}} showcase
 * @returns {string}
 */
export function showcaseId(showcase) {
  return showcase && showcase.id;
}
