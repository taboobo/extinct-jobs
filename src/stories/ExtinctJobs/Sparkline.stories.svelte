<!--
  Sparkline.stories.svelte

  Stories for the Sparkline component.
  A tiny bar trend of workers per census, 1850–1940, used in the job list.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
  import data from '$lib/data/jobs.json';
  const job = (id) => data.jobs.find((j) => j.id === id);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/Sparkline',
    component: Sparkline,
    tags: ['autodocs'],
    argTypes: {
      series: {
        control: 'object',
        description: 'Census points: { year, people, records, reliable }',
      },
      width: { control: 'number', description: 'Drawing width in pixels' },
      height: { control: 'number', description: 'Drawing height in pixels' },
    },
  });
</script>

<!-- Rising and falling: telegraph operators -->
<Story
  name="Telegraph operator"
  args={{ series: job('telegraph-operator').census.series }}
/>

<!-- Steady decline: coopers -->
<Story name="Cooper" args={{ series: job('cooper').census.series }} />

<!-- Few records: pale bars -->
<Story name="Few records" args={{ series: job('lamplighter').census.series }} />

<!-- Larger drawing -->
<Story
  name="Large"
  args={{
    series: job('elevator-operator').census.series,
    width: 240,
    height: 60,
  }}
/>
