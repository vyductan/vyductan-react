/**
 * Radix dialogs, vaul drawers and Radix popovers each run their OWN
 * DismissableLayer stack, and those stacks do not cross-gate. A dismiss aimed
 * at one layer therefore also reaches layers in the other stacks, which is how
 * a click meant for a Drawer collapses a Popover that was opened before it.
 *
 * These helpers answer "is another modal layer stacked above me?" from the DOM
 * rather than from React or store state. That is deliberate: both layers
 * resolve a dismiss inside the same event, before React re-renders, so any
 * state read during the handler is one tick stale — `data-state` is not.
 */
const OPEN_DIALOG_LAYERS = [
  "[data-slot='dialog-content'][data-state='open']",
  "[data-slot='alert-dialog-content'][data-state='open']",
];

const OPEN_MODAL_LAYERS = [
  ...OPEN_DIALOG_LAYERS,
  "[data-slot='drawer-content'][data-state='open']",
];

/**
 * Is a Radix dialog / alert-dialog open anywhere?
 *
 * Prefer {@link hasOpenDialogAfter} when the asking layer has a node: this
 * cannot tell a dialog stacked ABOVE the asker from one it was opened FROM, and
 * a layer that treats the second as the first can never dismiss itself.
 */
export function hasOpenDialog() {
  return !!document.querySelector(OPEN_DIALOG_LAYERS.join(", "));
}

/**
 * Is a Radix dialog / alert-dialog stacked ABOVE `node`?
 *
 * "Above" is document order, the same reading {@link hasModalLayerAfter} uses:
 * portalled layers are appended to the body in mount order, so a dialog that
 * FOLLOWS `node` opened later and is the one handling the dismiss.
 *
 * This is the distinction a plain {@link hasOpenDialog} cannot make, and both
 * directions occur:
 *
 * - dialog opened from INSIDE a drawer  → dialog follows → above → the drawer
 *   must not self-dismiss, or the dialog's own Escape takes the stack down
 * - drawer opened from INSIDE a dialog  → dialog precedes → NOT above → the
 *   drawer dismisses normally, which is what its close button and its overlay
 *   are for
 *
 * With no node the answer falls back to {@link hasOpenDialog}: nothing can be
 * ordered against an unmounted layer, and staying open is the safer failure.
 */
export function hasOpenDialogAfter(node: Element | null | undefined) {
  if (!node) return hasOpenDialog();

  return [...document.querySelectorAll(OPEN_DIALOG_LAYERS.join(", "))].some(
    (layer) => isAfter(node, layer),
  );
}

/**
 * Consumers that ask to be parked behind a modal layer rather than dismissed.
 * Needed by the capture-phase snapshot below, which has to decide "who is
 * guarded" before it knows who will ask.
 */
const GUARD_CONSUMERS = "[data-slot='popover-content']";

/**
 * Layers that own Escape when they sit above someone. A Select opened INSIDE a
 * Drawer must get the Escape that closes it, not have the Drawer close
 * underneath it.
 *
 * Deliberately limited to the layers that close themselves from their own
 * `onEscapeKeyDown` (Modal, AlertModal, Drawer, Popover, Select). Standing down
 * for a layer that still relies on Radix's gated dismiss would turn Escape into
 * a no-op for it, since standing down marks the event. Add a slot here only
 * once its component self-closes.
 */
const ESCAPE_CLAIMANTS = [
  ...OPEN_MODAL_LAYERS,
  "[data-slot='popover-content'][data-state='open']",
  "[data-slot='select-content'][data-state='open']",
];

function openModalLayers() {
  return [...document.querySelectorAll(OPEN_MODAL_LAYERS.join(", "))];
}

function isAfter(node: Element, layer: Element) {
  return (
    !layer.contains(node) &&
    (node.compareDocumentPosition(layer) & Node.DOCUMENT_POSITION_FOLLOWING) !==
      0
  );
}

/**
 * The layer set as it was BEFORE any dismiss handler for the current
 * pointer-down ran.
 *
 * Reading `data-state` live is not enough: the layer above handles the same
 * event, and its dismiss runs through `flushSync` (Radix dispatches these as
 * discrete events), so by the time a lower layer's handler asks the question
 * the layer above has already flipped itself to `data-state="closed"` — or left
 * the DOM. Whichever handler runs first then decides the answer, which is a
 * race on listener-registration order.
 *
 * A capture-phase listener on the document runs before every bubble-phase
 * dismiss handler, no matter when those registered, so the snapshot it takes is
 * the state of the world at the moment of the click.
 */
let lastPointerDown: { event: Event; guarded: Set<Element> } | undefined;

function snapshotLayersBeforeDismiss(event: Event) {
  const layers = openModalLayers();
  const guarded = new Set<Element>();

  if (layers.length > 0) {
    for (const consumer of document.querySelectorAll(GUARD_CONSUMERS)) {
      if (layers.some((layer) => isAfter(consumer, layer))) guarded.add(consumer);
    }
  }

  lastPointerDown = { event, guarded };
}

