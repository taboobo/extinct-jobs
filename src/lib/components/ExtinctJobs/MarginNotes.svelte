<!--
@component
MarginNotes.svelte — Lays out content with notes in a margin column beside it
on wide screens, and stacks the notes below the content on narrow screens
(where they read in order, which also suits screen readers).

Props:
- children: the main content
- notes: snippet of Sidenote components
-->
<script>
  let { children, notes } = $props();
</script>

<div class="margin-notes">
  <div class="main">{@render children()}</div>
  <div class="notes">{@render notes()}</div>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .margin-notes {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing-sm);
    align-items: start;

    @include desktop {
      grid-template-columns: minmax(0, 1fr) 15rem;
      gap: var(--spacing-lg);
    }
  }

  .main {
    min-width: 0;
  }
</style>
