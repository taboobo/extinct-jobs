<!--
@component
CareerPaths.svelte — The same people followed through several censuses, as a
Sankey chart with one column per census. The first column is everyone in the job
in the start census (who could be found in every later census shown); each later
column splits them by what they were doing then, and ribbons show who moved where.

Hovering, tapping or tabbing to a block or ribbon describes it below the chart.
Small blocks have no label on the chart; "Show the numbers" lists everything.

Props:
- cohort: { start, years, category, started, people, stages: [[{ code, label,
  short, people, same, other }]], links: [[{ from, to, people }]] } from jobs.json
-->
<script>
  import { formatNumber, formatShare } from '$lib/jobs.js';

  let { cohort } = $props();

  const NODE = 8;
  const GAP = 6;
  const LABEL_MIN = 14; // blocks shorter than this get no label on the chart

  let width = $state(720);
  const band = $derived(width < 640 ? 240 : 320);
  const labelRoom = $derived(width < 640 ? 132 : 168);
  const step = $derived(
    (width - labelRoom - NODE) / Math.max(1, cohort.years.length - 1)
  );
  const innerLabels = $derived(step - NODE - 8 >= 96);
  const x = (i) => i * step;

  let selected = $state(null); // { kind: 'node' | 'link', stage, key | link }

  const key = (code) => (code == null ? 'other' : String(code));
  const thick = (people) => (people / cohort.people) * band;

  // Stack each census's groups top to bottom, centred on the tallest column.
  const columns = $derived.by(() => {
    const stages = [
      [
        {
          code: null,
          key: 'start',
          label: cohort.category,
          short: cohort.category,
          people: cohort.people,
          same: true,
          other: false,
        },
      ],
      ...cohort.stages.map((st) => st.map((n) => ({ ...n, key: key(n.code) }))),
    ];
    const heights = stages.map(
      (st) =>
        st.reduce((sum, n) => sum + thick(n.people), 0) + GAP * (st.length - 1)
    );
    const tallest = Math.max(...heights);
    return stages.map((st, i) => {
      let y = (tallest - heights[i]) / 2;
      return st.map((n) => {
        const node = { ...n, y, h: thick(n.people), inY: 0, outY: 0 };
        y += node.h + GAP;
        return node;
      });
    });
  });
  const height = $derived(
    Math.max(...columns.map((c) => c.at(-1).y + c.at(-1).h))
  );

  // Ribbons between consecutive censuses, stacked in the order of the blocks
  // they join so they cross as little as possible.
  const ribbons = $derived.by(() => {
    const out = [];
    const offsets = columns.map((c) =>
      Object.fromEntries(c.map((n) => [n.key, { out: n.y, in: n.y }]))
    );
    cohort.links.forEach((links, s) => {
      const fromCol = columns[s];
      const toCol = columns[s + 1];
      const order = (col, k) => col.findIndex((n) => n.key === k);
      const sorted = links
        .map((l) => ({
          ...l,
          fromKey: s === 0 ? 'start' : key(l.from),
          toKey: key(l.to),
        }))
        .filter(
          (l) => order(fromCol, l.fromKey) >= 0 && order(toCol, l.toKey) >= 0
        )
        .sort(
          (a, b) =>
            order(fromCol, a.fromKey) - order(fromCol, b.fromKey) ||
            order(toCol, a.toKey) - order(toCol, b.toKey)
        );
      // outgoing offsets follow the target order within each source block
      const outSorted = [...sorted].sort(
        (a, b) =>
          order(fromCol, a.fromKey) - order(fromCol, b.fromKey) ||
          order(toCol, a.toKey) - order(toCol, b.toKey)
      );
      const inSorted = [...sorted].sort(
        (a, b) =>
          order(toCol, a.toKey) - order(toCol, b.toKey) ||
          order(fromCol, a.fromKey) - order(fromCol, b.fromKey)
      );
      // where each ribbon leaves its source block, by ribbon id
      const y0 = {};
      for (const l of outSorted) {
        const o = offsets[s][l.fromKey];
        y0[`${l.fromKey}-${l.toKey}`] = o.out;
        o.out += thick(l.people);
      }
      for (const l of inSorted) {
        const o = offsets[s + 1][l.toKey];
        out.push({
          ...l,
          stage: s,
          id: `${s}-${l.fromKey}-${l.toKey}`,
          a: y0[`${l.fromKey}-${l.toKey}`],
          b: o.in,
          t: thick(l.people),
          from: fromCol[order(fromCol, l.fromKey)],
          to: toCol[order(toCol, l.toKey)],
        });
        o.in += thick(l.people);
      }
    });
    return out;
  });

  function ribbonPath(r) {
    const x0 = x(r.stage) + NODE;
    const x1 = x(r.stage + 1);
    const xm = (x0 + x1) / 2;
    return `M${x0},${r.a} C${xm},${r.a} ${xm},${r.b} ${x1},${r.b} L${x1},${r.b + r.t} C${xm},${r.b + r.t} ${xm},${r.a + r.t} ${x0},${r.a + r.t} Z`;
  }

  const share = (people) => formatShare(people / cohort.people);
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const what = (n) => (n.other ? 'something else' : lower(n.label));

  function describeNode(n, i) {
    if (i === 0)
      return `${formatNumber(n.people)} ${lower(cohort.category)} in ${cohort.start}, followed through ${cohort.years.at(-1)}.`;
    return `In ${cohort.years[i]}, ${formatNumber(n.people)} of them (${share(n.people)}) ${n.other ? 'were doing other jobs, each too small to show' : `were ${what(n)}`}.`;
  }

  function describeLink(r) {
    const fromWhat =
      r.stage === 0 ? lower(cohort.category) : what(r.from) || 'something else';
    return `${formatNumber(r.people)} people went from ${fromWhat} in ${cohort.years[r.stage]} to ${what(r.to)} in ${cohort.years[r.stage + 1]}.`;
  }

  const readout = $derived.by(() => {
    if (!selected) return null;
    if (selected.kind === 'link') return describeLink(selected.link);
    const n = columns[selected.stage].find((m) => m.key === selected.key);
    return n ? describeNode(n, selected.stage) : null;
  });

  function lit(r) {
    if (!selected) return false;
    if (selected.kind === 'link') return selected.link.id === r.id;
    return (
      (r.stage === selected.stage && r.fromKey === selected.key) ||
      (r.stage + 1 === selected.stage && r.toKey === selected.key)
    );
  }

  function showLabel(n, i) {
    if (i === 0 || n.h < LABEL_MIN) return false;
    return innerLabels || i === columns.length - 1;
  }
