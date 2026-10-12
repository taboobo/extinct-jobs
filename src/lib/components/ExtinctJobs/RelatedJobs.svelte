<!--
@component
RelatedJobs.svelte — A short list of other jobs, each a link with a JobCard
preview on hover, focus or first tap.

Props:
- jobs: job summaries [{ id, name, summary, endCentury, reasonTypes, series }]
-->
<script>
  import { base } from '$app/paths';
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import JobCard from '$lib/components/ExtinctJobs/JobCard.svelte';
  import { centuryLabel } from '$lib/jobs.js';

  let { jobs = [] } = $props();
</script>

<ul class="related">
  {#each jobs as job (job.id)}
    <li>
      <HoverCard label={job.name} href="{base}/jobs/{job.id}">
        {#snippet card()}<JobCard {job} />{/snippet}
      </HoverCard>
      <span class="meta">ended in the {centuryLabel(job.endCentury)}</span>
    </li>
  {/each}
</ul>

<style lang="scss">
  .related {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--spacing-xs);
    padding: var(--spacing-xs) 0;
    border-bottom: var(--border-width-thin) solid var(--color-border);
    font-size: var(--font-size-lg);
  }

  .meta {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
  }
</style>
