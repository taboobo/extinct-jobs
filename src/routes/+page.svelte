<!--
@component
Home page: the ledger of extinct jobs and a button to open a random one.
-->
<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import JobList from '$lib/components/ExtinctJobs/JobList.svelte';

  let { data } = $props();

  const jobs = $derived(
    data.jobs.toSorted((a, b) => a.name.localeCompare(b.name))
  );

  function openRandomJob() {
    const job = data.jobs[Math.floor(Math.random() * data.jobs.length)];
    goto(`${base}/jobs/${job.id}`);
  }
</script>

<svelte:head>
  <title>Extinct Jobs</title>
  <meta
    name="description"
    content="Jobs that disappeared, from alchemists to switchboard operators, and what U.S. census records show about the people who did them."
  />
</svelte:head>

<div class="page">
  <header class="intro">
    <h1>Extinct Jobs</h1>
    <p class="lede">
      {data.jobs.length} jobs that disappeared, from alchemists to switchboard operators.
      For the ones that show up in U.S. census records, see how many people did them
      and what those people did next.
    </p>
    <button type="button" class="random" onclick={openRandomJob}
      >Random job</button
    >
  </header>

  <JobList {jobs} />
</div>

<style lang="scss">
  .page {
    max-width: var(--max-width-wide);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .intro {
    padding: var(--spacing-xl) 0 var(--spacing-lg);
    border-bottom: var(--border-width-divider) solid var(--color-dark);
    margin-bottom: var(--spacing-md);
  }

  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-extrabold);
    font-size: clamp(2.5rem, 7vw, 4rem);
    line-height: 1.05;
    letter-spacing: var(--letter-spacing-tight);
    color: var(--color-dark);
    margin: 0;
  }

  .lede {
    max-width: 46ch;
    margin: var(--spacing-md) 0 0;
    font-size: var(--font-size-xl);
    line-height: var(--leading-snug);
    color: var(--color-text);
  }

  .random {
    margin-top: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-md);
    font-family: var(--font-sans);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-white);
    background: var(--color-dark);
    border: 0;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .random:hover {
    background: var(--color-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .random {
      transition: none;
    }
  }
</style>
