<!--
  SpellingList.stories.svelte

  Stories for the SpellingList component.
  The most common ways census takers wrote a job down, with record counts and years.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SpellingList from '$lib/components/ExtinctJobs/SpellingList.svelte';
  import data from '$lib/data/jobs.json';
  const job = (id) => data.jobs.find((j) => j.id === id);

  const { Story } = defineMeta({
    title: 'ExtinctJobs/SpellingList',
    component: SpellingList,
    tags: ['autodocs'],
    argTypes: {
      spellings: {
        control: 'object',
        description: '[{ writtenAs, records, firstYear, lastYear }]',
      },
    },
  });
</script>

<!-- Title and job + industry forms -->
<Story
  name="Telegraph operator"
  args={{ spellings: job('telegraph-operator').census.spellings }}
/>

<!-- Horse-to-truck shift visible in the wording -->
<Story name="Iceman" args={{ spellings: job('iceman').census.spellings }} />
