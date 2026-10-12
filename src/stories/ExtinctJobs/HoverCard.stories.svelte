<!--
  HoverCard.stories.svelte

  Stories for the HoverCard component.
  A link or label that opens a preview card on hover, focus or first tap.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
  import JobCard from '$lib/components/ExtinctJobs/JobCard.svelte';
  import { jobSummary } from '$lib/jobs.js';
  import data from '$lib/data/jobs.json';
  const iceman = jobSummary(data.jobs.find((j) => j.id === 'iceman'));

  const { Story } = defineMeta({
    title: 'ExtinctJobs/HoverCard',
    component: HoverCard,
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text', description: 'Trigger text' },
      href: {
        control: 'text',
        description: 'Optional link; without it the trigger is a button',
      },
    },
  });
</script>

<!-- A link with a job preview -->
<Story name="Link with job card" asChild>
  <p>
    Hover or focus
    <HoverCard label="Iceman" href="/jobs/iceman">
      {#snippet card()}<JobCard job={iceman} />{/snippet}
    </HoverCard>
    to preview it.
  </p>
</Story>

<!-- A button (no link) with plain text -->
<Story name="Button" asChild>
  <p>
    <HoverCard label="TELEG OPR">
      {#snippet card()}<span>TELEG = telegraph, OPR = operator</span>{/snippet}
    </HoverCard>
  </p>
</Story>

<!-- A small round "?" marker; the label is read out and names the card -->
<Story name="Dot" asChild>
  <p>
    Peak 2015
    <HoverCard label="Why the 2015 peak may be misleading" dot>
      {#snippet card()}<span
          >Most of these mentions are part of “little match girl”.</span
        >{/snippet}
    </HoverCard>
  </p>
</Story>
