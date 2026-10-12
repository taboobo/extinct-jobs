<!--
  CareerPaths.stories.svelte

  Stories for the CareerPaths component.
  The same people followed through several censuses, one column per census.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CareerPaths from '$lib/components/ExtinctJobs/CareerPaths.svelte';
  import data from '$lib/data/jobs.json';

  const cohort = (id, start) =>
    data.jobs.find((j) => j.id === id).cohorts.find((c) => c.start === start);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/CareerPaths',
    component: CareerPaths,
    tags: ['autodocs'],
    argTypes: {
      cohort: {
        control: 'object',
        description:
          '{ start, years, category, started, people, stages, links } from jobs.json',
      },
    },
  });
</script>

<!-- Teamsters from 1880: some became truck drivers by 1910 -->
<Story name="Teamsters from 1880" args={{ cohort: cohort('teamster', 1880) }} />

<!-- Five censuses: blacksmiths from 1870 to 1920 -->
<Story
  name="Blacksmiths from 1870"
  args={{ cohort: cohort('blacksmith', 1870) }}
/>
