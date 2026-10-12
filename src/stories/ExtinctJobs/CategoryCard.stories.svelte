<!--
  CategoryCard.stories.svelte

  Stories for the CategoryCard component.
  Preview card for a census job category, with its size over time.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CategoryCard from '$lib/components/ExtinctJobs/CategoryCard.svelte';
  import data from '$lib/data/jobs.json';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/CategoryCard',
    component: CategoryCard,
    tags: ['autodocs'],
    argTypes: {
      category: {
        control: 'object',
        description: '{ label, occupational, series, jobId }',
      },
    },
  });
</script>

<!-- A category that is one of our jobs -->
<Story name="Linked to a job" args={{ category: data.categories['370'] }} />

<!-- An ordinary category -->
<Story
  name="Category"
  args={{
    category: data.categories['390'] ?? Object.values(data.categories)[0],
  }}
/>

<!-- Not an occupation -->
<Story
  name="No occupation"
  args={{
    category: {
      label: 'No occupation listed',
      occupational: false,
      series: [],
      jobId: null,
    },
  }}
/>
