<!--
  BritishCensus.stories.svelte

  Stories for the BritishCensus component.
  Counts from the 1841-1861 British census report tables, with the titles counted.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BritishCensus from '$lib/components/ExtinctJobs/BritishCensus.svelte';
  import data from '$lib/data/jobs.json';
  const job = (id) => data.jobs.find((j) => j.id === id);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/BritishCensus',
    component: BritishCensus,
    tags: ['autodocs'],
    argTypes: {
      uk: {
        control: 'object',
        description: '{ counts: [{ year, area, people, ... }], note }',
      },
    },
  });
</script>

<!-- One title per row -->
<Story name="Blacksmith" args={{ uk: job('blacksmith').uk }} />

<!-- Several titles, with a note -->
<Story name="Teamster" args={{ uk: job('teamster').uk }} />
