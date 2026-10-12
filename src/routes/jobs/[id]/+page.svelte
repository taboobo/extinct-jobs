<!--
@component
Job detail page: what the job was, why it ended, how many people did it in
each census, where its workers went next and came from, and jobs that ended the same way. Caveats sit in margin notes.
-->
<script>
  import { base } from '$app/paths';
  import CensusChart from '$lib/components/ExtinctJobs/CensusChart.svelte';
  import FlowSankey from '$lib/components/ExtinctJobs/FlowSankey.svelte';
  import CareerPaths from '$lib/components/ExtinctJobs/CareerPaths.svelte';
  import MarginNotes from '$lib/components/ExtinctJobs/MarginNotes.svelte';
  import Sidenote from '$lib/components/ExtinctJobs/Sidenote.svelte';
  import RelatedJobs from '$lib/components/ExtinctJobs/RelatedJobs.svelte';
  import DecadePicker from '$lib/components/ExtinctJobs/DecadePicker.svelte';
  import BritishCensus from '$lib/components/ExtinctJobs/BritishCensus.svelte';
  import BookMentions from '$lib/components/ExtinctJobs/BookMentions.svelte';
  import {
    centuryLabel,
    flowYears,
    formatNumber,
    formatOneIn,
    peak,
    peakBy,
  } from '$lib/jobs.js';

  let { data } = $props();
  const job = $derived(data.job);
  const census = $derived(job.census);
  const top = $derived(peak(census.series));
  const topShare = $derived(peakBy(census.series, 'share'));
  // Which census year sits in the middle of the flow chart; starts at the
  // year before the decade the job shrank most.
  const years = $derived(flowYears(job.flows));
  let picked = $state(null);
  $effect(() => {
    job.id;
    picked = null;
  });
  const startYear = $derived(job.flows[job.defaultFlow ?? 0]?.from);
  const yearIndex = $derived(
    picked ??
      Math.max(
        0,
        years.findIndex((y) => y.year === startYear)
      )
  );
  const flowYear = $derived(years[yearIndex]);

  // The same people followed through several censuses, when there are enough.
  const VIEWS = ['Over the decades', 'One census before and after'];
  let view = $state(0);
  let pickedCohort = $state(null);
  $effect(() => {
    job.id;
    view = 0;
    pickedCohort = null;
  });
  const cohorts = $derived(job.cohorts ?? []);
  // Start with the biggest group followed across at least four censuses.
  const bestCohort = $derived.by(() => {
    const long = cohorts.filter((c) => c.years.length >= 4);
    const pool = long.length ? long : cohorts;
    const best = pool.reduce(
      (a, c) => (!a || c.people > a.people ? c : a),
      null
    );
    return Math.max(0, cohorts.indexOf(best));
  });
  const cohortIndex = $derived(pickedCohort ?? bestCohort);
  const cohort = $derived(cohorts[cohortIndex]);
  const showPaths = $derived(cohorts.length > 0 && view === 0);

  const hasFaint = $derived(
    census.series.some((s) => s.people > 0 && !s.reliable)
  );

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
        {#if job.startCentury == null && job.endedByYear}
          <span class="ended">Mostly gone by {job.endedByYear}</span>
        {:else}
          <span>Practiced from {centuryLabel(job.startCentury)}</span>
          <span class="ended">to {centuryLabel(job.endCentury)}</span>
        {/if}
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
      {#if data.related.length}
        <h3 class="related-heading">Other jobs that ended this way</h3>
        <RelatedJobs jobs={data.related} />
      {/if}
    </section>

    <section class="wide">
      <h2>How many Americans did this work</h2>
      {#if census.series.length}
        {#if top}
          <p class="peak">
            {#if census.seriesSource === 'title'}At least{/if}
            <span class="peak-number">{formatNumber(top.people)}</span>
            people at the peak, in {top.year}{#if !top.reliable}
              <span class="rough-note">(a rough estimate from few records)</span
              >{/if}
          </p>
          {#if topShare && topShare.year !== top.year}
            <p class="share-peak">
              As a share of all workers it peaked earlier, in {topShare.year},
              at {formatOneIn(topShare.share)}. By {top.year} it was {formatOneIn(
                top.share
              )}.
            </p>
          {:else if topShare}
            <p class="share-peak">
              That year it was {formatOneIn(topShare.share)}.
            </p>
          {/if}
        {/if}
        <MarginNotes>
          <CensusChart
            series={census.series}
            name={job.name.toLowerCase()}
            source={census.seriesSource}
          />
          {#snippet notes()}
            <Sidenote>
              {#if census.seriesSource === 'category'}
                Based on the census category for {census.category.toLowerCase()},
                estimated from census samples.
              {:else}
                Counted from the titles people wrote, so a few matches may be
                other jobs with similar names.
              {/if}
            </Sidenote>
            {#if job.note}
              <Sidenote>{job.note}</Sidenote>
            {/if}
            {#if hasFaint}
              <Sidenote>
                Pale bars rest on fewer than 10 sample records and are rough.
              </Sidenote>
            {/if}
            <Sidenote>
              The 1890 census records were destroyed in a 1921 fire.
              <a href="{base}/about">How these numbers were made</a>
            </Sidenote>
          {/snippet}
        </MarginNotes>
      {:else}
        <p class="note">{noCensusReason}</p>
      {/if}
    </section>

    {#if job.books}
      <section class="wide">
        <h2>How often it was written about</h2>
        <BookMentions books={job.books} name={job.name.toLowerCase()} />
      </section>
    {/if}

    {#if job.uk}
      <section class="wide">
        <h2>In Britain and Ireland</h2>
        <BritishCensus uk={job.uk} />
      </section>
    {/if}

    {#if census.series.length}
      <section class="wide">
        <h2>Where workers came from and went next</h2>
        {#if cohorts.length}
          <DecadePicker
            options={VIEWS}
            bind:selected={view}
            label="How to show where workers went"
          />
        {/if}
        {#if showPaths}
          <DecadePicker
            options={cohorts.map((c) => `From ${c.start}`)}
            bind:selected={() => cohortIndex, (i) => (pickedCohort = i)}
            label="Census to start following people from"
          />
          <MarginNotes>
            <CareerPaths {cohort} />
            {#snippet notes()}
              <Sidenote>
                Based on people IPUMS matched from census to census. Women who
                changed their surname at marriage are often missed, so treat
                these shares as approximate.
              </Sidenote>
              <Sidenote>
                The same people are followed all the way across, so a ribbon is
                one group of real careers.
              </Sidenote>
            {/snippet}
          </MarginNotes>
        {:else if flowYear}
          <DecadePicker
            options={years.map((y) => String(y.year))}
            bind:selected={() => yearIndex, (i) => (picked = i)}
            label="Census year in the middle"
          />
          <MarginNotes>
            <FlowSankey
              year={flowYear.year}
              prev={flowYear.prev}
              next={flowYear.next}
              before={flowYear.before}
              after={flowYear.after}
              categories={data.categories}
            />
            {#snippet notes()}
              <Sidenote>
                Based on people IPUMS matched between two censuses, aged 15 to
                64 and with a job. Women who changed their surname at marriage
                are often missed, so treat these shares as approximate.
              </Sidenote>
              <Sidenote>
                Hover or tap a job to see how big it was. “Everything else”
                includes many small groups.
              </Sidenote>
            {/snippet}
          </MarginNotes>
        {:else}
          <p class="note">
            There aren’t enough matched census records yet to follow people in
            this job from one census to the next.
          </p>
        {/if}
      </section>
    {/if}

    {#if job.references?.length}
      <section class="wide sources">
        <h2>Sources</h2>
        <ol>
          {#each job.references as ref (ref.text)}
            <li>
              {#if ref.url}<a href={ref.url}>{ref.text}</a
                >{:else}{ref.text}{/if}
            </li>
          {/each}
        </ol>
        {#if job.origin === 'wikipedia'}
          <p class="note">Sources cited by Wikipedia for this job.</p>
        {/if}
      </section>
    {/if}

    <p class="source">
      {#if job.descriptionSource === 'wikipedia' && job.reasonSource === 'wikipedia'}
        Description and reason adapted from <a href={job.wikipediaUrl}
          >Wikipedia</a
        >
        (CC BY-SA 4.0).
      {:else}
        {#if job.descriptionSource === 'wikipedia'}
          Description adapted from <a href={job.wikipediaUrl}>Wikipedia</a> (CC BY-SA
          4.0).
        {/if}
        {#if job.draft}
          {job.descriptionSource === 'wikipedia'
            ? 'The reason it disappeared is'
            : 'This text is'}
          an Extinct Jobs draft and still needs sources.
        {/if}
        {#if job.origin === 'census'}
          This job comes from the U.S. census’s own job categories, where it was
          “{job.census.category}”.
        {/if}
      {/if}
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
      grid-template-columns: 2fr 1fr;
      align-items: start;

      @include mobile {
        grid-template-columns: 1fr;
      }
    }
  }

  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-extrabold);
    font-size: clamp(2.25rem, 6vw, 3.5rem);
    line-height: 1.05;
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
      max-height: 18rem;
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

  .sources ol {
    padding-left: var(--spacing-md);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    max-width: 75ch;

    li + li {
      margin-top: var(--spacing-xs);
    }
  }

  .share-peak {
    margin-top: calc(-1 * var(--spacing-xs));
    font-family: var(--font-sans);
    color: var(--color-text);
  }

  .related-heading {
    margin: var(--spacing-md) 0 var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
  }

  .rough-note {
    color: var(--color-medium-gray);
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
