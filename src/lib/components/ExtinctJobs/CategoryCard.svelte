<!--
@component
CategoryCard.svelte — Preview card for a census job category (e.g. "Telephone
operators"): how many people the census counted in it over time, and a link to
the matching job page when the category is one of our jobs. Uses only inline
elements so it can sit inside a paragraph (see HoverCard).

Props:
- category: { label, occupational, series, jobId }
-->
<script>
  import { base } from '$app/paths';
  import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
  import { formatNumber, peak } from '$lib/jobs.js';

  let { category } = $props();

  const top = $derived(peak(category.series));
</script>

<span class="category-card">
  <span class="name">{category.label}</span>
  {#if category.occupational && top}
    <span class="meta">A U.S. census job category</span>
    <span class="trend">
      <Sparkline series={category.series} width={160} height={28} />
    </span>
    <span class="peak"
      >Largest in {top.year}, with about {formatNumber(top.people)} people.</span
    >
  {:else}
    <span class="meta">Not a job: the census recorded no occupation.</span>
  {/if}
  {#if category.jobId}
    <a class="open" href="{base}/jobs/{category.jobId}">Open this job</a>
  {/if}
</span>

<style lang="scss">
  .category-card,
  .category-card > span,
  .open {
    display: block;
  }

  .name {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--leading-tight);
    color: var(--color-dark);
  }

  .meta {
    margin-top: var(--spacing-xxs);
    color: var(--color-medium-gray);
  }

  .trend,
  .peak,
  .open {
    margin-top: var(--spacing-xs);
  }

  .open {
    color: var(--color-accent);
  }
</style>
