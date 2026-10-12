<!--
@component
FlowSankey.svelte — Where a job's workers came from and went next, as a Sankey
chart with time running left to right: what the people in the job in one census
had been doing one census earlier (left), the job (middle), and what they were
doing one census later (right). From linked census records; the two sides are
different groups of matched people. On narrow screens the two halves stack.

Ribbon and node thickness is each group's share. Labels are HTML, so category
names can open a CategoryCard preview when `categories` is given.

Props:
- year: the census year in the middle
- prev, next: the census years on either side (null when there is none)
- before: { basis, category, linkedPeople, origins: [{ code, label, share, same, other }] } or null
- after: { basis, category, linkedPeople, destinations: [...] } or null
- categories: optional map of code -> { label, occupational, series, jobId }
-->
<script>
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import CategoryCard from '$lib/components/ExtinctJobs/CategoryCard.svelte';
  import { base } from '$app/paths';
  import { formatNumber, formatShare } from '$lib/jobs.js';

  let {
    year,
    prev = null,
    next = null,
    before = null,
    after = null,
    categories = {},
  } = $props();

  const BAND = 220; // thickness of the middle node, px
  const GAP = 6; // space between side nodes
  const NODE = 6; // side node width
  const MIDDLE = 14; // middle node width
  const LABEL_GUESS = 34; // label height before it has been measured

  let width = $state(720);
  const narrow = $derived(width < 640);
  let labelHeights = $state({});
  let hovered = $state(null);

  const flow = $derived(after ?? before);
  const category = $derived(flow?.category ?? '');
  const what = $derived(
    flow?.basis === 'exact'
      ? category.toLowerCase()
      : `the census category “${category}”, which includes this job`
  );

  // Stack one side's groups top to bottom. Each slot is tall enough for its
  // label; the node inside it is as thick as the group's share of the band.
  function stack(items, side) {
    const total = items.reduce((sum, d) => sum + d.share, 0) || 1;
    let y = 0;
    let along = 0;
    const rows = items.map((d, i) => {
      const key = `${side}-${i}`;
      const thick = (d.share / total) * BAND;
      const slot = Math.max(thick, (labelHeights[key] ?? LABEL_GUESS) + 4);
      const row = { d, key, thick, slot, top: y, along };
      y += slot + GAP;
      along += thick;
      return row;
    });
    return { rows, height: Math.max(0, y - GAP) };
  }

  const left = $derived(before ? stack(before.origins, 'before') : null);
  const right = $derived(after ? stack(after.destinations, 'after') : null);

  // One panel with both sides on wide screens, two stacked panels on narrow ones.
  const panels = $derived.by(() => {
    const labelW = narrow
      ? Math.round(width * 0.55)
      : Math.round(Math.min(240, Math.max(150, width * 0.28)));
    const wide = {
      left,
      right,
      leftNode: labelW + 8,
      middle: Math.round(width / 2 - MIDDLE / 2),
      rightNode: width - labelW - 8 - NODE,
    };
    if (!narrow) return [wide];
    return [
      { left, right: null, leftNode: labelW + 8, middle: width - MIDDLE },
      { left: null, right, middle: 0, rightNode: width - labelW - 8 - NODE },
    ].filter((p) => p.left || p.right);
  });

  function geometry(panel) {
    const height = Math.max(
      BAND,
      panel.left?.height ?? 0,
      panel.right?.height ?? 0
    );
    return {
      height,
      band: (height - BAND) / 2,
      leftOffset: panel.left ? (height - panel.left.height) / 2 : 0,
      rightOffset: panel.right ? (height - panel.right.height) / 2 : 0,
    };
  }

  // Year labels centre on their column, but stay inside the chart at the edges.
  function yearShift(x) {
    if (x < 24) return 'translateX(0)';
    if (x > width - 24) return 'translateX(-100%)';
    return 'translateX(-50%)';
  }

  // A ribbon from (x0, a0..a0+t) to (x1, b0..b0+t), curving halfway across.
  function ribbon(x0, a0, x1, b0, t) {
    const xm = (x0 + x1) / 2;
    return `M${x0},${a0} C${xm},${a0} ${xm},${b0} ${x1},${b0} L${x1},${b0 + t} C${xm},${b0 + t} ${xm},${a0 + t} ${x0},${a0 + t} Z`;
  }
