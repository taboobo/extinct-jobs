<!--
  Colophon.stories.svelte

  Stories for the Colophon component.
  Site footer with data sources and required citations.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Colophon from '$lib/components/ExtinctJobs/Colophon.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/Colophon',
    component: Colophon,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" />
