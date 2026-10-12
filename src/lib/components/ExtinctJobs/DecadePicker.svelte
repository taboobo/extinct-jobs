<!--
@component
DecadePicker.svelte — Buttons for choosing a census year (e.g. "1910").
Hidden when there is only one choice.

Props:
- options: button labels in display order, e.g. ['1900', '1910', '1920']
- selected: index of the chosen option (bindable)
- label: accessible name for the group
-->
<script>
  let {
    options = [],
    selected = $bindable(0),
    label = 'Census years',
  } = $props();
</script>

{#if options.length > 1}
  <div class="decades" role="group" aria-label={label}>
    {#each options as option, i (option)}
      <button
        type="button"
        aria-pressed={selected === i}
        onclick={() => (selected = i)}>{option}</button
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
