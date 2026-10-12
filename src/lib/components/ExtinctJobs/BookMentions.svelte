<!--
@component
BookMentions.svelte — How often a job's name appeared in English-language books,
1800–2019 (Google Books Ngram, 5-year averages per million words), as a line
with the peak marked. Hovering, tapping or tabbing to a point shows its value.

Props:
- books: { spellings, withPlurals, points: [{ year, perMillion }], peakYear, note }
  from jobs.json; spellings are every form searched (summed), plurals counted when
  withPlurals is true
- name: the job name, used in the accessible description
-->
<script>
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
        text-anchor="middle">Peak {peak.year}</text
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
