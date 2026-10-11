<!--
@component
About page: where the data comes from, how the numbers are made, and their limits.
-->
<svelte:head>
  <title>About the data | Extinct Jobs</title>
</svelte:head>

<article class="about">
  <h1>About the data</h1>

  <section>
    <h2>The jobs</h2>
    <p>
      The list starts from Wikipedia’s
      <a href="https://en.wikipedia.org/wiki/List_of_obsolete_occupations"
        >List of obsolete occupations</a
      >, which includes jobs that employed many people, are now gone or nearly
      gone, and are documented in published sources. Descriptions, reasons and
      dates come from that list.
    </p>
  </section>

  <section>
    <h2>How many people did each job</h2>
    <p>
      Census takers wrote down each person’s job in their own words. IPUMS USA
      keeps those words in samples of the 1850 to 1940 censuses (1% to 10% of
      the population, depending on the year). We searched them for each job’s
      title and its common abbreviations, such as “TELEG OPR,” and used the
      samples’ weights to estimate national totals. From 1910 the census wrote
      job and industry separately, so some matches use both, for example
      “OPERATOR” in the “TELEPHONE” industry.
    </p>
    <p>
      Estimates based on fewer than 10 sample records are drawn faint on the
      charts. The 1890 census is missing because its records were destroyed in a
      1921 fire.
    </p>
  </section>

  <section>
    <h2>Where workers went next</h2>
    <p>
      The <a href="https://usa.ipums.org/usa/mlp.shtml"
        >IPUMS Multigenerational Longitudinal Panel</a
      > links the same people across complete census records. For a few jobs whose
      census category is the job itself, or close to it, we show where people in that
      category in 1910 were working in 1920. Links where a person’s recorded sex differs
      between censuses are dropped as likely errors.
    </p>
    <p>
      Matched people are not a perfect sample. Women who changed their surname
      at marriage, people with common names and immigrants whose names were
      spelled differently are matched less often, and people who died or left
      the country can’t be matched at all.
    </p>
  </section>

  <section>
    <h2>What isn’t published</h2>
    <p>
      Under the IPUMS terms of use, this site shows only totals. No individual
      census records are published, and destinations with fewer than 10 people
      are grouped into “Everything else.”
    </p>
  </section>

  <section>
    <h2>Citations</h2>
    <ul>
      <li>
        Steven Ruggles, Sarah Flood, Matthew Sobek, et al. IPUMS USA.
        Minneapolis, MN: IPUMS. <a href="https://usa.ipums.org/"
          >usa.ipums.org</a
        >
      </li>
      <li>
        IPUMS Multigenerational Longitudinal Panel (MLP). Minneapolis, MN:
        IPUMS.
      </li>
      <li>
        Wikipedia contributors, “List of obsolete occupations,” CC BY-SA 4.0.
      </li>
      <li>Pictures: Wikimedia Commons, credited on each job page.</li>
    </ul>
  </section>
</article>

<style lang="scss">
  .about {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  h1 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-extrabold);
    font-size: clamp(3rem, 9vw, 6rem);
    line-height: 0.9;
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-4xl);
    margin-top: var(--spacing-lg);
  }

  p,
  li {
    max-width: 66ch;
    line-height: var(--leading-relaxed);
  }

  ul {
    padding-left: var(--spacing-md);
  }
</style>
