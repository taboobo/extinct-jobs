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
        description:
          '{ spellings, withPlurals, points, peakYear, note, peakCaveat }',
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
      spellings: ['lamplighter', 'lamp lighter', 'lamp-lighter'],
      withPlurals: true,
      points,
      peakYear: 1895,
      note: null,
    },
    name: 'lamplighter',
  }}
/>

<!-- A peak long after the job ended gets a "?" marker with the reason -->
<Story
  name="Questionable peak"
  args={{
    books: {
      spellings: ['matchgirl', 'match girl'],
      withPlurals: true,
      points: points.map((p) => ({
        ...p,
        perMillion: 0.01 + (p.year - 1800) / 5000,
      })),
      peakYear: 2015,
      note: null,
      peakCaveat: {
        afterEnd: true,
        endedByYear: null,
        endCentury: 20,
        note: '“Match girl” makes up most of this line, and since 1900, 80–89% of “match girl” in books is part of “little match girl”, from Hans Christian Andersen’s story.',
      },
    },
    name: 'matchgirl',
  }}
/>
