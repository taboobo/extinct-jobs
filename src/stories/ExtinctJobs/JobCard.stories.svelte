<!--
  JobCard.stories.svelte

  Stories for the JobCard component.
  Preview card for a job.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import JobCard from '$lib/components/ExtinctJobs/JobCard.svelte';
  import { jobSummary } from '$lib/jobs.js';
  import data from '$lib/data/jobs.json';
  const job = (id) => jobSummary(data.jobs.find((j) => j.id === id));

  const { Story } = defineMeta({
    title: 'ExtinctJobs/JobCard',
    component: JobCard,
    tags: ['autodocs'],
    argTypes: {
      job: {
        control: 'object',
        description: '{ id, name, summary, endCentury, reasonTypes, series }',
      },
    },
  });
</script>

<!-- With a census trend -->
<Story name="With census trend" args={{ job: job('telegraph-operator') }} />

<!-- Without census records -->
<Story name="No census" args={{ job: job('samurai') }} />
