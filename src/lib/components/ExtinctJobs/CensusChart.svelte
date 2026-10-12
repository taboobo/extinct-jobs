<!--
@component
CensusChart.svelte — Bar chart of the estimated number of Americans who wrote a
job title on the census, 1850–1940. The peak year is highlighted and labelled;
bars based on fewer than 10 sample records are striped ("rough"), with a legend.
1890 is marked as missing: those records burned in 1921. Hovering, tapping or
tabbing to a year shows its number of people and sample records.

Props:
- series: [{ year, people, records, reliable }] from jobs.json
- name: the job name, used in the accessible description
- source: 'category' (everyone the census coded to this job) or 'title' (people whose
  written job title matched; a minimum count)
-->
<script>
  import { CENSUS_YEARS, formatNumber, peak } from '$lib/jobs.js';

  let { series = [], name = 'this job', source = 'title' } = $props();

  // Drawn at the figure's real width so text stays a readable size on phones.
  let width = $state(640);
  const W = $derived(Math.max(280, width));
  const H = $derived(W < 480 ? 220 : 260);
  const PAD = { top: 30, right: 8, bottom: 28, left: 44 };
  const plotW = $derived(W - PAD.left - PAD.right);
  const plotH = $derived(H - PAD.top - PAD.bottom);

  const byYear = $derived(new Map(series.map((s) => [s.year, s])));
  const top = $derived(peak(series));
  const hasRough = $derived(series.some((s) => s.people > 0 && !s.reliable));
  const hatchId = `hatch-${Math.random().toString(36).slice(2, 9)}`;

  // The year being hovered, tapped or focused; its numbers show in a tooltip.
  let active = $state(null);
  const activePoint = $derived(active ? byYear.get(active) : null);
  const activeX = $derived(
    active ? PAD.left + CENSUS_YEARS.indexOf(active) * slot + slot / 2 : 0
  );
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

  function short(n) {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  }
</script>

