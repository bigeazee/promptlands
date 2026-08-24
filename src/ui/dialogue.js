/**
 * DIALOGUE BOX
 * ============
 *
 * What happens when you press E at one of the zone guides. An HTML overlay
 * above the canvas, like the panel and the quiz - nothing here is drawn into
 * the canvas.
 *
 * It is anchored to the BOTTOM of the stage rather than centred, and that is
 * the whole design. A centred modal is a document you are reading. A box along
 * the bottom leaves the character and the world visible above it, so it reads
 * as somebody talking to you. That is the Zelda and Pokemon convention and it
 * is the reason this replaced a signpost.
 *
 * One line per box, advanced with E, Enter or Space. Text appears whole rather
 * than typing itself out: this gets driven live while somebody narrates over
 * the top, and a presenter must never be left waiting on an animation in the
 * middle of a sentence.
 *
 * Escape leaves early. There is nothing to lose by walking off mid-conversation
 * and the guide will say it all again - see linesFor() in
 * src/content/guides.js for what they say the second time.
 */

import { ATLASES, TILE_SIZE, spriteRect } from "../content/sprites.js";
import { linesFor } from "../content/guides.js";
import { el, trapTab } from "./overlay.js";

/**
 * Rendered size of the speaker chip, in CSS pixels. Must match the width and
 * height of .dialogue-portrait in ui.css - the background crop is scaled to it.
 */
const PORTRAIT_PX = 48;

/**
 * @param {HTMLElement} root an empty container element in index.html
 * @returns {{open: (guide: object, options?: {seen?: boolean}) => void,
 *            close: () => void, isOpen: () => boolean,
 *            onClose: (handler: Function) => void}}
 */
export function createDialogue(root) {
  if (!root) throw new Error("createDialogue: needs a container element from index.html.");

  const closeHandlers = [];
  let open = false;
  let lines = [];
  let at = 0;
  let returnFocusTo = null;

  root.classList.add("overlay", "overlay-dialogue");
  root.hidden = true;

  // No backdrop element: the point of this overlay is that you can still see
  // the map and the person you are talking to.
  const box = el("div", "dialogue");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-labelledby", "dialogue-name");

  const portrait = el("span", "dialogue-portrait");
  portrait.setAttribute("aria-hidden", "true");

  const name = el("p", "dialogue-name");
  name.id = "dialogue-name";

  const head = el("div", "dialogue-head");
  head.append(portrait, name);

  // aria-live so each new line is announced rather than only redrawn.
  const text = el("p", "dialogue-text");
  text.setAttribute("role", "status");
  text.setAttribute("aria-live", "polite");

  const count = el("span", "dialogue-count");
  const cue = el("span", "dialogue-cue", "▾");
  cue.setAttribute("aria-hidden", "true");

  // A real button, so the box is usable with a mouse and Tab has somewhere to
  // land. The keyboard path below is the one that gets used live.
  const next = el("button", "dialogue-next");
  next.type = "button";
  next.append(el("span", "dialogue-next-label", "Next"), cue);
  next.addEventListener("click", advance);

  const foot = el("div", "dialogue-foot");
  foot.append(count, next);

  box.append(head, text, foot);
  root.append(box);

  window.addEventListener("keydown", onKeyDown, { passive: false });

  function onKeyDown(event) {
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      trapTab(box, event);
      return;
    }
    // The same three keys that opened it carry it forward. Space and the arrows
    // are already preventDefault-ed globally by input.js so the page cannot
    // scroll under a screen share; do not weaken that to get key handling here.
    if (event.code === "KeyE" || event.key === "Enter" || event.code === "Space") {
      event.preventDefault();
      advance();
    }
  }

  function advance() {
    if (!open) return;
    at += 1;
    if (at >= lines.length) {
      close();
      return;
    }
    render();
  }

  function render() {
    text.textContent = lines[at];
    const last = at === lines.length - 1;

    count.textContent = lines.length > 1 ? `${at + 1} of ${lines.length}` : "";
    next.querySelector(".dialogue-next-label").textContent = last ? "Done" : "Next";
    next.setAttribute(
      "aria-label",
      last ? "End the conversation (E, Enter or Space)" : "Next line (E, Enter or Space)"
    );
  }

  /**
   * @param {object} guide one object from src/content/guides.js
   * @param {{seen?: boolean}} [options] seen: have they been spoken to before?
   *   Closing is NOT handled here: that is onClose() below, registered once at
   *   boot, exactly as the panel and the quiz do it.
   */
  function openDialogue(guide, options = {}) {
    if (!guide) throw new Error("dialogue.open: needs a guide object.");

    lines = linesFor(guide, Boolean(options.seen));
    if (lines.length === 0) {
      throw new Error(`dialogue.open: the guide for zone ${guide.zone} has nothing to say.`);
    }
    at = 0;

    name.textContent = guide.name || `Zone ${guide.zone}`;
    setPortrait(guide.sprite);
    render();

    returnFocusTo = document.activeElement;
    root.hidden = false;
    open = true;
    next.focus();
  }

  /**
   * The speaker's own sprite, cropped straight out of the atlas by CSS.
   *
   * Resolved through spriteRect() rather than by working out an offset here:
   * the sprite contract is the only place atlas geometry is allowed to live,
   * and it throws on a name it does not know rather than showing a wrong tile.
   */
  function setPortrait(spriteName) {
    if (!spriteName) {
      portrait.style.backgroundImage = "";
      return;
    }
    const rect = spriteRect(spriteName);
    const atlas = ATLASES[rect.atlas];
    const scale = PORTRAIT_PX / TILE_SIZE;

    // The atlas paths in the contract are relative to index.html, and so is a
    // url() in a style attribute on an element in that document.
    portrait.style.backgroundImage = `url("${rect.src}")`;
    portrait.style.backgroundSize = `${atlas.cols * TILE_SIZE * scale}px ${
      atlas.rows * TILE_SIZE * scale
    }px`;
    portrait.style.backgroundPosition = `-${rect.sx * scale}px -${rect.sy * scale}px`;
  }

  function close() {
    if (!open) return;
    open = false;
    lines = [];
    at = 0;
    root.hidden = true;
    if (returnFocusTo && typeof returnFocusTo.focus === "function" && document.contains(returnFocusTo)) {
      returnFocusTo.focus();
    }
    returnFocusTo = null;
    for (const handler of closeHandlers) handler();
  }

  return {
    open: openDialogue,
    close,
    isOpen() {
      return open;
    },
    onClose(handler) {
      if (typeof handler === "function") closeHandlers.push(handler);
    },
  };
}