</script>

<figure class="career-paths" bind:clientWidth={width}>
  <div class="years" aria-hidden="true">
    {#each cohort.years as year, i (year)}
      <span
        class="year"
        class:first={i === 0}
        style:left="{x(i) + NODE / 2}px"
        style:transform={i === 0 ? 'none' : 'translateX(-50%)'}>{year}</span
      >
    {/each}
  </div>

  <div class="chart" style:height="{height}px">
    <svg {width} {height} role="group" aria-label="Career paths">
      {#each ribbons as r (r.id)}
        <path
          class="ribbon"
          class:same={r.from.same && r.to.same}
          class:other={r.to.other}
          class:lit={lit(r)}
          d={ribbonPath(r)}
          role="img"
          aria-label={describeLink(r)}
          onpointerenter={() => (selected = { kind: 'link', link: r })}
          onpointerleave={() => (selected = null)}
        />
      {/each}
      {#each columns as column, i (cohort.years[i])}
        {#each column as n (n.key)}
          <rect
            class="node"
            class:same={n.same}
            class:other={n.other}
            class:lit={selected?.kind === 'node' &&
              selected.stage === i &&
              selected.key === n.key}
            x={x(i)}
            y={n.y}
            width={NODE}
            height={Math.max(1, n.h)}
            tabindex="0"
            role="img"
            aria-label={describeNode(n, i)}
            onpointerenter={() =>
              (selected = { kind: 'node', stage: i, key: n.key })}
            onpointerleave={() => (selected = null)}
            onpointerdown={() =>
              (selected = { kind: 'node', stage: i, key: n.key })}
            onfocus={() => (selected = { kind: 'node', stage: i, key: n.key })}
            onblur={() => (selected = null)}
          />
        {/each}
      {/each}
    </svg>

    {#each columns as column, i (cohort.years[i])}
      {#each column as n (n.key)}
        {#if showLabel(n, i)}
          <span
            class="label"
            class:same={n.same}
            class:other={n.other}
            aria-hidden="true"
            style:left="{x(i) + NODE + 4}px"
            style:top="{n.y + n.h / 2}px"
            style:max-width="{i === columns.length - 1
              ? labelRoom - 6
              : step - NODE - 10}px"
            title={n.label}
            >{n.short} <span class="pct">{share(n.people)}</span></span
          >
        {/if}
      {/each}
    {/each}
  </div>

  <p class="readout" aria-live="polite">
    {readout ?? 'Point at or tap a block or ribbon to see who it is.'}
  </p>

  <details>
    <summary>Show the numbers</summary>
    <table>
      <thead>
        <tr><th>Census</th><th>Doing</th><th>People</th><th>Share</th></tr>
      </thead>
      <tbody>
        {#each columns.slice(1) as column, i (cohort.years[i + 1])}
          {#each column as n, k (n.key)}
            <tr class:first={k === 0}>
              <td>{k === 0 ? cohort.years[i + 1] : ''}</td>
              <td>{n.label}</td>
              <td class="num">{formatNumber(n.people)}</td>
              <td class="num">{share(n.people)}</td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </details>

  <figcaption>
    Of the {formatNumber(cohort.started)}
    {lower(cohort.category)} aged 15 to 64 in {cohort.start} whom IPUMS matched to
    another census, {formatNumber(cohort.people)} could be found in every census through
    {cohort.years.at(-1)}. This chart follows them. People who died or moved
    abroad drop out, so later years show survivors, and many had retired. Groups
    under 10 people are left out.
  </figcaption>
</figure>

<style lang="scss">
  .career-paths {
    margin: 0;
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
  }

  .years {
    position: relative;
    height: 1.75rem;
    margin-top: var(--spacing-sm);
  }

  .year {
    position: absolute;
    top: 0;
    font-weight: var(--font-weight-semibold);
    color: var(--color-medium-gray);
    font-variant-numeric: tabular-nums;

    &.first {
      color: var(--color-dark);
    }
  }

  .chart {
    position: relative;
  }

  svg {
    position: absolute;
    inset: 0;
    display: block;
    overflow: visible;
  }

  .node {
    fill: var(--color-bar);
    outline: none;

    &.other {
      fill: var(--color-rule);
    }

    &.lit,
    &:focus-visible {
      fill: var(--color-accent);
    }
  }

  .ribbon {
    fill: var(--color-faint-bar);
    opacity: 0.5;
    transition: opacity 120ms;

    &.same {
      fill: var(--color-bar);
      opacity: 0.45;
    }

    &.other {
      fill: var(--color-rule);
      opacity: 0.3;
    }

    &.lit {
      fill: var(--color-accent);
      opacity: 0.55;
    }
  }

  .label {
    position: absolute;
    transform: translateY(-50%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
    color: var(--color-dark);
    pointer-events: none;

    &.other {
      color: var(--color-medium-gray);
    }
  }

  .pct {
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  .readout {
    min-height: 2.6em;
    margin: var(--spacing-sm) 0 0;
    max-width: 62ch;
    color: var(--color-text);
  }

  details {
    margin-top: var(--spacing-xs);
  }

  summary {
    cursor: pointer;
    color: var(--color-accent);
  }

  table {
    margin-top: var(--spacing-xs);
    border-collapse: collapse;
    width: 100%;
    max-width: 36rem;
  }

  th,
  td {
    text-align: left;
    padding: var(--spacing-xxs) var(--spacing-xs) var(--spacing-xxs) 0;
    border-bottom: var(--border-width-thin) solid var(--color-border);
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  figcaption {
    margin-top: var(--spacing-sm);
    max-width: 62ch;
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
  }

  @media (prefers-reduced-motion: reduce) {
    .ribbon {
      transition: none;
    }
  }
</style>