</script>

{#snippet label(row, side)}
  {@const c = row.d.code != null ? categories[row.d.code] : null}
  {#if c}
    <HoverCard
      label={row.d.label}
      href={c.jobId ? `${base}/jobs/${c.jobId}` : null}
    >
      {#snippet card()}<CategoryCard category={c} />{/snippet}
    </HoverCard>
  {:else}
    {row.d.label}
  {/if}
  <span class="share">{formatShare(row.d.share)}</span>
  {#if row.d.same}
    <span class="same-note"
      >{side === 'before' ? '(already in this job)' : '(stayed)'}</span
    >
  {/if}
{/snippet}

<figure class="flow-sankey" bind:clientWidth={width}>
  {#each panels as panel, p (p)}
    {@const g = geometry(panel)}
    <div class="years" aria-hidden="true">
      {#if panel.left || (!narrow && prev)}
        <span
          class="year"
          style:left="{panel.leftNode + NODE / 2}px"
          style:transform={yearShift(panel.leftNode + NODE / 2)}
          >{prev ?? ''}</span
        >
      {/if}
      <span
        class="year middle-year"
        style:left="{panel.middle + MIDDLE / 2}px"
        style:transform={yearShift(panel.middle + MIDDLE / 2)}>{year}</span
      >
      {#if panel.right || (!narrow && next)}
        <span
          class="year"
          style:left="{panel.rightNode + NODE / 2}px"
          style:transform={yearShift(panel.rightNode + NODE / 2)}
          >{next ?? ''}</span
        >
      {/if}
    </div>
    <div class="panel" style:height="{g.height}px">
      <svg {width} height={g.height} aria-hidden="true">
        <rect
          class="middle"
          x={panel.middle}
          y={g.band}
          width={MIDDLE}
          height={BAND}
        />
        {#if panel.left}
          {#each panel.left.rows as row (row.key)}
            {@const y = g.leftOffset + row.top + (row.slot - row.thick) / 2}
            <path
              class="ribbon"
              role="presentation"
              class:same={row.d.same}
              class:other={row.d.other}
              class:active={hovered === row.key}
              d={ribbon(
                panel.leftNode + NODE,
                y,
                panel.middle,
                g.band + row.along,
                row.thick
              )}
              onpointerenter={() => (hovered = row.key)}
              onpointerleave={() => (hovered = null)}
            />
            <rect
              class="node"
              class:same={row.d.same}
              class:other={row.d.other}
              x={panel.leftNode}
              {y}
              width={NODE}
              height={Math.max(1, row.thick)}
            />
          {/each}
        {/if}
        {#if panel.right}
          {#each panel.right.rows as row (row.key)}
            {@const y = g.rightOffset + row.top + (row.slot - row.thick) / 2}
            <path
              class="ribbon"
              role="presentation"
              class:same={row.d.same}
              class:other={row.d.other}
              class:active={hovered === row.key}
              d={ribbon(
                panel.middle + MIDDLE,
                g.band + row.along,
                panel.rightNode,
                y,
                row.thick
              )}
              onpointerenter={() => (hovered = row.key)}
              onpointerleave={() => (hovered = null)}
            />
            <rect
              class="node"
              class:same={row.d.same}
              class:other={row.d.other}
              x={panel.rightNode}
              {y}
              width={NODE}
              height={Math.max(1, row.thick)}
            />
          {/each}
        {/if}
      </svg>

      {#if panel.left}
        <ol class="labels" aria-label="What they were doing in {prev}">
          {#each panel.left.rows as row (row.key)}
            <li
              class="label left"
              class:same={row.d.same}
              class:other={row.d.other}
              class:active={hovered === row.key}
              style:right="{width - panel.leftNode + 8}px"
              style:width="{panel.leftNode - 8}px"
              style:top="{g.leftOffset + row.top + row.slot / 2}px"
              bind:clientHeight={labelHeights[row.key]}
              onpointerenter={() => (hovered = row.key)}
              onpointerleave={() => (hovered = null)}
            >
              {@render label(row, 'before')}
            </li>
          {/each}
        </ol>
      {:else if !narrow}
        <p class="missing left" style:width="{panel.leftNode - 8}px">
          {#if prev}
            Too few people in this job in {year} were also found in {prev}.
          {:else}
            No earlier census to compare with.
          {/if}
        </p>
      {/if}

      {#if panel.right}
        <ol class="labels" aria-label="What they were doing in {next}">
          {#each panel.right.rows as row (row.key)}
            <li
              class="label right"
              class:same={row.d.same}
              class:other={row.d.other}
              class:active={hovered === row.key}
              style:left="{panel.rightNode + NODE + 8}px"
              style:width="{width - panel.rightNode - NODE - 8}px"
              style:top="{g.rightOffset + row.top + row.slot / 2}px"
              bind:clientHeight={labelHeights[row.key]}
              onpointerenter={() => (hovered = row.key)}
              onpointerleave={() => (hovered = null)}
            >
              {@render label(row, 'after')}
            </li>
          {/each}
        </ol>
      {:else if !narrow}
        <p
          class="missing right"
          style:left="{panel.rightNode + NODE + 8}px"
          style:width="{width - panel.rightNode - NODE - 8}px"
        >
          {#if next}
            Too few people in this job in {year} were found again in {next}.
          {:else}
            No later census to compare with yet.
          {/if}
        </p>
      {/if}
    </div>
  {/each}
  {#if narrow && !before}
    <p class="missing-inline">
      {prev
        ? `Too few people in this job in ${year} were also found in ${prev}.`
        : 'No earlier census to compare with.'}
    </p>
  {/if}
  {#if narrow && !after}
    <p class="missing-inline">
      {next
        ? `Too few people in this job in ${year} were found again in ${next}.`
        : 'No later census to compare with yet.'}
    </p>
  {/if}

  <figcaption>
    <span class="middle-name">The middle is {what} in {year}.</span>
    {#if before}
      {formatNumber(before.linkedPeople)} of them were also found in the {prev}
      census, with a job; the left side is what they had been doing then.
    {/if}
    {#if after}
      {formatNumber(after.linkedPeople)} people in this job in {year} were found again
      in {next}; the right side is what they were doing then.
    {/if}
    {#if before && after}
      The two sides are different groups of matched people, so a ribbon on the
      left doesn’t continue on the right.
    {/if}
  </figcaption>
</figure>

<style lang="scss">
  .flow-sankey {
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
  }

  .middle-year {
    color: var(--color-dark);
  }

  .panel {
    position: relative;
  }

  svg {
    position: absolute;
    inset: 0;
    display: block;
    overflow: visible;
  }

  .middle {
    fill: var(--color-job);
  }

  .node {
    fill: var(--color-bar);

    &.same {
      fill: var(--color-job);
    }

    &.other {
      fill: var(--color-rule);
    }
  }

  .ribbon {
    fill: var(--color-faint-bar);
    opacity: 0.55;
    transition: opacity 120ms;

    &.same {
      fill: var(--color-job);
      opacity: 0.35;
    }

    &.other {
      fill: var(--color-rule);
      opacity: 0.3;
    }

    &.active {
      fill: var(--color-accent);
      opacity: 0.55;
    }
  }

  .labels {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .label {
    position: absolute;
    transform: translateY(-50%);
    line-height: 1.3;
    color: var(--color-dark);

    &.left {
      text-align: right;
    }

    &.same {
      color: var(--color-job);
    }

    &.other {
      color: var(--color-medium-gray);
    }

    &.active {
      color: var(--color-accent);
    }
  }

  .share {
    font-variant-numeric: tabular-nums;
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }

  .same-note {
    color: var(--color-medium-gray);
  }

  .missing {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    color: var(--color-medium-gray);

    &.left {
      left: 0;
      text-align: right;
    }
  }

  .missing-inline {
    margin: var(--spacing-sm) 0 0;
    color: var(--color-medium-gray);
  }

  figcaption {
    margin-top: var(--spacing-sm);
    max-width: 62ch;
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
  }

  .middle-name {
    color: var(--color-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .ribbon {
      transition: none;
    }
  }
</style>
