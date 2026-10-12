<!--
@component
TransitionBars.svelte — Job moves between two censuses, from linked census
records, as horizontal bars. Two directions:
- 'to': where people in a job in the first census were working in the second.
- 'from': what people in a job in the second census had been doing in the first.
The bar for the same job is marked; the "Everything else" remainder is drawn as
an outline. Category names open a CategoryCard preview when `categories` is given.

Props:
- flow: { from, to, basis, category, linkedPeople, destinations | origins:
          [{ code, label, share, same, other }] }
- direction: 'to' (default) or 'from'
- categories: optional map of code -> { label, occupational, series, jobId }
-->
<script>
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import CategoryCard from '$lib/components/ExtinctJobs/CategoryCard.svelte';
  import { base } from '$app/paths';
  import { formatNumber, formatShare } from '$lib/jobs.js';

  let { flow, direction = 'to', categories = {} } = $props();

  const items = $derived(direction === 'to' ? flow.destinations : flow.origins);
  const max = $derived(Math.max(...items.map((d) => d.share)));
  const what = $derived(
    flow.basis === 'exact'
      ? flow.category.toLowerCase()
      : `the census category “${flow.category}”, which includes this job`
  );
</script>

<div class="transitions">
  <p class="basis">
    {#if direction === 'to'}
      {formatNumber(flow.linkedPeople)} people working as {what} in {flow.from}
      were found again in the {flow.to} census. This is what they were doing then.
    {:else}
      {formatNumber(flow.linkedPeople)} people working as {what} in {flow.to} were
      also found in the {flow.from} census, with a job. This is what they had been
      doing then.
    {/if}
  </p>

  <ol class="bars">
    {#each items as d (d.label)}
      {@const category = d.code != null ? categories[d.code] : null}
      <li class:same={d.same} class:other={d.other}>
        <span class="label">
          {#if category}
            <HoverCard
              label={d.label}
              href={category.jobId ? `${base}/jobs/${category.jobId}` : null}
            >
              {#snippet card()}<CategoryCard {category} />{/snippet}
            </HoverCard>
          {:else}
            {d.label}
          {/if}
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
