<!--
  MarginNotes.stories.svelte

  Stories for the MarginNotes component.
  Content with notes in a margin column on wide screens, stacked below on narrow ones.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MarginNotes from '$lib/components/ExtinctJobs/MarginNotes.svelte';
  import Sidenote from '$lib/components/ExtinctJobs/Sidenote.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/MarginNotes',
    component: MarginNotes,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" asChild>
  <MarginNotes>
    <p>
      Main content goes here: a chart, a list, or a paragraph that the notes
      explain.
    </p>
    {#snippet notes()}
      <Sidenote>A caveat about the content.</Sidenote>
      <Sidenote>A second note, such as a source.</Sidenote>
    {/snippet}
  </MarginNotes>
</Story>
