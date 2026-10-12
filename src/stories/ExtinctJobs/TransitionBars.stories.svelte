<!--
  TransitionBars.stories.svelte

  Stories for the TransitionBars component.
  Job moves between two censuses as horizontal bars, in either direction. Category
  names open a CategoryCard preview when `categories` is given.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TransitionBars from '$lib/components/ExtinctJobs/TransitionBars.svelte';
  import data from '$lib/data/jobs.json';
  const job = (id) => data.jobs.find((j) => j.id === id);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/TransitionBars',
    component: TransitionBars,
    tags: ['autodocs'],
    argTypes: {
      flow: {
        control: 'object',
        description:
          '{ from, to, basis, category, linkedPeople, destinations | origins }',
      },
      direction: {
        control: 'select',
        options: ['to', 'from'],
        description: "'to': where people went; 'from': where they came from",
      },
      categories: {
        control: 'object',
        description:
          'code -> { label, occupational, series, jobId } for previews',
      },
    },
  });
</script>

<!-- Where telegraph operators went, with category previews -->
<Story
  name="Went to"
  args={{
    flow: job('telegraph-operator').transitions,
    direction: 'to',
    categories: data.categories,
  }}
/>

<!-- Where telegraph operators came from -->
<Story
  name="Came from"
  args={{
    flow: job('telegraph-operator').arrivals,
    direction: 'from',
    categories: data.categories,
  }}
/>

<!-- Broader census category that includes the job -->
<Story
  name="Broader category"
  args={{ flow: job('iceman').transitions, categories: data.categories }}
/>
