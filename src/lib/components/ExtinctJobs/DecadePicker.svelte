<!--
@component
DecadePicker.svelte — Buttons for choosing which pair of censuses to show
(e.g. "1910 to 1920"). Hidden when there is only one choice.

Props:
- flows: [{ from, to }] in display order
- selected: index of the chosen pair (bindable)
- label: accessible name for the group
-->
<script>
  let {
    flows = [],
    selected = $bindable(0),
    label = 'Census years',
  } = $props();
</script>

{#if flows.length > 1}
  <div class="decades" role="group" aria-label={label}>
    {#each flows as flow, i (flow.from)}
      <button
        type="button"
        aria-pressed={selected === i}
        onclick={() => (selected = i)}>{flow.from} to {flow.to}</button
      >
    {/each}
  </div>
{/if}

<style lang="scss">
  .decades {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xxs);
    margin-bottom: var(--spacing-sm);
  }

  button {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    padding: var(--spacing-xxs) var(--spacing-xs);
    color: var(--color-text);
    background: transparent;
    border: var(--border-width-thin) solid var(--color-rule);
    cursor: pointer;
  }

  button:hover {
    border-color: var(--color-accent);
  }

  button[aria-pressed='true'] {
    color: var(--color-white);
    background: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>
