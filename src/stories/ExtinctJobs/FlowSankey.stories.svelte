<!--
  FlowSankey.stories.svelte

  Stories for the FlowSankey component.
  Where a job's workers came from and went next, with time running left to right.
  Category names open a CategoryCard preview when `categories` is given.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FlowSankey from '$lib/components/ExtinctJobs/FlowSankey.svelte';
  import data from '$lib/data/jobs.json';
  import { flowYears } from '$lib/jobs.js';

  const at = (id, year) =>
    flowYears(data.jobs.find((j) => j.id === id).flows).find(
      (y) => y.year === year
    );
  const args = (id, year) => {
    const y = at(id, year);
    return {
      year: y.year,
      prev: y.prev,
      next: y.next,
      before: y.before,
      after: y.after,
      categories: data.categories,
    };
  };

  const { Story } = defineMeta({
    title: 'ExtinctJobs/FlowSankey',
    component: FlowSankey,
    tags: ['autodocs'],
    argTypes: {
      year: { control: 'number', description: 'Census year in the middle' },
      prev: { control: 'number', description: 'Census year on the left' },
      next: { control: 'number', description: 'Census year on the right' },
      before: {
        control: 'object',
        description: '{ basis, category, linkedPeople, origins } or null',
      },
      after: {
        control: 'object',
        description: '{ basis, category, linkedPeople, destinations } or null',
      },
      categories: {
        control: 'object',
        description:
          'code -> { label, occupational, series, jobId } for previews',
      },
    },
  });
</script>

<!-- Both sides: blacksmiths in 1910 -->
<Story name="Before and after" args={args('blacksmith', 1910)} />

<!-- First census with linked records: only the right side -->
<Story name="Only after" args={args('telegraph-operator', 1860)} />

<!-- Latest census so far: only the left side -->
<Story name="Only before" args={args('telegraph-operator', 1920)} />
