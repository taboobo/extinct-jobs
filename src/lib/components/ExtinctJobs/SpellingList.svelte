<!--
@component
SpellingList.svelte — The most common ways census takers wrote a job down,
with how many sample records used each form and the years it appears.

Props:
- spellings: [{ writtenAs, records, firstYear, lastYear }] from jobs.json
-->
<script>
  import { formatNumber } from '$lib/jobs.js';

  let { spellings = [] } = $props();

  // "OPERATOR (industry: TELEGRAPH)" -> written: OPERATOR, industry: TELEGRAPH
  function split(writtenAs) {
    const m = writtenAs.match(/^(.*) \(industry: (.*)\)$/);
    return m
      ? { written: m[1], industry: m[2] }
      : { written: writtenAs, industry: null };
  }
</script>

<ul class="spellings">
  {#each spellings as s (s.writtenAs)}
    {@const parts = split(s.writtenAs)}
    <li>
      <span class="written">{parts.written}</span>
      {#if parts.industry}
        <span class="industry">with industry “{parts.industry}”</span>
      {/if}
      <span class="meta">
        {formatNumber(s.records)} records,
        {s.firstYear === s.lastYear
          ? s.firstYear
          : `${s.firstYear}–${s.lastYear}`}
      </span>
    </li>
  {/each}
</ul>

<style lang="scss">
  .spellings {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--spacing-sm);
    padding: var(--spacing-xs) 0;
    border-bottom: var(--border-width-thin) solid var(--color-border);
  }

  .written {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-wide);
    color: var(--color-accent);
  }

  .industry,
  .meta {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
  }

  .meta {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }
</style>
