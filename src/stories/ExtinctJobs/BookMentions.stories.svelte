<!--
  BookMentions.stories.svelte

  Stories for the BookMentions component.
  How often a job's name appeared in English books, 1800–2019 (Google Books Ngram).
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BookMentions from '$lib/components/ExtinctJobs/BookMentions.svelte';

  // A rise-and-fall shape like a 19th-century job; values per million words.
  const points = Array.from({ length: 44 }, (_, i) => {
    const year = 1800 + i * 5;
    return {
      year,
      perMillion: Math.max(
        0.002,
        0.12 * Math.exp(-(((year - 1895) / 35) ** 2))
      ),
    };
  });

  const { Story } = defineMeta({
    title: 'ExtinctJobs/BookMentions',
    component: BookMentions,
    tags: ['autodocs'],
    argTypes: {
      books: {
        control: 'object',
        description: '{ query, points, peakYear, note }',
      },
      name: {
        control: 'text',
        description: 'Job name for the accessible description',
      },
    },
  });
</script>

<Story
  name="Rise and fall"
  args={{
    books: {
      query: 'lamplighter, lamplighters',
      points,
      peakYear: 1895,
      note: null,
    },
    name: 'lamplighter',
  }}
/>
