/**
 * THE INVITATION
 * ==============
 *
 * One object, at the east end of the map, and the only thing in this game that
 * asks something of the player.
 *
 * It is not a station. A station is a challenge with a receipt, and a receipt
 * answers "what did this cost to build?" — a question the invitation has no
 * business pretending to answer. Faking one would put seven invented figures on
 * the single object whose whole job is to be believed, in a game whose argument
 * rests on its figures being honest.
 *
 * So: no receipt, no four sections, no flagship marker. A horizon, an ask, the
 * steps to do it, and the links.
 *
 * There is exactly one, and the validator enforces that. If a second one ever
 * seems necessary, the thing you actually want is a station.
 *
 * This file is published on the open internet. See CLAUDE.md section 1.
 */

export const invitation = {
  zone: 3,
  tile: { x: 88, y: 8 },
  sprite: "chest_locked",
  title: "Beyond the Map",

  horizon:
    "Everything on this map is something one person can build in evenings, and that ceiling is " +
    "already moving. The risk is not that you fall behind the tools. It is that you decide " +
    "once, this year, what these things are for, and then never revisit the decision — so the " +
    "answer you settled on quietly goes out of date while you are still repeating it.\n\n" +
    "Agents that run on a schedule rather than when you ask: something that reads yesterday's " +
    "changes each morning and leaves you three lines about what actually moved. Tools that " +
    "connect to the systems you already use, so the thing you built stops being an island you " +
    "paste into and out of. And tools that open their own pull requests — you describe a " +
    "change and what comes back is not a file to copy, but a proposal against a real " +
    "repository, tests already run, waiting for a person to say yes.\n\n" +
    "None of that changes the argument. The AI at the top of that list is the same AI in the " +
    "first zone of this map. What changes, again, is the discipline you wrap around it — and " +
    "at this end of the scale the discipline is mostly review, because the thing now proposes " +
    "changes faster than you can read them.",

  ask:
    "This game is a repository. Fork it, add a station describing something you would build, " +
    "and open a pull request.\n\n" +
    "The one worth building is not the one on this map. It is the one only you can see, " +
    "because you are the person who keeps hitting it. Two of the objects you walked past today " +
    "started exactly there.",

  steps: [
    "Open the contributing guide linked below. It has the whole procedure, and a backlog of " +
      "station ideas at the bottom for when you want one and cannot think of one.",
    "Fork the repository on GitHub and open src/content/stations.js. Every station you have " +
      "walked past today is one object in that one array.",
    "Copy whichever station is closest to what you want to say. Change the id, the title, the " +
      "tile and the sprite, then fill in all four sections and all seven receipt fields.",
    "Run node --test. The content validation suite checks that your tile is in bounds and " +
      "walkable, that your sprite name exists, that nothing else is standing on that tile, and " +
      "that your receipt is complete. When something is wrong it tells you which line to fix.",
    "Open a pull request. If a figure in your receipt is a guess, mark it (est.) — that " +
      "convention is the only reason anybody believes the figures that are not.",
  ],

  prompt:
    "I want to add a station to an open-source browser game. It is vanilla JavaScript with no " +
    "build step, no framework and no dependencies, and a station is one plain object in " +
    "src/content/stations.js.\n\n" +
    "Here is the idea I want to describe:\n[paste yours here]\n\n" +
    "Read CONTRIBUTING.md and src/content/stations.js in the repository first, then write me " +
    "one station object that matches the house style exactly: the four sections, the seven " +
    "receipt fields in the same order as the others, and an opening prompt somebody can copy " +
    "and paste.\n\n" +
    "Two rules I care about more than the rest:\n" +
    "- Mark every figure you cannot verify as an estimate, like \"~400 (est.)\". Do not invent " +
    "a number that looks measured.\n" +
    "- Keep every example invented and generic. This is published on the open internet, so no " +
    "employer detail, no system names, no real ticket references and no data about anybody.\n\n" +
    "Then run node --test and fix whatever the content validation suite says is wrong.",

  links: [
    {
      label: "How to add a station, and the backlog of ideas (CONTRIBUTING.md)",
      href: "https://github.com/bigeazee/promptlands/blob/main/CONTRIBUTING.md",
    },
    {
      label: "The repository this game is built from",
      href: "https://github.com/bigeazee/promptlands",
    },
  ],
};

/** What the collision layer and error messages call it. There is only one. */
export const INVITATION_ID = "the-invitation";
