<!--
@component
JobList.svelte — The list of extinct jobs: each row is the job's name and a
one-line summary. The whole row is clickable; on hover or focus the row is
tinted and its left rule thickens.

Props:
- jobs: job summaries [{ id, name, summary }]
-->
<script>
  import { base } from '$app/paths';

  let { jobs = [] } = $props();
</script>

<ol class="job-list">
  {#each jobs as job (job.id)}
    <li>
      <!-- The link's ::after stretches over the whole row, so the row is clickable
           while the link's accessible name stays just the job name. -->
      <a href="{base}/jobs/{job.id}">{job.name}</a>
      <span class="summary">{job.summary}</span>
    </li>
  {/each}
</ol>

<style lang="scss">
  .job-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm)
      var(--spacing-md);
    border-bottom: var(--border-width-thin) solid var(--color-border);
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

  li:focus-within {
    outline: 3px solid var(--color-accent);
    outline-offset: -3px;
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

  .summary {
    display: block;
    margin-top: var(--spacing-xxs);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 65ch;
  }

  @media (prefers-reduced-motion: reduce) {
    li {
      transition: none;
    }
  }
</style>
