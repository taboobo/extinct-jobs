<!--
@component
JobLedger.svelte — The list of extinct jobs as a ruled ledger table: job name,
the centuries it was practiced, why it ended, and a census trend when the job
appears in U.S. census records.

Props:
- jobs: job summaries [{ id, name, summary, startCentury, endCentury, reasonTypes, series }]
-->
<script>
  import { base } from '$app/paths';
  import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
  import { eraLabel } from '$lib/jobs.js';

  let { jobs = [] } = $props();
</script>

<table class="ledger">
  <thead>
    <tr>
      <th scope="col">Job</th>
      <th scope="col" class="era">Years practiced</th>
      <th scope="col" class="reason">Why it ended</th>
      <th scope="col" class="trend">U.S. census, 1850–1940</th>
    </tr>
  </thead>
  <tbody>
    {#each jobs as job (job.id)}
      <tr>
        <th scope="row">
          <a href="{base}/jobs/{job.id}">{job.name}</a>
          <span class="summary">{job.summary}</span>
        </th>
        <td class="era">{eraLabel(job)}</td>
        <td class="reason">{job.reasonTypes.join(', ')}</td>
        <td class="trend">
          {#if job.series.length}
            <Sparkline series={job.series} />
          {:else}
            <span class="none">Not in census records</span>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  @use '$lib/styles' as *;

  .ledger {
    width: 100%;
    border-collapse: collapse;
    // The ledger's red margin rule runs down the left edge.
    border-left: 2px solid var(--color-margin);
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--color-paper);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-medium-gray);
    text-align: left;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: var(--border-width-divider) solid var(--color-rule);
  }

  tbody th,
  td {
    text-align: left;
    vertical-align: top;
    padding: var(--spacing-sm);
    border-bottom: var(--border-width-thin) solid var(--color-border);
  }

  tbody th {
    font-weight: var(--font-weight-normal);
    width: 46%;
  }

  tbody th a {
    display: inline-block;
    font-family: var(--font-display);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--leading-tight);
    color: var(--color-dark);
    text-decoration: none;
  }

  tbody th a:hover {
    color: var(--color-accent);
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  .summary {
    display: block;
    margin-top: var(--spacing-xxs);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 52ch;
  }

  td {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  td.trend {
    padding-top: calc(var(--spacing-sm) + 0.4rem);
  }

  .none {
    color: var(--color-medium-gray);
  }

  @include mobile {
    thead {
      display: none;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr auto;
      border-bottom: var(--border-width-thin) solid var(--color-border);
    }

    tbody th {
      grid-column: 1 / -1;
      width: auto;
      border: 0;
      padding-bottom: var(--spacing-xxs);
    }

    td {
      border: 0;
      padding-top: 0;
    }

    td.reason {
      display: none;
    }

    td.trend {
      padding-top: 0;
    }
  }
</style>
