<!--
@component
HoverCard.svelte — A link or label that opens a small preview card, like the
link previews on gwern.net.

- Mouse: opens after a short delay on hover, stays open while the pointer is
  over the trigger or the card.
- Keyboard: opens on focus, closes on blur or Esc.
- Touch: the first tap opens the card (the card has its own link), a second
  tap on the trigger follows the link.
Without JavaScript the trigger is a plain link, so nothing is lost.

Props:
- label: trigger text
- href: optional link target; without it the trigger is a button
- card: snippet with the card's contents
-->
<script>
  import { onDestroy } from 'svelte';

  let { label, href = null, card } = $props();

  const OPEN_DELAY = 350;
  const CLOSE_DELAY = 200;
  const id = `hovercard-${Math.random().toString(36).slice(2, 9)}`;

  let open = $state(false);
  let trigger = $state();
  let position = $state({ top: 0, left: 0, above: false });
  let openTimer;
  let closeTimer;

  function place() {
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const above = r.bottom > window.innerHeight * 0.6;
    position = {
      left,
      top: above ? r.top - 8 : r.bottom + 8,
      above,
    };
  }

  function show() {
    clearTimeout(closeTimer);
    place();
    open = true;
  }

  function hide() {
    clearTimeout(openTimer);
    open = false;
  }

  function scheduleOpen(event) {
    if (event.pointerType === 'touch') return;
    clearTimeout(closeTimer);
    openTimer = setTimeout(show, OPEN_DELAY);
  }

  function scheduleClose() {
    clearTimeout(openTimer);
    closeTimer = setTimeout(hide, CLOSE_DELAY);
  }

  let lastPointer = 'mouse';
  let pointerDownAt = -Infinity;

  function onPointerDown(event) {
    lastPointer = event.pointerType;
    pointerDownAt = performance.now();
  }

  // Focus opens the card only when it comes from the keyboard; taps and clicks
  // also focus the link, and are handled by the pointer and click handlers.
  function onFocusIn() {
    if (performance.now() - pointerDownAt > 600) show();
  }

  function onTriggerClick(event) {
    // On touch, the first tap previews instead of navigating.
    if (lastPointer === 'touch' && !open) {
      event.preventDefault();
      show();
    } else if (!href) {
      open ? hide() : show();
    }
  }

  function onKeydown(event) {
    if (event.key !== 'Escape' || !open) return;
    // Return focus to the trigger if it was on the trigger or inside the card.
    const hadFocus = trigger?.parentElement?.contains(document.activeElement);
    hide();
    if (hadFocus) trigger?.focus();
  }

  function onFocusOut(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
  }

  onDestroy(() => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  });
</script>

<svelte:window
  onscroll={() => open && place()}
  onresize={() => open && place()}
  onkeydown={onKeydown}
/>

<span
  class="hovercard"
  role="presentation"
  onpointerenter={scheduleOpen}
  onpointerleave={scheduleClose}
  onpointerdown={onPointerDown}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
>
  {#if href}
    <a
      bind:this={trigger}
      class="trigger"
      {href}
      aria-describedby={open ? id : undefined}
      onclick={onTriggerClick}>{label}</a
    >
  {:else}
    <button
      bind:this={trigger}
      type="button"
      class="trigger"
      aria-expanded={open}
      aria-controls={id}
      onclick={onTriggerClick}>{label}</button
    >
  {/if}

  {#if open}
    <span
      {id}
      class="card"
      class:above={position.above}
      role="dialog"
      aria-label={label}
      style:left="{position.left}px"
      style:top="{position.top}px"
    >
      {@render card()}
    </span>
  {/if}
</span>

<style lang="scss">
  .hovercard {
    display: inline;
  }

  .trigger {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-align: inherit;
    // Dotted underline means "has a preview"; plain links use solid underlines.
    text-decoration: underline dotted;
    text-decoration-color: var(--color-medium-gray);
    text-underline-offset: 0.2em;
  }

  .trigger:hover,
  .trigger[aria-expanded='true'] {
    color: var(--color-accent);
    text-decoration-color: currentColor;
  }

  .card {
    position: fixed;
    z-index: 20;
    display: block;
    width: min(22rem, calc(100vw - 1rem));
    padding: var(--spacing-sm);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-text);
    text-align: left;
    background: var(--color-white);
    border: var(--border-width-thin) solid var(--color-rule);
    box-shadow: 0 6px 24px var(--color-shadow);

    &.above {
      transform: translateY(-100%);
    }
  }
</style>
