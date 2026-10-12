<!--
@component
JobList.svelte — The list of extinct jobs: job name and summary, when it ended
(century; the source has no exact years), why it ended, and a census trend when
the job appears in U.S. census records. The whole row is clickable; on hover or
focus the row is tinted and its left rule thickens.

Props:
- jobs: job summaries [{ id, name, summary, startCentury, endCentury, reasonTypes, series }]
-->
<script>
  import { base } from '$app/paths';
  import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
  import { centuryLabel } from '$lib/jobs.js';

  let { jobs = [] } = $props();
</script>

<div class="job-list">
  <div class="columns" aria-hidden="true">
    <span>Job</span>
    <span>Ended</span>
    <span class="reason">Why it ended</span>
    <span>U.S. census, 1850–1940</span>
  </div>

  <ol>
    {#each jobs as job (job.id)}
      <li>
        <div class="job">
          <!-- The link's ::after stretches over the whole row, so the row is clickable
               while the link's accessible name stays just the job name. -->
          <a href="{base}/jobs/{job.id}">{job.name}</a>
          <span class="summary">{job.summary}</span>
        </div>
        <span class="era"
          ><span class="sr-only">Ended: </span>{centuryLabel(
            job.endCentury
          )}</span
        >
        <span class="reason"
          ><span class="sr-only">Why it ended: </span>{job.reasonTypes.join(
            ', '
          )}</span
        >
        <span class="trend">
          {#if job.series.length}
            <Sparkline series={job.series} />
          {:else}
            <span class="none">Not in census records</span>
          {/if}
        </span>
      </li>
    {/each}
  </ol>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .columns,
  li {
    display: grid;
    grid-template-columns:
      minmax(0, 44%) minmax(0, 1.1fr) minmax(0, 1fr)
      10.5rem;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm)
      var(--spacing-md);
  }

  .columns {
    position: sticky;
    top: 0;
    z-index: 1;
    padding-top: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
    background: var(--color-paper);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-medium-gray);
    border-bottom: var(--border-width-divider) solid var(--color-rule);
    border-left: 2px solid var(--color-margin);
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    border-bottom: var(--border-width-thin) solid var(--color-border);
    // The ledger's red margin rule runs down the left edge.
    box-shadow: inset 2px 0 0 var(--color-margin);
    transition:
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  li:hover,
  li:focus-within {
    background: var(--color-light-gray);
    box-shadow: inset 6px 0 0 var(--color-margin);
  }

  a {
    display: inline-block;
    font-family: var(--font-display);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--leading-tight);
    color: var(--color-dark);
    text-decoration: none;

    // Stretch the link over the whole row.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: none;
    }
  }

  li:hover a,
  li:focus-within a {
    color: var(--color-accent);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.12em;
  }

  li:focus-within {
    outline: 3px solid var(--color-accent);
    outline-offset: -3px;
  }

  .summary {
    display: block;
    margin-top: var(--spacing-xxs);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 52ch;
  }

  li .era,
  li .reason,
  li .trend {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text);
    padding-top: 0.5rem;
  }

  li .trend {
    padding-top: 0.9rem;
  }

  .none {
    color: var(--color-medium-gray);
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

  @media (prefers-reduced-motion: reduce) {
    li {
      transition: none;
    }
  }

  @include mobile {
    .columns {
      display: none;
    }

    li {
      grid-template-columns: 1fr auto;
      row-gap: var(--spacing-xxs);
    }

    .job {
      grid-column: 1 / -1;
    }

    .reason {
      display: none;
    }

    li .era,
    li .trend {
      padding-top: 0;
    }
  }
</style>
