<!--
  DecadePicker.stories.svelte

  Stories for the DecadePicker component.
  Buttons for choosing which pair of censuses to show; hidden with a single choice.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DecadePicker from '$lib/components/ExtinctJobs/DecadePicker.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/DecadePicker',
    component: DecadePicker,
    tags: ['autodocs'],
    argTypes: {
      flows: { control: 'object', description: '[{ from, to }]' },
      selected: { control: 'number', description: 'Index of the chosen pair' },
      label: { control: 'text', description: 'Accessible name for the group' },
    },
  });
</script>

<!-- Several census pairs -->
<Story
  name="Several pairs"
  args={{
    flows: [
      { from: 1880, to: 1900 },
      { from: 1900, to: 1910 },
      { from: 1910, to: 1920 },
      { from: 1920, to: 1930 },
    ],
    selected: 2,
  }}
/>

<!-- A single pair renders nothing -->
<Story name="Single pair" args={{ flows: [{ from: 1910, to: 1920 }] }} />
