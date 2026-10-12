<!--
  Sidenote.stories.svelte

  Stories for the Sidenote component.
  A short note beside the content it explains.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Sidenote from '$lib/components/ExtinctJobs/Sidenote.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/Sidenote',
    component: Sidenote,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" asChild>
  <Sidenote>The 1890 census records were destroyed in a 1921 fire.</Sidenote>
</Story>
