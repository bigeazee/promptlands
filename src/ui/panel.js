/**
 * STATION PANEL
 * =============
 *
 * The overlay that opens when you press E next to a station. An HTML element
 * above the canvas - nothing here is drawn into the canvas.
 *
 * Content is built with createElement and textContent, never innerHTML. Station
 * copy is data, and data never becomes markup.
 *
 * Two things are structural rather than decorative:
 *
 *   1. The sections come out in CLAUDE.md's order, always, so two panels can
 *      be compared by somebody reading one after the other.
 *   2. The panel scrolls ITSELF on Up/Down and PageUp/PageDown. input.js calls
 *      preventDefault() on the arrows so the page can never scroll under a
 *      screen share, which also means the browser will not scroll this panel
 *      for us. Weakening that preventDefault to get scrolling back would trade
 *      a working panel for a jumping page. We scroll by hand instead.
 */

import { findNote } from "../content/notes.js";
import { el, trapTab } from "./overlay.js";

/** How far Up/Down nudge the panel body, in pixels. */
const SCROLL_STEP = 72;

/**
 * @param {HTMLElement} root an empty container element in index.html
 * @returns {{open: (station: object) => void,
 *            openShowcase: (showcase: object) => void,
 *            close: () => void, isOpen: () => boolean,
 *            onClose: (handler: Function) => void}}
 */
