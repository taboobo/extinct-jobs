<!--
@component
Sidenote.svelte — A short note about the content beside it (a caveat, a source,
a definition). Place inside MarginNotes' `notes` snippet so it sits in the
margin on wide screens and below the content on narrow ones.

Props:
- children: the note's content
-->
<script>
  let { children } = $props();
</script>

<aside class="sidenote">{@render children()}</aside>

<style lang="scss">
  .sidenote {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    padding-left: var(--spacing-xs);
    border-left: var(--border-width-divider) solid var(--color-rule);
  }

  .sidenote + :global(.sidenote) {
    margin-top: var(--spacing-sm);
  }
</style>
