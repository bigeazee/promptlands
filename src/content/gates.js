/**
 * THE GATES
 * =========
 *
 * One question between each pair of zones. Answer it and the door opens.
 *
 * The rule that gives the mechanic its point: the answer must be discoverable in
 * the stations and the guide of the zone the player is standing in. Nobody
 * should have to guess, and nobody should be able to skip a zone's content by
 * guessing. If you rewrite a question, check that the zone behind it still
 * answers it.
 *
 * There is no failure here. A wrong answer shows `nudge` and lets the player try
 * again immediately, as many times as they like. There is no counter, no
 * penalty, and nothing that reads as losing - see CLAUDE.md, "No fail states".
 *
 * `sprite` is the locked door on the map and `spriteUnlocked` replaces it the
 * moment the question is answered, so the map itself carries the record of how
 * far the player has got.
 */

export const gates = [
  {
    id: "gate-1-2",
    fromZone: 1,
    toZone: 2,
    tile: { x: 30, y: 10 },
    sprite: "door_wood",
    spriteUnlocked: "door_wood_open",
    // The one rule on this map worth gating on. Wren says it twice on the way
    // here, so nobody reaches Zone 2 without having been told at least once.
    question: "What should you keep out of an AI tool your employer has not approved?",
    options: [
      { text: "Real company, customer or personal data", correct: true },
      { text: "Requirements you have not finished writing", correct: false },
      { text: "Anything longer than a few hundred words", correct: false },
      { text: "Code somebody else wrote", correct: false },
    ],
    nudge: "Not quite. The answer is somewhere in this zone.",
  },

  {
    id: "gate-2-3",
    fromZone: 2,
    toZone: 3,
    tile: { x: 61, y: 10 },
    sprite: "door_wood",
    spriteUnlocked: "door_wood_open",
    question: "Once other people depend on what you have built, where does most of your time go?",
    options: [
      { text: "Writing the code", correct: false },
      { text: "Reviewing, testing and deciding", correct: true },
      { text: "Writing longer prompts", correct: false },
      { text: "Choosing the right model", correct: false },
    ],
    nudge: "Not quite. The answer is somewhere in this zone.",
  },
];