if (typeof document !== "undefined") {
  // Both dismiss paths need the pre-handler view: pointer-down for outside
  // clicks, keydown for Escape.
  for (const type of ["pointerdown", "keydown"]) {
    document.addEventListener(type, snapshotLayersBeforeDismiss, {
      capture: true,
    });
  }
}

/**
 * Is a modal layer stacked ABOVE `node` — a dialog, alert-dialog or drawer that
 * opened after it?
 *
 * "Above" is read as document order: portalled layers are appended to the body
 * in mount order, so a layer that FOLLOWS `node` opened later. That distinction
 * is what separates the two cases a plain "is a drawer open?" check conflates:
 *
 * - popover opened first, drawer opened on top  → drawer follows → above
 * - popover opened from inside an open drawer   → drawer precedes → NOT above,
 *   so the popover still dismisses on outside clicks as it should
 */
export function hasModalLayerAfter(
  node: Element | null | undefined,
  /**
   * The originating pointer-down, when there is one (Radix hands it over as
   * `event.detail.originalEvent`). Given it, the answer comes from the snapshot
   * taken before any dismiss handler ran, so it holds for the very event that
   * closes the layer above — which is exactly the click a user makes to dismiss
   * a Drawer while a Popover waits behind it.
   */
  event?: Event | null,
) {
  if (!node) return false;

  if (event && lastPointerDown?.event === event) {
    return lastPointerDown.guarded.has(node);
  }

  return openModalLayers().some((layer) => isAfter(node, layer));
}

/**
 * Is a layer above `node` that should receive Escape instead of it?
 *
 * Needed because Radix couples "I keep this layer" with "nobody else acts": its
 * escape handler marks the keydown `defaultPrevented` when it dismisses, and
 * every other DismissableLayer stack reads that as already-handled. A component
 * that wants to own Escape has to decide for itself whether it is the target.
 */
export function hasEscapeClaimantAfter(node: Element | null | undefined) {
  if (!node) return false;

  return [...document.querySelectorAll(ESCAPE_CLAIMANTS.join(", "))].some(
    (layer) => isAfter(node, layer),
  );
}

/**
 * Every floating layer we know of, open only. Used to find the topmost one; the
 * unadopted entries are here so that we ABSTAIN when one of them is on top,
 * rather than hijacking an Escape we cannot deliver.
 */
const ANY_OPEN_LAYER = [
  ...OPEN_MODAL_LAYERS,
  "[data-slot='popover-content'][data-state='open']",
  "[data-slot='select-content'][data-state='open']",
  "[data-slot='combobox-content'][data-state='open']",
  "[data-slot='dropdown-menu-content'][data-state='open']",
  "[data-slot='context-menu-content'][data-state='open']",
  "[data-slot='menubar-content'][data-state='open']",
  "[data-slot='sheet-content'][data-state='open']",
];

type EscapeTarget = { getNode: () => Element | null; close: () => void };

const escapeTargets = new Set<EscapeTarget>();

/**
 * Claim Escape for one layer while it is open.
 *
 * Radix decides who gets Escape by asking "am I the highest MOUNTED layer in my
 * own DismissableLayerContext". Two things make that unusable across our stack:
 *
 * - A layer keeps its registration until its exit animation ends, so a closed
 *   panel on its way out (or one whose Presence never resolves) stays "highest"
 *   and every layer beneath it goes deaf.
 * - Each context only knows its own layers, so a vaul Drawer and a radix Popover
 *   both believe they are highest and coordinate only through the shared
 *   `event.defaultPrevented` flag.
 *
 * So the layers we own decide it here instead, from the DOM: topmost OPEN layer
 * by document order wins, and the event is stopped before Radix's per-layer
 * handlers (also capture-phase, but registered later) can see it. Layers we do
 * not own keep Radix's behaviour: if one of them is topmost, this steps aside.
 */
export function registerEscapeTarget(
  /**
   * Resolved at keypress time, not at registration time: a layer's node arrives
   * (and is re-attached on every render, briefly as `null`) independently of
   * when its owner gets to register, so capturing the node here would drop
   * claims for reasons that have nothing to do with the layer being open.
   */
  getNode: () => Element | null,
  close: () => void,
) {
  const target: EscapeTarget = { getNode, close };
  escapeTargets.add(target);

  return () => {
    escapeTargets.delete(target);
  };
}

function takeEscape(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;

  const open = [...document.querySelectorAll(ANY_OPEN_LAYER.join(", "))];
  if (open.length === 0) return;

  const topmost = open.reduce((a, b) => (isAfter(a, b) ? b : a));
  const target = [...escapeTargets].find((entry) => entry.getNode() === topmost);
  if (!target) return;

  event.preventDefault();
  // Radix's own handlers are capture-phase on the document too, so stopping here
  // is what keeps a lingering closed layer from swallowing this keypress.
  event.stopImmediatePropagation();
  target.close();
}

if (typeof document !== "undefined") {
  document.addEventListener("keydown", takeEscape, { capture: true });
}
