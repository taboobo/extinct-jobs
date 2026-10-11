<!--
@component
Home page: the ledger of extinct jobs, with search and filters.
-->
<script>
  import SearchInput from '$lib/components/Forms/SearchInput.svelte';
  import JobLedger from '$lib/components/ExtinctJobs/JobLedger.svelte';

  let { data } = $props();

  let search = $state('');
  let reason = $state('');
  let censusOnly = $state(false);
  let sort = $state('name');

  const reasons = $derived(
    [...new Set(data.jobs.flatMap((j) => j.reasonTypes))].sort()
  );

  const shown = $derived.by(() => {
    const q = search.trim().toLowerCase();
    const list = data.jobs.filter(
      (j) =>
        (!q ||
          j.name.toLowerCase().includes(q) ||
          j.summary.toLowerCase().includes(q)) &&
        (!reason || j.reasonTypes.includes(reason)) &&
        (!censusOnly || j.series.length > 0)
    );
    if (sort === 'ended') {
      return list.toSorted(
        (a, b) => b.endCentury - a.endCentury || a.name.localeCompare(b.name)
      );
    }
    return list.toSorted((a, b) => a.name.localeCompare(b.name));
  });

  function clearFilters() {
    search = '';
    reason = '';
    censusOnly = false;
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
  </header>

  <section class="controls" aria-label="Filter the list">
    <div class="search">
      <SearchInput
        bind:value={search}
        label="Search jobs"
        placeholder="Try “lamp” or “maid”"
      />
    </div>

    <fieldset class="reasons">
      <legend>Why it ended</legend>
      <button
        type="button"
        aria-pressed={reason === ''}
        onclick={() => (reason = '')}>Any reason</button
      >
      {#each reasons as r (r)}
        <button
          type="button"
          aria-pressed={reason === r}
          onclick={() => (reason = r)}>{r}</button
        >
      {/each}
    </fieldset>

    <div class="row">
      <label class="check">
        <input type="checkbox" bind:checked={censusOnly} />
        Only jobs found in U.S. census records
      </label>
      <label class="sort">
        Sort by
        <select bind:value={sort}>
          <option value="name">Name</option>
          <option value="ended">Most recently ended</option>
        </select>
      </label>
    </div>
  </section>

  <p class="count" aria-live="polite">
    Showing {shown.length} of {data.jobs.length} jobs
  </p>

  {#if shown.length}
    <JobLedger jobs={shown} />
  {:else}
    <div class="empty">
      <p>No jobs match these filters.</p>
      <button type="button" onclick={clearFilters}>Clear filters</button>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .page {
    max-width: var(--max-width-wide);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .intro {
    padding: var(--spacing-xl) 0 var(--spacing-lg);
  }

  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-extrabold);
    font-size: clamp(4.5rem, 14vw, 11rem);
    line-height: 0.85;
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

  .controls {
    display: grid;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) 0;
    border-top: var(--border-width-divider) solid var(--color-dark);
    font-family: var(--font-sans);
  }

  .search {
    max-width: 28rem;

    :global(.search-label) {
      text-transform: none;
      letter-spacing: normal;
      font-weight: var(--font-weight-medium);
    }
  }

  .reasons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    border: 0;
    padding: 0;
    margin: 0;
  }

  legend {
    width: 100%;
    margin-bottom: var(--spacing-xxs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-dark);
  }

  button {
    font: inherit;
    font-size: var(--font-size-sm);
    padding: var(--spacing-xxs) var(--spacing-xs);
    color: var(--color-text);
    background: transparent;
    border: var(--border-width-thin) solid var(--color-rule);
    cursor: pointer;
  }

  button:hover {
    border-color: var(--color-accent);
  }

  button[aria-pressed='true'] {
    color: var(--color-white);
    background: var(--color-accent);
    border-color: var(--color-accent);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm) var(--spacing-lg);
    align-items: center;
    font-size: var(--font-size-sm);
  }

  .check {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
  }

  .sort select {
    font: inherit;
    margin-left: var(--spacing-xxs);
    padding: var(--spacing-xxs);
    background: var(--color-white);
    border: var(--border-width-thin) solid var(--color-rule);
  }

  .count {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
    margin: var(--spacing-xs) 0;
  }

  .empty {
    padding: var(--spacing-xl) 0;
    font-family: var(--font-sans);
  }
</style>
