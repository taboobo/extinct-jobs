<!--
  Masthead.stories.svelte

  Stories for the Masthead component.
  Site header with the site name and a link to the About page.
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Masthead from '$lib/components/ExtinctJobs/Masthead.svelte';

  const { Story } = defineMeta({
    title: 'ExtinctJobs/Masthead',
    component: Masthead,
    tags: ['autodocs'],
    argTypes: {
      current: {
        control: 'select',
        options: ['', 'home', 'about'],
        description: 'Current page',
      },
    },
  });
</script>

<Story name="Home" args={{ current: 'home' }} />

<Story name="About" args={{ current: 'about' }} />
