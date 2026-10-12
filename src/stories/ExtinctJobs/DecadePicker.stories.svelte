<!--
  DecadePicker.stories.svelte

  Stories for the DecadePicker component.
  Buttons for choosing a census year; hidden with a single choice.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DecadePicker from '$lib/components/ExtinctJobs/DecadePicker.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/DecadePicker',
    component: DecadePicker,
    tags: ['autodocs'],
    argTypes: {
      options: {
        control: 'object',
        description: "Button labels, e.g. ['1900', '1910']",
      },
      selected: { control: 'number', description: 'Index of the chosen year' },
      label: { control: 'text', description: 'Accessible name for the group' },
    },
  });
</script>

<!-- Several census years -->
<Story
  name="Several years"
  args={{
    options: ['1880', '1900', '1910', '1920'],
    selected: 2,
  }}
/>

<!-- A single year renders nothing -->
<Story name="Single year" args={{ options: ['1910'] }} />
