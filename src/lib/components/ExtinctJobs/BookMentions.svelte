<!--
@component
BookMentions.svelte — How often a job's name appeared in English-language books,
1800–2019 (Google Books Ngram, 5-year averages per million words), as a line
with the peak marked. Hovering, tapping or tabbing to a point shows its value.

Props:
- books: { spellings, withPlurals, points: [{ year, perMillion }], peakYear, note,
  peakCaveat } from jobs.json; spellings are every form searched (summed), plurals
  counted when withPlurals is true. peakCaveat ({ afterEnd, note, endedByYear,
  endCentury } or null) adds a "?" marker by the peak whose card says why the peak
  may not be about the job.
- name: the job name, used in the accessible description
-->
<script>
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import { centuryLabel } from '$lib/jobs.js';

  let { books, name = 'this job' } = $props();

  let width = $state(640);
  const W = $derived(Math.max(280, width));
  const H = 160;
  const PAD = { top: 22, right: 12, bottom: 24, left: 12 };
  const plotW = $derived(W - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;

  const points = $derived(books.points);
  const first = $derived(points[0].year);
  const last = $derived(points[points.length - 1].year);
  const max = $derived(Math.max(...points.map((p) => p.perMillion), 1e-9));
  const x = (year) => PAD.left + ((year - first) / (last - first)) * plotW;
  const y = (v) => PAD.top + plotH - (v / max) * plotH;
  const path = $derived(
    points
      .map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.perMillion)}`)
      .join(' ')
  );
  const peak = $derived(points.find((p) => p.year === books.peakYear));
  const ticks = [1800, 1850, 1900, 1950, 2000];

  // Keep "Peak 2015" inside the chart near either edge; the "?" marker for a
  // questionable peak sits beside the label, on whichever side has room.
  const LABEL_HALF = 30;
  const DOT = 16;
  const caveat = $derived(books.peakCaveat ?? null);
  const labelAnchor = $derived.by(() => {
    if (!peak) return 'middle';
    const px = x(peak.year);
    if (px - LABEL_HALF < PAD.left) return 'start';
    if (px + LABEL_HALF + (caveat ? DOT + 6 : 0) > W - PAD.right) return 'end';
    return 'middle';
  });
  const caveatLeft = $derived.by(() => {
    if (!peak) return 0;
    const px = x(peak.year);
    if (labelAnchor === 'start') return px + 2 * LABEL_HALF + 4;
    if (labelAnchor === 'end') return px - 2 * LABEL_HALF - DOT - 4;
    return px + LABEL_HALF + 4;
  });

  let active = $state(null);
  const activePoint = $derived(active == null ? null : points[active]);

  // “a”, “b” and “c”
  const spellingList = $derived.by(() => {
    const q = books.spellings.map((s) => `“${s}”`);
    return q.length < 2
      ? q.join('')
      : `${q.slice(0, -1).join(', ')} and ${q.at(-1)}`;
  });

  const pluralNote = $derived(
    !books.withPlurals
      ? ''
      : books.spellings.length > 1
        ? ', with their plurals'
        : ', with its plural'
  );

  function fmt(v) {
    return v >= 1 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(2) : v.toFixed(3);
  }
</script>

<figure class="book-mentions" bind:clientWidth={width}>
  <svg
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label="Mentions of {name} in English books, {first} to {last}, peaking in {books.peakYear}"
  >
    <line
      class="base"
      x1={PAD.left}
      x2={W - PAD.right}
      y1={PAD.top + plotH}
      y2={PAD.top + plotH}
    />
    <path class="line" d={path} />
    {#if peak}
      <circle class="peak" cx={x(peak.year)} cy={y(peak.perMillion)} r="4" />
      <text
        class="peak-label"
        x={x(peak.year)}
        y={y(peak.perMillion) - 8}
        text-anchor={labelAnchor}>Peak {peak.year}</text
      >
    {/if}
    {#each points as p, i (p.year)}
      <rect
        class="hit"
        x={x(p.year) - plotW / points.length / 2}
        y={PAD.top}
        width={plotW / points.length}
        height={plotH}
        tabindex="0"
        role="img"
        aria-label="{p.year} to {p.year + 4}: {fmt(
          p.perMillion
        )} per million words"
        onpointerenter={() => (active = i)}
        onpointerdown={() => (active = i)}
        onpointerleave={() => (active = null)}
        onfocus={() => (active = i)}
        onblur={() => (active = null)}
      />
    {/each}
    {#if activePoint}
      <circle
        class="active"
        cx={x(activePoint.year)}
        cy={y(activePoint.perMillion)}
        r="3.5"
      />
    {/if}
    {#each ticks as t (t)}
      {#if t >= first && t <= last}
        <text
          class="axis"
          x={x(t)}
          y={H - 6}
          text-anchor={t === first ? 'start' : t === last ? 'end' : 'middle'}
          >{t}</text
        >
      {/if}
    {/each}
  </svg>
  {#if peak && caveat}
    <span
      class="caveat"
      style:left="{caveatLeft}px"
      style:top="{y(peak.perMillion) - 21}px"
    >
      <HoverCard label="Why the {peak.year} peak may be misleading" dot>
        {#snippet card()}
          <span class="caveat-card">
            <span class="caveat-title"
              >Why the {peak.year} peak may be misleading</span
            >
            {#if caveat.afterEnd}
              <span class="caveat-text">
                {#if caveat.endedByYear}
                  The job had mostly gone by {caveat.endedByYear}, decades
                  before this peak.
                {:else}
                  Wikipedia's list says this job ended in the {centuryLabel(
                    caveat.endCentury
                  )}, before this peak.
                {/if}
                {#if !caveat.note}
                  Books from this time probably mention it in history writing or
                  fiction, or use the word in another sense.
                {/if}
              </span>
            {/if}
            {#if caveat.note}
              <span class="caveat-text">{caveat.note}</span>
            {/if}
          </span>
        {/snippet}
      </HoverCard>
    </span>
  {/if}
  {#if activePoint}
    <p class="readout" aria-live="polite">
      {activePoint.year}–{activePoint.year + 4}: {fmt(activePoint.perMillion)} per
      million words
    </p>
  {/if}
  <figcaption>
    How often the job was named in English-language books (5-year averages, per
    million words), from
    <a href="https://books.google.com/ngrams">Google Books Ngram</a>. Counts
    {spellingList}{pluralNote}. It tracks how much people wrote about the job,
    not how many did it.
    {#if books.note}{books.note}{/if}
  </figcaption>
</figure>

<style lang="scss">
  .book-mentions {
    position: relative;
    margin: 0;
    max-width: 52rem;
  }

  .caveat {
    position: absolute;
    line-height: 0;
  }

  .caveat-title {
    display: block;
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-xxs);
  }

  .caveat-text {
    display: block;

    & + & {
      margin-top: var(--spacing-xs);
    }
  }

  svg {
    display: block;
    max-width: 100%;
  }

  .base {
    stroke: var(--color-rule);
  }

  .line {
    fill: none;
    stroke: var(--color-bar);
    stroke-width: 2;
  }

  .peak,
  .active {
    fill: var(--color-accent);
  }

  .peak-label,
  .axis {
    font-family: var(--font-sans);
    font-size: 12px;
    fill: var(--color-medium-gray);
  }

  .peak-label {
    fill: var(--color-accent);
    font-weight: var(--font-weight-semibold);
  }

  .hit {
    fill: transparent;
    outline: none;
  }

  .hit:focus-visible {
    fill: var(--color-shadow);
  }

  .readout,
  figcaption {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 65ch;
  }

  .readout {
    color: var(--color-text);
    margin: var(--spacing-xxs) 0 0;
  }

  figcaption {
    margin-top: var(--spacing-xs);
  }
</style>