export function createPanel(root) {
  if (!root) throw new Error("createPanel: needs a container element from index.html.");

  const closeHandlers = [];
  let open = false;
  let returnFocusTo = null;
  let flashTimer = null;

  root.classList.add("overlay");
  root.hidden = true;

  const backdrop = el("div", "overlay-backdrop");
  const dialog = el("div", "panel");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "panel-title");

  const eyebrow = el("p", "panel-eyebrow");
  const title = el("h2", "panel-title");
  title.id = "panel-title";

  const closeButton = el("button", "button panel-close", "Close");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close this panel (Escape)");

  const head = el("header", "panel-head");
  const headText = el("div", "panel-head-text");
  headText.append(eyebrow, title);
  head.append(headText, closeButton);

  // tabindex makes the scroll container focusable, so the keys below have
  // somewhere sensible to land the moment the panel opens.
  const body = el("div", "panel-body");
  body.tabIndex = 0;

  dialog.append(head, body);
  root.append(backdrop, dialog);

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
    // Never steal the arrows from a text field, if one ever ends up in here.
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

    const page = Math.max(SCROLL_STEP, body.clientHeight - 48);
    if (event.key === "ArrowDown") scrollBy(SCROLL_STEP);
    else if (event.key === "ArrowUp") scrollBy(-SCROLL_STEP);
    else if (event.key === "PageDown") scrollBy(page);
    else if (event.key === "PageUp") scrollBy(-page);
    else if (event.key === "Home") body.scrollTop = 0;
    else if (event.key === "End") body.scrollTop = body.scrollHeight;
    else return;

    event.preventDefault();
  }

  function scrollBy(amount) {
    body.scrollTop += amount;
  }

  /**
   * @param {object} station one object from src/content/stations.js
   */
  function openPanel(station) {
    if (!station) throw new Error("panel.open: needs a station object.");

    // Built before anything is shown, so a station that throws leaves the game
    // running rather than stranding the player behind a half-drawn overlay.
    const content = buildContent(station);

    eyebrow.textContent = station.flagship
      ? `Zone ${station.zone} · Flagship`
      : `Zone ${station.zone}`;
    title.textContent = station.title || station.id;

    show(content);
  }

  /**
   * A showcase is proof, not homework: what the thing is and what came of it.
   * There is no "get started" here, because nobody is being asked to build
   * this one.
   *
   * No lessons section either, deliberately. What building these taught is
   * general and lives in the Field Notes; see src/content/showcases.js.
   */
  function openShowcasePanel(showcase) {
    if (!showcase) throw new Error("panel.openShowcase: needs a showcase object.");

    const content = [
      section("What it is", paragraphs(showcase.what)),
      section("What happened", paragraphs(showcase.happened)),
      linkSection("Go and look", showcase.links),
      seeAlso(showcase.notes),
    ].filter(Boolean);

    eyebrow.textContent = `Zone ${showcase.zone} · Built and used`;
    title.textContent = showcase.title || showcase.id;
    show(content);
  }

  /** The three open paths differ only in what they build. This is the rest. */
  function show(content) {
    body.replaceChildren(...content);
    body.scrollTop = 0;

    returnFocusTo = document.activeElement;
    root.hidden = false;
    open = true;
    body.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    root.hidden = true;
    if (flashTimer !== null) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    if (returnFocusTo && typeof returnFocusTo.focus === "function" && document.contains(returnFocusTo)) {
      returnFocusTo.focus();
    }
    returnFocusTo = null;
    for (const handler of closeHandlers) handler();
  }

  // ---------------------------------------------------------------- content

  function buildContent(station) {
    const nodes = [];

    nodes.push(section("The problem", paragraphs(station.problem)));
    nodes.push(section("What you'd build", paragraphs(station.build)));
    nodes.push(statusSection(station));
    nodes.push(getStarted(station));
    nodes.push(seeAlso(station.notes));

    return nodes.filter(Boolean);
  }

  /**
   * Whether the thing exists, and the one honest thing to say about it.
   *
   * A station is a sketch or it is built. A built one has somewhere to point,
   * and the validator refuses one that does not, so the claim can never
   * outlive the evidence for it. Most are sketches, and the panel says so in
   * as many words: an unbuilt idea with an open ask on it is what this
   * repository is here to collect.
   */
  function statusSection(station) {
    if (station.status === "built") {
      const links = Array.isArray(station.links) ? station.links : [];
      if (links.length === 0) {
        // The validator refuses this, so it is belt and braces. Still say
        // something true rather than implying a demo nobody can open.
        return section("The demo", [
          el("p", "demo-note", "Built, but there is nowhere public to point at it yet."),
        ]);
      }
      return section("The demo", [linkList(links)]);
    }

    return section("Nobody has built this one", [
      el(
        "p",
        "demo-note",
        "This is an idea, not a thing you can open. If you build it, open a pull request and " +
          "it gets a link here with your name on the commit."
      ),
    ]);
  }

  /**
   * Steps and a starter prompt, when there are any.
   *
   * Both are optional, so this returns null rather than an empty heading over
   * nothing. A sketch that says "here is the idea, nobody has built it" is
   * finished as it stands; a "Get started" heading with an empty copy box
   * under it would read as a page that failed to load.
   */
  function getStarted(station) {
    const parts = [];
    if (Array.isArray(station.steps) && station.steps.length > 0) {
      parts.push(steps(station.steps));
    }
    if (typeof station.prompt === "string" && station.prompt.trim() !== "") {
      parts.push(promptBlock(station.prompt));
    }
    return parts.length === 0 ? null : section("Get started", parts);
  }

  function section(heading, children) {
    const node = el("section", "panel-section");
    node.append(el("h3", "panel-heading", heading), ...children);
    return node;
  }

  /** Blank lines in station copy are paragraph breaks, because prose has them. */
  function paragraphs(text) {
    return String(text ?? "")
      .split(/\n\s*\n/)
      .filter((part) => part.trim() !== "")
      .map((part) => el("p", "panel-text", part.trim()));
  }

  function steps(list) {
    const ordered = el("ol", "panel-steps");
    for (const step of Array.isArray(list) ? list : []) {
      ordered.append(el("li", null, String(step)));
    }
    return ordered;
  }

  function promptBlock(text) {
    const block = el("div", "prompt-block");
    const bar = el("div", "prompt-bar");
    const label = el("span", "prompt-label", "Copy this into Claude to start");
    const copyButton = el("button", "button prompt-copy", "Copy");
    copyButton.type = "button";

    const pre = el("pre", "prompt-text", String(text ?? ""));
    pre.tabIndex = 0;

    copyButton.addEventListener("click", () => copyPrompt(pre, copyButton));
    bar.append(label, copyButton);
    block.append(bar, pre);
    return block;
  }

  /**
   * Clipboard where it exists, selection where it does not. navigator.clipboard
   * is missing on an insecure origin and can reject without warning, so both
   * paths end somewhere useful for the reader rather than in a dead button.
   */
  async function copyPrompt(pre, button) {
    const text = pre.textContent;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        flash(button, "Copied");
        return;
      }
    } catch {
      // Fall through to selecting it.
    }
    selectAll(pre);
    flash(button, "Selected — press Ctrl+C");
  }

  function flash(button, message) {
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    button.textContent = message;
    if (flashTimer !== null) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      button.textContent = button.dataset.label || original;
      flashTimer = null;
    }, 2000);
  }

  /**
   * The bridge to the Field Notes. Titles only - the notebook holds the bodies,
   * and duplicating them here is how the guidance ended up in nine places in
   * the first version. Returns null when a thing cross-references nothing.
   */
  function seeAlso(ids) {
    const list = Array.isArray(ids) ? ids : [];
    if (list.length === 0) return null;

    const items = el("ul", "see-also");
    for (const id of list) {
      const note = findNote(id);
      // A bad id is caught by the content validator long before anybody sees
      // this, so the fallback is just belt and braces rather than a design.
      items.append(el("li", null, note ? note.title : id));
    }
    const wrap = el("div", "see-also-block");
    wrap.append(
      el("p", "see-also-lead", "In the field notes — press N to open them:"),
      items
    );
    return section("See also", [wrap]);
  }

  /** Shared by stations and showcases. Returns null when there is nothing to link. */
  function linkSection(heading, links) {
    const list = Array.isArray(links) ? links : [];
    if (list.length === 0) return null;
    return section(heading, [linkList(list)]);
  }

  function linkList(links) {
    const list = el("ul", "demo-links");
    for (const link of links) {
      const item = el("li");
      const anchor = el("a", null, link.label || link.href);
      anchor.href = link.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      item.append(anchor);
      list.append(item);
    }
    return list;
  }

  return {
    open: openPanel,
    openShowcase: openShowcasePanel,
    close,
    isOpen() {
      return open;
    },
    onClose(handler) {
      if (typeof handler === "function") closeHandlers.push(handler);
    },
  };
}

// -------------------------------------------------------------------- shared

function selectAll(node) {
  const selection = window.getSelection && window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  node.focus();
}
