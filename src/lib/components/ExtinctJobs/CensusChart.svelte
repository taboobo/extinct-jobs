<!--
@component
CensusChart.svelte — Bar chart of the estimated number of Americans who wrote a
job title on the census, 1850–1940. Bars based on fewer than 10 sample records
are drawn faint. 1890 is marked as missing: those records burned in 1921.

Props:
- series: [{ year, people, records, reliable }] from jobs.json
- name: the job name, used in the accessible description
- source: 'category' (everyone the census coded to this job) or 'title' (people whose
  written job title matched; a minimum count)
-->
<script>
  import { CENSUS_YEARS, formatNumber } from '$lib/jobs.js';

  let { series = [], name = 'this job', source = 'title' } = $props();

  // Drawn at the figure's real width so text stays a readable size on phones.
  let width = $state(640);
  const W = $derived(Math.max(280, width));
  const H = $derived(W < 480 ? 220 : 260);
  const PAD = { top: 16, right: 8, bottom: 28, left: 44 };
  const plotW = $derived(W - PAD.left - PAD.right);
  const plotH = $derived(H - PAD.top - PAD.bottom);

  const byYear = $derived(new Map(series.map((s) => [s.year, s])));
  const max = $derived(Math.max(1, ...series.map((s) => s.people)));

  // A "nice" top for the y axis and three gridlines.
  const yMax = $derived.by(() => {
    const step = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / step) * step;
  });
  const ticks = $derived([0, yMax / 2, yMax]);
  const slot = $derived(plotW / CENSUS_YEARS.length);
  const barW = $derived(slot * 0.62);
  // On narrow screens, label every other year (1850, 1870, ...).
  const showYear = (i) => W >= 480 || i % 2 === 0;

  const y = (v) => PAD.top + plotH - (v / yMax) * plotH;
  const hasFaint = $derived(series.some((s) => s.people > 0 && !s.reliable));

  function short(n) {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  }
</script>

<figure class="census-chart" bind:clientWidth={width}>
  <svg
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-labelledby="census-chart-desc"
  >
    <desc id="census-chart-desc">
      Estimated number of people working as {name} in each U.S. census from 1850 to
      1940. A table with the same numbers follows.
    </desc>

    {#each ticks as t (t)}
      <line class="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
      <text class="axis" x={PAD.left - 8} y={y(t) + 4} text-anchor="end">
        {short(t)}
      </text>
    {/each}

    {#each CENSUS_YEARS as year, i (year)}
      {@const point = byYear.get(year)}
      {@const cx = PAD.left + i * slot + slot / 2}
      {#if year === 1890}
        <text
          class="missing"
          x={cx}
          y={PAD.top + plotH - 6}
          text-anchor="middle">lost</text
        >
      {:else if point && point.people > 0}
        <rect
          class:faint={!point.reliable}
          x={cx - barW / 2}
          y={y(point.people)}
          width={barW}
          height={PAD.top + plotH - y(point.people)}
        >
          <title>
            {year}: about {formatNumber(point.people)} people ({point.records}
            sample records)
          </title>
        </rect>
      {/if}
      {#if showYear(i)}
        <text class="axis year" x={cx} y={H - 8} text-anchor="middle"
          >{year}</text
        >
      {/if}
    {/each}
  </svg>

  <table class="sr-only">
    <caption>Estimated people working as {name}, by census year</caption>
    <thead>
      <tr><th scope="col">Year</th><th scope="col">People</th></tr>
    </thead>
    <tbody>
      {#each CENSUS_YEARS as year (year)}
        {@const point = byYear.get(year)}
        <tr>
          <th scope="row">{year}</th>
          <td>
            {#if year === 1890}records lost{:else}{formatNumber(
                point?.people ?? 0
              )}{/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <figcaption>
    {#if source === 'category'}
      Estimated number of people the census counted in this job.
    {:else}
      Estimated number of people who wrote this job title on the census. This is
      a minimum: unusual spellings are missed.
    {/if}
    {#if hasFaint}
      Pale bars are based on fewer than 10 sample records and are rough.
    {/if}
    The 1890 census records were destroyed in a 1921 fire.
  </figcaption>
</figure>

<style lang="scss">
  .census-chart {
    margin: 0;
    max-width: 52rem;
  }

  svg {
    display: block;
    max-width: 100%;
  }

  .grid {
    stroke: var(--color-rule);
    stroke-width: 1;
  }

  .axis {
    font-family: var(--font-sans);
    font-size: 12px;
    fill: var(--color-medium-gray);
    font-variant-numeric: tabular-nums;
  }

  .missing {
    font-family: var(--font-sans);
    font-size: 11px;
    font-style: italic;
    fill: var(--color-margin);
  }

  rect {
    fill: var(--color-accent);
  }

  rect.faint {
    fill: var(--color-faint-bar);
  }

  figcaption {
    margin-top: var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 60ch;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
