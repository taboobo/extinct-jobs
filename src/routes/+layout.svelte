<!--
@component
This is the LAYOUT file.
It wraps every page on your site with the Extinct Jobs masthead and colophon.
-->
<script>
  // Import global styles
  import '../app.scss';

  import Masthead from '$lib/components/ExtinctJobs/Masthead.svelte';
  import Colophon from '$lib/components/ExtinctJobs/Colophon.svelte';
  import { page } from '$app/state';
  import { base } from '$app/paths';

  // In Svelte 5, we use $props() to receive the page content
  let { children } = $props();

  const current = $derived(
    page.url.pathname === `${base}/`
      ? 'home'
      : page.url.pathname.startsWith(`${base}/about`)
        ? 'about'
        : ''
  );
</script>

<Masthead {current} />

<main>
  <!-- This renders the current page's content -->
  {@render children()}
</main>

<Colophon />

<style>
  main {
    min-height: calc(100vh - var(--site-chrome-height));
  }
</style>
