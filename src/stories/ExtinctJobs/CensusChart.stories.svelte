<!--
  CensusChart.stories.svelte

  Stories for the CensusChart component.
  Bar chart of estimated workers per census, 1850–1940, with 1890 marked as lost and pale bars for estimates from few records.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CensusChart from '$lib/components/ExtinctJobs/CensusChart.svelte';
  import data from '$lib/data/jobs.json';
  const job = (id) => data.jobs.find((j) => j.id === id);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/CensusChart',
    component: CensusChart,
    tags: ['autodocs'],
    argTypes: {
      series: {
        control: 'object',
        description: 'Census points: { year, people, records, reliable }',
      },
      name: {
        control: 'text',
        description: 'Job name used in the accessible description',
      },
    },
  });
</script>

<!-- Peak in 1920 -->
<Story
  name="Telegraph operator"
  args={{
    series: job('telegraph-operator').census.series,
    name: 'telegraph operators',
  }}
/>

<!-- Long decline from 1850 -->
<Story
  name="Wheelwright"
  args={{ series: job('wheelwright').census.series, name: 'wheelwrights' }}
/>

<!-- Mostly pale bars: small sample counts -->
<Story
  name="Few records"
  args={{ series: job('lamplighter').census.series, name: 'lamplighters' }}
/>
