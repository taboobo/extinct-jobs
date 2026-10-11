<!--
  TransitionBars.stories.svelte

  Stories for the TransitionBars component.
  Where workers in a job in one census were working ten years later. Staying in the same job is marked; the remainder is drawn as an outline.
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
      transitions: {
        control: 'object',
        description:
          '{ from, to, basis, category, linkedPeople, destinations }',
      },
    },
  });
</script>

<!-- Exact census category -->
<Story
  name="Telegraph operator"
  args={{ transitions: job('telegraph-operator').transitions }}
/>

<!-- Broader census category that includes the job -->
<Story name="Iceman" args={{ transitions: job('iceman').transitions }} />
