<!--
@component
Job detail page: what the job was, why it ended, how many people did it in
each census, how census takers wrote it, and where its workers went next.
-->
<script>
  import { base } from '$app/paths';
  import CensusChart from '$lib/components/ExtinctJobs/CensusChart.svelte';
  import SpellingList from '$lib/components/ExtinctJobs/SpellingList.svelte';
  import TransitionBars from '$lib/components/ExtinctJobs/TransitionBars.svelte';
  import { centuryLabel, formatNumber, peak } from '$lib/jobs.js';

  let { data } = $props();
  const job = $derived(data.job);
  const census = $derived(job.census);
  const top = $derived(peak(census.series));

  // Why there is no census chart, in plain language.
  const noCensusReason = $derived(
    job.endCentury !== null && job.endCentury < 19
      ? 'This job had disappeared before 1850, the first census with usable job records.'
      : census.match === 'none'
        ? 'This job was rarely or never recorded in U.S. census records.'
        : 'No one in the census samples wrote this job title.'
  );
</script>

<svelte:head>
  <title>{job.name} | Extinct Jobs</title>
  <meta name="description" content={job.summary} />
</svelte:head>

<article class="job">
  <a class="back" href="{base}/">All jobs</a>

  <header class="hero" class:with-image={job.image}>
    <div class="title">
      <h1>{job.name}</h1>
      <p class="era">
        <span>Practiced from {centuryLabel(job.startCentury)}</span>
        <span class="ended">to {centuryLabel(job.endCentury)}</span>
      </p>
      {#if job.reasonTypes.length}
        <p class="reasons">
          Ended by: {job.reasonTypes.join(', ').toLowerCase()}
        </p>
      {/if}
    </div>

    {#if job.image}
      <figure class="picture">
        <img
          src={job.image.src}
          width={job.image.width}
          height={job.image.height}
          alt=""
          loading="eager"
        />
        <figcaption>
          {#if job.image.artist}{job.image.artist}.{/if}
          <a href={job.image.page}>Wikimedia Commons</a>{#if job.image.license},
            {#if job.image.licenseUrl}<a href={job.image.licenseUrl}
                >{job.image.license}</a
              >{:else}{job.image.license}{/if}{/if}.
        </figcaption>
      </figure>
    {/if}
  </header>

  <div class="body">
    <section>
      <h2>What the job was</h2>
      <p>{job.description}</p>
    </section>

    <section>
      <h2>Why it disappeared</h2>
      <p>{job.reason}</p>
    </section>

    <section class="wide">
      <h2>How many Americans did this work</h2>
      {#if census.series.length}
        {#if top}
          <p class="peak">
            {#if census.seriesSource === 'title'}At least{/if}
            <span class="peak-number">{formatNumber(top.people)}</span>
            people at the peak, in {top.year}
          </p>
        {/if}
        <CensusChart
          series={census.series}
          name={job.name.toLowerCase()}
          source={census.seriesSource}
        />
        <p class="note">
          {#if census.seriesSource === 'category'}
            Based on the census category for {census.category.toLowerCase()}.
          {:else}
            A few matches may be other jobs with similar names.
          {/if}
          <a href="{base}/about">How these numbers were made</a>
        </p>
      {:else}
        <p class="note">{noCensusReason}</p>
      {/if}
    </section>

    {#if census.spellings.length}
      <section>
        <h2>How census takers wrote it</h2>
        <p class="note">
          The census recorded jobs in the enumerator’s words. From 1910, job and
          industry went in separate columns.
        </p>
        <SpellingList spellings={census.spellings} />
      </section>
    {/if}

    {#if census.series.length}
      <section class="wide">
        <h2>Where they went next</h2>
        {#if job.transitions}
          <TransitionBars transitions={job.transitions} />
          <p class="note">
            Based on people the IPUMS project matched between the two censuses.
            Matching works better for some people than others (for example,
            women who changed their surname at marriage are often missed), so
            treat these shares as approximate.
          </p>
        {:else}
          <p class="note">
            There aren’t enough matched census records yet to follow people in
            this job from one census to the next.
          </p>
        {/if}
      </section>
    {/if}

    <p class="source">
      Description and reason adapted from <a href={job.wikipediaUrl}
        >Wikipedia</a
      >
      (CC BY-SA 4.0).
    </p>
  </div>
</article>

<style lang="scss">
  @use '$lib/styles' as *;

  .job {
    max-width: var(--max-width-wide);
    margin: 0 auto;
    padding: var(--spacing-md);
  }

  .back {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  .hero {
    display: grid;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0 var(--spacing-xl);
    border-bottom: var(--border-width-divider) solid var(--color-dark);

    &.with-image {
      grid-template-columns: 3fr 2fr;
      align-items: end;

      @include mobile {
        grid-template-columns: 1fr;
      }
    }
  }

  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-extrabold);
    font-size: clamp(3.5rem, 11vw, 9rem);
    line-height: 0.88;
    letter-spacing: var(--letter-spacing-tight);
    color: var(--color-dark);
    margin: 0;
    overflow-wrap: anywhere;
  }

  .era {
    margin: var(--spacing-md) 0 0;
    font-family: var(--font-sans);
    font-size: var(--font-size-lg);
    color: var(--color-text);
  }

  // The end of the job's life is marked with the ledger's red rule.
  .ended {
    padding-bottom: 2px;
    border-bottom: 3px solid var(--color-margin);
  }

  .reasons {
    margin: var(--spacing-xs) 0 0;
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
  }

  .picture {
    margin: 0;

    img {
      width: 100%;
      max-height: 28rem;
      object-fit: cover;
      border: var(--border-width-thin) solid var(--color-rule);
      filter: grayscale(0.35) contrast(1.05);
    }

    figcaption {
      margin-top: var(--spacing-xxs);
      font-family: var(--font-sans);
      font-size: var(--font-size-xs);
      line-height: var(--leading-caption);
      color: var(--color-medium-gray);
    }
  }

  .body {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--spacing-xl) var(--spacing-xxl);
    padding-top: var(--spacing-xl);

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  .wide,
  .source {
    grid-column: 1 / -1;
  }

  section p {
    max-width: 65ch;
    line-height: var(--leading-relaxed);
  }

  h2 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-5xl);
    line-height: var(--leading-tight);
    margin-bottom: var(--spacing-sm);
  }

  .peak {
    font-family: var(--font-sans);
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  .peak-number {
    font-family: var(--font-display);
    font-size: var(--font-size-display);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-accent);
    margin-right: var(--spacing-xxs);
  }

  .note {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
    max-width: 62ch;
  }

  .source {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
    border-top: var(--border-width-thin) solid var(--color-border);
    padding-top: var(--spacing-sm);
  }
</style>