<div class="census-chart">
  <figure bind:clientWidth={width}>
    <svg
      viewBox="0 0 {W} {H}"
      width={W}
      height={H}
      role="img"
      aria-labelledby="census-chart-desc"
    >
      <desc id="census-chart-desc">
        Estimated number of people working as {name} in each U.S. census from 1850
        to 1940. A table with the same numbers follows.
      </desc>

      <defs>
        <pattern
          id={hatchId}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line class="hatch" x1="0" y1="0" x2="0" y2="6" />
        </pattern>
      </defs>

      {#each ticks as t (t)}
        <line
          class="grid"
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(t)}
          y2={y(t)}
        />
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
          {@const isPeak = top && year === top.year}
          <rect
            class:peak={isPeak}
            class:rough={!point.reliable}
            style:fill={!point.reliable ? `url(#${hatchId})` : undefined}
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
          <rect
            class="hit"
            class:active={active === year}
            x={cx - slot / 2}
            y={PAD.top}
            width={slot}
            height={plotH}
            tabindex="0"
            role="img"
            aria-label="{year}: about {formatNumber(
              point.people
            )} people, {formatNumber(
              point.records
            )} sample records{point.reliable ? '' : ', a rough estimate'}"
            onpointerenter={() => (active = year)}
            onpointerdown={() => (active = year)}
            onpointerleave={() => (active = null)}
            onfocus={() => (active = year)}
            onblur={() => (active = null)}
          />
          {#if isPeak}
            <text
              class="peak-label"
              x={cx}
              y={y(point.people) - 8}
              text-anchor="middle">{formatNumber(point.people)}</text
            >
          {/if}
        {/if}
        {#if showYear(i)}
          <text class="axis year" x={cx} y={H - 8} text-anchor="middle"
            >{year}</text
          >
        {/if}
      {/each}
    </svg>

    {#if activePoint}
      <div
        class="tip"
        style:left="{(activeX / W) * 100}%"
        style:top="{y(activePoint.people)}px"
        aria-hidden="true"
      >
        <strong>{active}</strong>
        <span>{formatNumber(activePoint.people)} people</span>
        <span class="tip-meta"
          >{formatNumber(activePoint.records)} sample records{activePoint.reliable
            ? ''
            : ', rough'}</span
        >
      </div>
    {/if}

    <figcaption>
      <span class="legend">
        <span class="key"
          ><span class="swatch peak-swatch" aria-hidden="true"></span>Peak year</span
        >
        <span class="key"
          ><span class="swatch" aria-hidden="true"></span>Other years</span
        >
        {#if hasRough}
          <span class="key"
            ><span class="swatch rough-swatch" aria-hidden="true"></span>Rough
            estimate (fewer than 10 sample records)</span
          >
        {/if}
      </span>
      {#if source === 'category'}
        People the census counted in this job, by census year.
      {:else}
        People who wrote this job title on the census, by census year. A
        minimum: unusual spellings are missed.
      {/if}
    </figcaption>
  </figure>

  <details class="numbers">
    <summary>Show the numbers</summary>
    <table>
      <caption class="sr-only"
        >Estimated people working as {name}, by census year</caption
      >
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">People</th>
          <th scope="col">Sample records</th>
        </tr>
      </thead>
      <tbody>
        {#each CENSUS_YEARS as year (year)}
          {@const point = byYear.get(year)}
          <tr>
            <th scope="row">{year}</th>
            {#if year === 1890}
              <td colspan="2">Records lost</td>
            {:else}
              <td>{formatNumber(point?.people ?? 0)}</td>
              <td>{formatNumber(point?.records ?? 0)}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</div>

<style lang="scss">
  figure {
    position: relative;
    margin: 0;
  }

  .hit {
    fill: transparent;
    cursor: default;
    outline: none;
  }

  .hit.active,
  .hit:focus-visible {
    fill: var(--color-shadow);
  }

  .tip {
    position: absolute;
    transform: translate(-50%, calc(-100% - 10px));
    display: flex;
    flex-direction: column;
    padding: var(--spacing-xxs) var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-snug);
    white-space: nowrap;
    color: var(--color-text);
    background: var(--color-white);
    border: var(--border-width-thin) solid var(--color-rule);
    box-shadow: 0 4px 14px var(--color-shadow);
    pointer-events: none;
  }

  .tip-meta {
    font-size: var(--font-size-xs);
    color: var(--color-medium-gray);
  }

  .census-chart {
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
    fill: var(--color-bar);
  }

  rect.peak:not(.rough) {
    fill: var(--color-accent);
  }

  rect.rough {
    stroke: var(--color-bar);
    stroke-width: 1;
  }

  rect.peak.rough {
    stroke: var(--color-accent);
  }

  .hatch {
    stroke: var(--color-bar);
    stroke-width: 3;
  }

  .peak-label {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
    fill: var(--color-accent);
    font-variant-numeric: tabular-nums;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xxs) var(--spacing-md);
    margin-bottom: var(--spacing-xxs);
    color: var(--color-text);
  }

  .key {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xxs);
  }

  .swatch {
    display: inline-block;
    width: 0.9rem;
    height: 0.9rem;
    background: var(--color-bar);
  }

  .peak-swatch {
    background: var(--color-accent);
  }

  .rough-swatch {
    background: repeating-linear-gradient(
      45deg,
      var(--color-bar) 0 2px,
      transparent 2px 4px
    );
    outline: 1px solid var(--color-bar);
    outline-offset: -1px;
  }

  figcaption {
    margin-top: var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 60ch;
  }

  .numbers {
    margin-top: var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);

    summary {
      color: var(--color-accent);
      cursor: pointer;
    }

    table {
      margin-top: var(--spacing-xs);
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }

    th,
    td {
      padding: var(--spacing-xxs) var(--spacing-sm) var(--spacing-xxs) 0;
      text-align: right;
      border-bottom: var(--border-width-thin) solid var(--color-border);
    }

    th[scope='row'],
    th[scope='col']:first-child {
      text-align: left;
    }
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
