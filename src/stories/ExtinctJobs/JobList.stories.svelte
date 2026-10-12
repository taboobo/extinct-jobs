<!--
  JobList.stories.svelte

  Stories for the JobList component.
  The ruled ledger table of jobs: name, centuries practiced, why it ended, and a census trend.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import JobList from '$lib/components/ExtinctJobs/JobList.svelte';
  import data from '$lib/data/jobs.json';
  const pick = (ids) =>
    data.jobs
      .filter((j) => ids.includes(j.id))
      .map((j) => ({ ...j, series: j.census.series }));

  const { Story } = defineMeta({
    title: 'ExtinctJobs/JobList',
    component: JobList,
    tags: ['autodocs'],
    argTypes: {
      jobs: {
        control: 'object',
        description: 'Job summaries with a series of census points',
      },
    },
  });
</script>

<!-- Mix of jobs with and without census records -->
<Story
  name="Mixed"
  args={{
    jobs: pick([
      'alewife',
      'cooper',
      'iceman',
      'samurai',
      'telegraph-operator',
    ]),
  }}
/>

<!-- Empty list -->
<Story name="Empty" args={{ jobs: [] }} />
