<!--
@component
Masthead.svelte — Site header for Extinct Jobs: the site name linking home and
a link to the About page. Marks the current page for screen readers.

Props:
- current: 'home' | 'about' | '' — which nav item is the current page
-->
<script>
  import { base } from '$app/paths';

  let { current = '' } = $props();
</script>

<header class="masthead">
  <a
    class="name"
    href="{base}/"
    aria-current={current === 'home' ? 'page' : undefined}>Extinct Jobs</a
  >
  <nav aria-label="Site">
    <a
      href="{base}/about"
      aria-current={current === 'about' ? 'page' : undefined}>About the data</a
    >
  </nav>
</header>

<style lang="scss">
  .masthead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-sm);
    max-width: var(--max-width-wide);
    margin: 0 auto;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: var(--border-width-thin) solid var(--color-rule);
  }

  .name {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-dark);
    text-decoration: none;
  }

  nav a {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  [aria-current='page'] {
    text-decoration: underline;
    text-decoration-color: var(--color-margin);
    text-decoration-thickness: 2px;
  }
</style>
