<!--
@component
Colophon.svelte — Site footer with the data sources and the citations their
licenses require (IPUMS USA, IPUMS MLP, Wikipedia, Wikimedia Commons).
-->
<script>
  import { base } from '$app/paths';
</script>

<footer class="colophon">
  <p>
    Census figures come from <a href="https://usa.ipums.org/">IPUMS USA</a>
    (Steven Ruggles et al., University of Minnesota), and the links between censuses
    from the
    <a href="https://usa.ipums.org/usa/mlp.shtml"
      >IPUMS Multigenerational Longitudinal Panel</a
    >. Only totals are shown; no individual records are published.
  </p>
  <p>
    Job descriptions are adapted from Wikipedia’s
    <a href="https://en.wikipedia.org/wiki/List_of_obsolete_occupations"
      >List of obsolete occupations</a
    >
    (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a
    >). Pictures are from Wikimedia Commons, credited on each page.
  </p>
  <p><a href="{base}/about">How this was made</a></p>
</footer>

<style lang="scss">
  .colophon {
    max-width: var(--max-width-wide);
    margin: var(--spacing-xxl) auto 0;
    padding: var(--spacing-md);
    border-top: var(--border-width-thin) solid var(--color-rule);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    line-height: var(--leading-caption);
    color: var(--color-medium-gray);
  }

  p {
    max-width: 72ch;
  }

  a {
    color: var(--color-text);
  }
</style>
