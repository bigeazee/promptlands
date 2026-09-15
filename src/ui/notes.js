/**
 * THE FIELD NOTES NOTEBOOK
 * ========================
 *
 * An HTML overlay above the canvas, like the panel and the quiz. Opens on N or
 * from the control under the canvas, from anywhere, at any point.
 *
 * IT IS A REFERENCE, SO NOTHING IS LOCKED. Every note is readable from the first
 * second of the game. There is no fail state anywhere in PromptLands and no
 * reward to gate behind progress, and a reference you have to earn is not a
 * reference — somebody who wants to know what never goes in a prompt needs it
 * now, not after walking to the third zone.
 *
 * Everything is rendered at once under its category heading and the whole thing
 * scrolls, rather than being a list you click into. One fewer interaction to
 * explain, nothing hidden behind a click, and Ctrl+F finds things — which is
 * what a reference is for. If this ever grows past about twenty notes it will
 * want an index; it does not have one yet on purpose.
 *
 * Up, Down, PageUp and PageDown scroll it. They have to be handled here because
 * input.js calls preventDefault() on the arrows so the page can never scroll
 * under a screen share, which also means the browser will not scroll this for
 * us. Do not weaken that to avoid writing these twenty lines.
 */

import { NOTE_CATEGORIES, notes } from "../content/notes.js";
import { el, trapTab } from "./overlay.js";

/** How far Up/Down nudge the notebook, in pixels. Matches the station panel. */
const SCROLL_STEP = 72;

/**
 * @param {HTMLElement} root an empty container element in index.html
 * @returns {{open: () => void, close: () => void, isOpen: () => boolean,
 *            onClose: (handler: Function) => void}}
 */
export function createNotes(root) {
  if (!root) throw new Error("createNotes: needs a container element from index.html.");

  const closeHandlers = [];
  let open = false;
  let returnFocusTo = null;

  root.classList.add("overlay");
  root.hidden = true;

  const backdrop = el("div", "overlay-backdrop");
  const dialog = el("div", "panel");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "notes-title");

  const eyebrow = el("p", "panel-eyebrow", "Field notes");
  const title = el("h2", "panel-title", "Things worth knowing");
  title.id = "notes-title";

  const closeButton = el("button", "button panel-close", "Close");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close the field notes (Escape)");

  const head = el("header", "panel-head");
  const headText = el("div", "panel-head-text");
  headText.append(eyebrow, title);
  head.append(headText, closeButton);

  const body = el("div", "panel-body");
  body.tabIndex = 0;

  dialog.append(head, body);
  root.append(backdrop, dialog);

  // Built once at construction: the notes never change while the game is
  // running, so there is nothing to rebuild on every open.
  body.replaceChildren(...buildContent());

  backdrop.addEventListener("click", close);
  closeButton.addEventListener("click", close);
  window.addEventListener("keydown", onKeyDown, { passive: false });

  function onKeyDown(event) {
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      trapTab(dialog, event);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      scrollBy(SCROLL_STEP);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      scrollBy(-SCROLL_STEP);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      scrollBy(body.clientHeight * 0.9);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      scrollBy(-body.clientHeight * 0.9);
    }
  }

  function scrollBy(amount) {
    body.scrollTop += amount;
  }

  function buildContent() {
    const nodes = [];

    nodes.push(
      el(
        "p",
        "notes-intro",
        "Everything here applies to more than one thing on this map. It is all available from " +
          "the start — there is nothing to unlock, and no wrong way to read it."
      )
    );

    // Grouped by the order in NOTE_CATEGORIES rather than by the order notes
    // happen to be written in, so adding a note never reshuffles the notebook.
    for (const category of NOTE_CATEGORIES) {
      const inCategory = notes.filter((note) => note.category === category);
      if (inCategory.length === 0) continue;

      const section = el("section", "panel-section");
      section.append(el("h3", "panel-heading", category));

      for (const note of inCategory) {
        const entry = el("article", "note");
        entry.append(el("h4", "note-title", note.title));
        for (const paragraph of String(note.body).split(/\n{2,}/)) {
          const text = paragraph.trim();
          if (text) entry.append(el("p", "note-text", text));
        }
        section.append(entry);
      }
      nodes.push(section);
    }

    return nodes;
  }

  function openNotes() {
    returnFocusTo = document.activeElement;
    body.scrollTop = 0;
    root.hidden = false;
    open = true;
    body.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    root.hidden = true;
    if (returnFocusTo && typeof returnFocusTo.focus === "function" && document.contains(returnFocusTo)) {
      returnFocusTo.focus();
    }
    returnFocusTo = null;
    for (const handler of closeHandlers) handler();
  }

  return {
    open: openNotes,
    close,
    isOpen() {
      return open;
    },
    onClose(handler) {
      if (typeof handler === "function") closeHandlers.push(handler);
    },
  };
}
