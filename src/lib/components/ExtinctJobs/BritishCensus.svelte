<!--
@component
BritishCensus.svelte — How many people did a job in Britain and Ireland in the
1841, 1851 and 1861 censuses, from the published census report tables. Each
row shows which census titles were counted; the full list opens in a preview.

Props:
- uk: { counts: [{ year, area, people, males, females, titles: [{ title, people }] }],
        note } from jobs.json
-->
<script>
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import { formatNumber } from '$lib/jobs.js';

  let { uk } = $props();
</script>

<div class="british-census">
  <table>
    <thead>
      <tr>
        <th scope="col">Census</th>
        <th scope="col">Area</th>
        <th scope="col" class="num">People</th>
        <th scope="col">Counted as</th>
      </tr>
    </thead>
    <tbody>
      {#each uk.counts as row (`${row.year}-${row.area}`)}
        <tr>
          <th scope="row">{row.year}</th>
          <td>{row.area}</td>
          <td class="num">{formatNumber(row.people)}</td>
          <td class="titles">
            <HoverCard
              label={row.titles.length === 1
                ? row.titles[0].title
                : `${row.titles[0].title} and ${row.titles.length - 1} more`}
            >
              {#snippet card()}
                <span class="title-card">
                  <span class="card-title">{row.year}, {row.area}</span>
                  {#each row.titles as t (t.title)}
                    <span class="title-row"
                      >{t.title}{#if t.people != null}: {formatNumber(
                          t.people
                        )}{/if}</span
                    >
                  {/each}
                  <span class="card-meta"
                    >{formatNumber(row.males)} men, {formatNumber(row.females)} women</span
                  >
                </span>
              {/snippet}
            </HoverCard>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if uk.note}<p class="note">{uk.note}</p>{/if}
  <p class="source">
    From the published census reports for Great Britain (1841, 1851) and for
    England and Wales, Scotland and Ireland (1861), as transcribed by
    <a href="https://dittobooks.co.uk/extras/census">Ditto Books</a>. Scans of
    the originals are at <a href="https://www.histpop.org">histpop.org</a>.
  </p>
</div>

<style lang="scss">
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
  }

  th,
  td {
    text-align: left;
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 0;
    border-bottom: var(--border-width-thin) solid var(--color-border);
    vertical-align: top;
  }

  thead th {
    font-weight: var(--font-weight-medium);
    color: var(--color-medium-gray);
    border-bottom: var(--border-width-divider) solid var(--color-rule);
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .title-card,
  .title-card > span {
    display: block;
  }

  .card-title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-dark);
    margin-bottom: var(--spacing-xxs);
  }

  .card-meta {
    margin-top: var(--spacing-xs);
    color: var(--color-medium-gray);
  }

  .note,
  .source {
    margin-top: var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 65ch;
  }
</style>
