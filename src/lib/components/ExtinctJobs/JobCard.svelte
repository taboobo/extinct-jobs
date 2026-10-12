<!--
@component
JobCard.svelte — Preview card for a job: name, one-line summary, when it ended,
a census trend if there is one, and a link to its page. Uses only inline
elements so it can sit inside a paragraph (see HoverCard).

Props:
- job: { id, name, summary, endCentury, reasonTypes, series }
-->
<script>
  import { base } from '$app/paths';
  import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
  import { centuryLabel } from '$lib/jobs.js';

  let { job } = $props();
</script>

<span class="job-card">
  <span class="name">{job.name}</span>
  <span class="meta"
    >Ended in the {centuryLabel(job.endCentury)}{#if job.reasonTypes?.length}
      · {job.reasonTypes.join(', ').toLowerCase()}{/if}</span
  >
  <span class="summary">{job.summary}</span>
  {#if job.series?.length}
    <span class="trend">
      <Sparkline series={job.series} width={160} height={28} />
      <span class="trend-label">U.S. census, 1850–1940</span>
    </span>
  {/if}
  <a class="open" href="{base}/jobs/{job.id}">Open {job.name}</a>
</span>

<style lang="scss">
  .job-card,
  .job-card > span,
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

  .summary {
    margin-top: var(--spacing-xs);
    font-family: var(--font-serif);
  }

  .trend {
    margin-top: var(--spacing-xs);
  }

  .trend-label {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-medium-gray);
  }

  .open {
    margin-top: var(--spacing-xs);
    color: var(--color-accent);
  }
</style>
