<!--
  RelatedJobs.stories.svelte

  Stories for the RelatedJobs component.
  A short list of other jobs with preview cards.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import RelatedJobs from '$lib/components/ExtinctJobs/RelatedJobs.svelte';
  import { jobSummary, relatedJobs } from '$lib/jobs.js';
  import data from '$lib/data/jobs.json';
  const all = data.jobs.map(jobSummary);
  const iceman = all.find((j) => j.id === 'iceman');

  const { Story } = defineMeta({
    title: 'ExtinctJobs/RelatedJobs',
    component: RelatedJobs,
    tags: ['autodocs'],
    argTypes: {
      jobs: { control: 'object', description: 'Job summaries' },
    },
  });
</script>

<!-- Jobs that ended the same way as the iceman -->
<Story name="Related to iceman" args={{ jobs: relatedJobs(iceman, all) }} />
