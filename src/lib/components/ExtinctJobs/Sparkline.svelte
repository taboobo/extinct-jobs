<!--
@component
Sparkline.svelte — A tiny bar trend of how many people held a job in each
census, 1850–1940. Used in the job list. The peak year uses the highlight
color, rough estimates (fewer than 10 records) are paler. 1890 is left empty
(records lost).

Props:
- series: [{ year, people, records, reliable }] from jobs.json
- width, height: drawing size in pixels
-->
<script>
  import { CENSUS_YEARS, formatNumber, peak } from '$lib/jobs.js';

  let { series = [], width = 96, height = 22 } = $props();

  const byYear = $derived(new Map(series.map((s) => [s.year, s])));
  const max = $derived(Math.max(1, ...series.map((s) => s.people)));
  const top = $derived(peak(series));
  const slot = $derived(width / CENSUS_YEARS.length);
</script>

<svg
  class="sparkline"
  viewBox="0 0 {width} {height}"
  {width}
  {height}
  role="img"
  aria-label={top
    ? `Peak of about ${formatNumber(top.people)} people in ${top.year}`
    : 'No census records'}
>
  <line
    class="baseline"
    x1="0"
    x2={width}
    y1={height - 0.5}
    y2={height - 0.5}
  />
  {#each CENSUS_YEARS as year, i (year)}
    {@const point = byYear.get(year)}
    {#if point && point.people > 0}
      {@const h = Math.max(1.5, (point.people / max) * (height - 2))}
      <rect
        class:peak={top && year === top.year}
        class:faint={!point.reliable}
        x={i * slot + 1}
        y={height - 1 - h}
        width={slot - 2}
        height={h}
      />
    {/if}
  {/each}
</svg>

<style lang="scss">
  .sparkline {
    display: block;
    overflow: visible;
  }

  .baseline {
    stroke: var(--color-rule);
    stroke-width: 1;
  }

  rect {
    fill: var(--color-bar);
  }

  rect.peak {
    fill: var(--color-accent);
  }

  rect.faint {
    opacity: 0.45;
  }
</style>
