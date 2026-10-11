<!--
@component
TransitionBars.svelte — Where people in a job in one census were working ten
years later, from linked census records. Shows the top destinations as
horizontal bars; the bar for staying in the same job is marked.

Props:
- transitions: { from, to, basis, category, linkedPeople,
                 destinations: [{ label, share, same, other }] }
  `same` marks staying in the job; `other` marks the "Everything else" remainder.
-->
<script>
  import { formatNumber, formatShare } from '$lib/jobs.js';

  let { transitions } = $props();

  const max = $derived(
    Math.max(...transitions.destinations.map((d) => d.share))
  );
</script>

<div class="transitions">
  <p class="basis">
    {formatNumber(transitions.linkedPeople)} people
    {#if transitions.basis === 'exact'}
      who worked as {transitions.category.toLowerCase()} in {transitions.from}
    {:else}
      in the census category “{transitions.category}” in {transitions.from},
      which includes this job
    {/if}
    were found again in the {transitions.to} census. This is what they were doing
    then.
  </p>

  <ol class="bars">
    {#each transitions.destinations as d (d.label)}
      <li class:same={d.same} class:other={d.other}>
        <span class="label">
          {d.label}
          {#if d.same}<span class="same-note">(same job)</span>{/if}
        </span>
        <span class="track" aria-hidden="true">
          <span class="bar" style:width="{(d.share / max) * 100}%"></span>
        </span>
        <span class="value">{formatShare(d.share)}</span>
      </li>
    {/each}
  </ol>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .basis {
    max-width: 62ch;
    color: var(--color-text);
  }

  .bars {
    list-style: none;
    margin: var(--spacing-sm) 0 0;
    padding: 0;
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
  }

  li {
    display: grid;
    grid-template-columns: minmax(12rem, 2fr) 3fr 3.5rem;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) 0;
    border-bottom: var(--border-width-thin) solid var(--color-border);

    @include mobile {
      grid-template-columns: 1fr 3rem;
      row-gap: var(--spacing-xxs);

      .track {
        grid-column: 1 / -1;
        grid-row: 2;
      }
    }
  }

  .label {
    color: var(--color-dark);
  }

  .same-note {
    color: var(--color-medium-gray);
  }

  .track {
    display: block;
    height: 0.75rem;
  }

  .bar {
    display: block;
    height: 100%;
    background: var(--color-faint-bar);
  }

  .same .bar {
    background: var(--color-accent);
  }

  // The remainder is not a destination, so it is drawn as an outline.
  .other .bar {
    background: transparent;
    border: var(--border-width-thin) dashed var(--color-rule);
  }

  .other .label {
    color: var(--color-medium-gray);
  }

  .value {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--color-dark);
  }
</style>
