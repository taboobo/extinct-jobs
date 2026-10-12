import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
import CensusChart from '$lib/components/ExtinctJobs/CensusChart.svelte';
import TransitionBars from '$lib/components/ExtinctJobs/TransitionBars.svelte';
import JobList from '$lib/components/ExtinctJobs/JobList.svelte';
import Masthead from '$lib/components/ExtinctJobs/Masthead.svelte';
import Colophon from '$lib/components/ExtinctJobs/Colophon.svelte';
import HoverCard from '$lib/components/ExtinctJobs/HoverCard.svelte';
import JobCard from '$lib/components/ExtinctJobs/JobCard.svelte';
import CategoryCard from '$lib/components/ExtinctJobs/CategoryCard.svelte';
import Sidenote from '$lib/components/ExtinctJobs/Sidenote.svelte';
import MarginNotes from '$lib/components/ExtinctJobs/MarginNotes.svelte';
import RelatedJobs from '$lib/components/ExtinctJobs/RelatedJobs.svelte';
import DecadePicker from '$lib/components/ExtinctJobs/DecadePicker.svelte';
import BritishCensus from '$lib/components/ExtinctJobs/BritishCensus.svelte';
import BookMentions from '$lib/components/ExtinctJobs/BookMentions.svelte';
import {
  centuryLabel,
  formatOneIn,
  formatPercent,
  formatShare,
  peak,
  peakBy,
  relatedJobs,
} from '$lib/jobs.js';

const text = (html) => createRawSnippet(() => ({ render: () => html }));

const series = [
  { year: 1850, people: 400, share: 0.0001, records: 4, reliable: false },
  { year: 1900, people: 35000, share: 0.0012, records: 900, reliable: true },
  { year: 1920, people: 67000, share: 0.0016, records: 1400, reliable: true },
];

const transitions = {
  from: 1910,
  to: 1920,
  basis: 'exact',
  category: 'Telegraph operators',
  linkedPeople: 24882,
  destinations: [
    {
      code: 365,
      label: 'Telegraph operators',
      share: 0.34,
      same: true,
      other: false,
    },
    {
      code: 370,
      label: 'Telephone operators',
      share: 0.06,
      same: false,
      other: false,
    },
    {
      code: null,
      label: 'Everything else',
      share: 0.6,
      same: false,
      other: true,
    },
  ],
};

const categories = {
  370: {
    label: 'Telephone operators',
    occupational: true,
    series,
    jobId: 'switchboard-operator',
  },
};

const jobA = {
  id: 'iceman',
  name: 'Iceman',
  summary: 'Delivered ice.',
  endCentury: 20,
  reasonTypes: ['Technology'],
  series,
};
const jobB = { ...jobA, id: 'lamplighter', name: 'Lamplighter', series: [] };
const jobC = {
  ...jobA,
  id: 'samurai',
  name: 'Samurai',
  endCentury: 19,
  reasonTypes: ['Law or politics'],
};

describe('job helpers', () => {
  it('labels centuries', () => {
    expect(centuryLabel(17)).toBe('1600s');
    expect(centuryLabel(1)).toBe('1st century');
    expect(centuryLabel(-7)).toBe('7th century BCE');
    expect(centuryLabel(-70)).toBe('7,000 BCE');
    expect(centuryLabel(-99)).toBe('prehistory');
  });

  it('formats shares', () => {
    expect(formatShare(0.341)).toBe('34%');
    expect(formatShare(0.004)).toBe('<1%');
  });

  it('finds jobs that ended the same way', () => {
    const related = relatedJobs(jobA, [jobA, jobB, jobC]);
    expect(related.map((j) => j.id)).toEqual(['lamplighter']);
  });

  it('finds the peak', () => {
    expect(peak(series).year).toBe(1920);
    expect(peak([])).toBeNull();
  });
});

describe('Sparkline', () => {
  it('describes the peak', () => {
    render(Sparkline, { props: { series } });
    expect(
      screen.getByRole('img', { name: 'Peak of about 67,000 people in 1920' })
    ).toBeTruthy();
  });

  it('draws a faint bar for unreliable points', () => {
    const { container } = render(Sparkline, { props: { series } });
    expect(container.querySelectorAll('rect').length).toBe(3);
    expect(container.querySelectorAll('rect.faint').length).toBe(1);
  });
});

describe('CensusChart', () => {
  it('marks 1890 as lost', () => {
    render(CensusChart, { props: { series, name: 'telegraph operators' } });
    expect(screen.getByText('lost')).toBeTruthy();
    expect(screen.getByText('Records lost')).toBeTruthy();
  });

  it('calls title-search counts a minimum', () => {
    const { container } = render(CensusChart, {
      props: { series, source: 'title' },
    });
    expect(container.querySelector('figcaption').textContent).toMatch(
      /minimum/
    );
  });

  it('describes category counts without the minimum caveat', () => {
    const { container } = render(CensusChart, {
      props: { series, source: 'category' },
    });
    expect(container.querySelector('figcaption').textContent).not.toMatch(
      /minimum/
    );
  });

  it('includes a table of values', () => {
    render(CensusChart, { props: { series, name: 'telegraph operators' } });
    expect(screen.getByText('Show the numbers')).toBeTruthy();
    expect(screen.getAllByText('67,000').length).toBeGreaterThan(0);
  });

  it('labels the peak bar', () => {
    const { container } = render(CensusChart, { props: { series } });
    expect(container.querySelector('.peak-label').textContent).toBe('67,000');
  });

  it('explains rough estimates only when present', () => {
    const { container } = render(CensusChart, {
      props: { series: series.filter((s) => s.reliable) },
    });
    expect(container.querySelector('.legend').textContent).not.toMatch(
      /Rough estimate/
    );
  });

  it('shows a year’s numbers on focus', async () => {
    const { container } = render(CensusChart, { props: { series } });
    await fireEvent.focus(container.querySelectorAll('rect.hit')[1]);
    expect(container.querySelector('.tip').textContent).toMatch(
      /1900\s*35,000 people\s*1 in 833 workers\s*900 sample records/
    );
  });
});

describe('TransitionBars', () => {
  it('lists destinations with shares', () => {
    render(TransitionBars, { props: { flow: transitions, categories } });
    expect(screen.getByText('Telephone operators')).toBeTruthy();
    expect(screen.getByText('34%')).toBeTruthy();
  });

  it('marks staying in the same job and the remainder', () => {
    const { container } = render(TransitionBars, {
      props: { flow: transitions, categories },
    });
    expect(screen.getByText('(same job)')).toBeTruthy();
    expect(container.querySelectorAll('li.other').length).toBe(1);
  });

  it('explains a broader census category', () => {
    render(TransitionBars, {
      props: {
        flow: {
          ...transitions,
          basis: 'broader',
          category: 'Deliverymen',
        },
      },
    });
    expect(screen.getByText(/which includes this job/)).toBeTruthy();
  });
});

describe('TransitionBars previews', () => {
  it('turns known categories into preview links', () => {
    render(TransitionBars, { props: { flow: transitions, categories } });
    expect(
      screen
        .getByRole('link', { name: 'Telephone operators' })
        .getAttribute('href')
    ).toBe('/jobs/switchboard-operator');
  });

  it('shows arrivals in the other direction', () => {
    render(TransitionBars, {
      props: {
        flow: { ...transitions, origins: transitions.destinations },
        direction: 'from',
      },
    });
    expect(screen.getByText(/had been doing then/)).toBeTruthy();
  });
});

describe('HoverCard', () => {
  it('opens on keyboard focus and closes on Escape', async () => {
    render(HoverCard, {
      props: {
        label: 'Iceman',
        href: '/jobs/iceman',
        card: text('<span>Preview</span>'),
      },
    });
    const link = screen.getByRole('link', { name: 'Iceman' });
    await fireEvent.focusIn(link);
    expect(screen.getByRole('dialog', { name: 'Iceman' })).toBeTruthy();
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toggles from a button when there is no link', async () => {
    render(HoverCard, {
      props: { label: 'OPR', card: text('<span>operator</span>') },
    });
    const button = screen.getByRole('button', { name: 'OPR' });
    await fireEvent.pointerDown(button, { pointerType: 'mouse' });
    await fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows a dot trigger that still has a spoken name', async () => {
    render(HoverCard, {
      props: {
        label: 'Why this peak',
        dot: true,
        card: text('<span>x</span>'),
      },
    });
    const button = screen.getByRole('button', { name: 'Why this peak' });
    expect(button.textContent).toBe('?');
    await fireEvent.focusIn(button);
    expect(screen.getByRole('dialog', { name: 'Why this peak' })).toBeTruthy();
  });
});

describe('JobCard and CategoryCard', () => {
  it('links a job card to its page', () => {
    render(JobCard, { props: { job: jobA } });
    expect(
      screen.getByRole('link', { name: 'Open Iceman' }).getAttribute('href')
    ).toBe('/jobs/iceman');
  });

  it('describes a category’s peak and links its job', () => {
    render(CategoryCard, { props: { category: categories[370] } });
    expect(
      screen.getByText(/Largest in 1920, with about 67,000 people/)
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open this job' })).toBeTruthy();
  });

  it('explains non-occupations', () => {
    render(CategoryCard, {
      props: {
        category: {
          label: 'No occupation listed',
          occupational: false,
          series: [],
          jobId: null,
        },
      },
    });
    expect(screen.getByText(/recorded no occupation/)).toBeTruthy();
  });
});

describe('Sidenote and MarginNotes', () => {
  it('renders notes beside content', () => {
    render(MarginNotes, {
      props: {
        children: text('<p>Main</p>'),
        notes: text('<aside>A note</aside>'),
      },
    });
    expect(screen.getByText('Main')).toBeTruthy();
    expect(screen.getByText('A note')).toBeTruthy();
  });

  it('renders a sidenote as an aside', () => {
    const { container } = render(Sidenote, {
      props: { children: text('<span>Caveat</span>') },
    });
    expect(container.querySelector('aside.sidenote').textContent).toBe(
      'Caveat'
    );
  });
});

describe('RelatedJobs', () => {
  it('links each related job', () => {
    render(RelatedJobs, { props: { jobs: [jobA, jobB] } });
    expect(screen.getByRole('link', { name: 'Lamplighter' })).toBeTruthy();
  });
});

describe('JobList', () => {
  const jobs = [
    {
      id: 'telegraph-operator',
      name: 'Telegraph operator',
      summary: 'Sent messages by telegraph.',
      startCentury: 18,
      endCentury: 20,
      reasonTypes: ['Technology'],
      series,
    },
    {
      id: 'samurai',
      name: 'Samurai',
      summary: 'Japanese warriors.',
      startCentury: 10,
      endCentury: 19,
      reasonTypes: ['Law or politics'],
      series: [],
    },
  ];

  it('links each job to its page', () => {
    render(JobList, { props: { jobs } });
    expect(
      screen
        .getByRole('link', { name: 'Telegraph operator' })
        .getAttribute('href')
    ).toBe('/jobs/telegraph-operator');
  });
});

describe('Masthead', () => {
  it('marks the current page', () => {
    render(Masthead, { props: { current: 'about' } });
    expect(
      screen
        .getByRole('link', { name: 'About the data' })
        .getAttribute('aria-current')
    ).toBe('page');
  });
});

describe('Colophon', () => {
  it('cites IPUMS and Wikipedia', () => {
    render(Colophon);
    expect(screen.getByRole('link', { name: 'IPUMS USA' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'List of obsolete occupations' })
    ).toBeTruthy();
  });
});

describe('DecadePicker', () => {
  const flows = [
    { from: 1900, to: 1910 },
    { from: 1910, to: 1920 },
  ];

  it('marks the selected pair and switches on click', async () => {
    render(DecadePicker, { props: { flows, selected: 1 } });
    const first = screen.getByRole('button', { name: '1900 to 1910' });
    expect(
      screen
        .getByRole('button', { name: '1910 to 1920' })
        .getAttribute('aria-pressed')
    ).toBe('true');
    await fireEvent.click(first);
    expect(first.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders nothing for a single pair', () => {
    const { container } = render(DecadePicker, {
      props: { flows: [flows[0]] },
    });
    expect(container.querySelector('.decades')).toBeNull();
  });
});

describe('share of workers', () => {
  it('formats shares as "1 in N" and percentages', () => {
    expect(formatOneIn(1 / 91)).toBe('1 in 91 workers');
    expect(formatPercent(0.026)).toBe('2.6%');
    expect(formatPercent(0.0004)).toBe('0.04%');
  });

  it('finds the peak by share', () => {
    const s = [
      { year: 1900, people: 100, share: 0.02 },
      { year: 1920, people: 150, share: 0.01 },
    ];
    expect(peakBy(s, 'people').year).toBe(1920);
    expect(peakBy(s, 'share').year).toBe(1900);
  });

  it('switches the chart to shares', async () => {
    const shareSeries = [
      { year: 1900, people: 100, share: 0.02, records: 50, reliable: true },
      { year: 1920, people: 150, share: 0.01, records: 60, reliable: true },
    ];
    const { container } = render(CensusChart, {
      props: { series: shareSeries },
    });
    expect(container.querySelector('.peak-label').textContent).toBe('150');
    await fireEvent.click(
      screen.getByRole('button', { name: 'Share of all workers' })
    );
    expect(container.querySelector('.peak-label').textContent).toBe('1 in 50');
  });
});

describe('BritishCensus', () => {
  const uk = {
    note: 'Counted with railway engine drivers.',
    counts: [
      {
        year: 1861,
        area: 'England and Wales',
        people: 67651,
        males: 67070,
        females: 581,
        titles: [{ title: 'Carman, Carrier, Carter, Drayman', people: 67651 }],
      },
      {
        year: 1861,
        area: 'Scotland',
        people: 14000,
        males: 13900,
        females: 100,
        titles: [
          { title: 'Carrier, Carter', people: 13000 },
          { title: 'Drayman', people: 1000 },
        ],
      },
    ],
  };

  it('lists each census and area with its count', () => {
    render(BritishCensus, { props: { uk } });
    expect(screen.getByText('67,651')).toBeTruthy();
    expect(screen.getByText('Scotland')).toBeTruthy();
  });

  it('summarizes several counted titles and shows the note', () => {
    render(BritishCensus, { props: { uk } });
    expect(
      screen.getByRole('button', { name: 'Carrier, Carter and 1 more' })
    ).toBeTruthy();
    expect(
      screen.getByText('Counted with railway engine drivers.')
    ).toBeTruthy();
  });
});

describe('BookMentions', () => {
  const books = {
    spellings: ['lamplighter', 'lamp lighter', 'lamp-lighter'],
    withPlurals: true,
    peakYear: 1900,
    note: null,
    points: [
      { year: 1850, perMillion: 0.05 },
      { year: 1900, perMillion: 0.11 },
      { year: 1950, perMillion: 0.04 },
    ],
  };

  it('marks the peak and names the source', () => {
    const { container } = render(BookMentions, {
      props: { books, name: 'lamplighter' },
    });
    expect(container.querySelector('.peak-label').textContent).toBe(
      'Peak 1900'
    );
    expect(
      screen.getByRole('link', { name: 'Google Books Ngram' })
    ).toBeTruthy();
  });

  it('lists every spelling it counted', () => {
    const { container } = render(BookMentions, { props: { books } });
    expect(container.querySelector('figcaption').textContent).toMatch(
      /“lamplighter”, “lamp lighter” and “lamp-lighter”, with their plurals/
    );
  });

  it('has no peak marker when the peak is not in question', () => {
    render(BookMentions, { props: { books } });
    expect(
      screen.queryByRole('button', { name: /peak may be misleading/ })
    ).toBeNull();
  });

  it('explains a peak that came after the job ended', async () => {
    render(BookMentions, {
      props: {
        books: {
          ...books,
          peakCaveat: {
            afterEnd: true,
            endedByYear: 1870,
            endCentury: 19,
            note: null,
          },
        },
      },
    });
    const dot = screen.getByRole('button', {
      name: 'Why the 1900 peak may be misleading',
    });
    await fireEvent.focusIn(dot);
    expect(screen.getByRole('dialog').textContent).toMatch(
      /mostly gone by 1870[\s\S]*history writing or\s+fiction/
    );
  });

  it('shows a checked explanation instead of the general guess', async () => {
    render(BookMentions, {
      props: {
        books: {
          ...books,
          peakCaveat: {
            afterEnd: true,
            endedByYear: null,
            endCentury: 17,
            note: 'Also a fish.',
          },
        },
      },
    });
    await fireEvent.focusIn(
      screen.getByRole('button', { name: /peak may be misleading/ })
    );
    const card = screen.getByRole('dialog').textContent;
    expect(card).toMatch(/ended in the\s+1600s/);
    expect(card).toMatch(/Also a fish\./);
    expect(card).not.toMatch(/history writing/);
  });

  it('shows a value on focus', async () => {
    const { container } = render(BookMentions, { props: { books } });
    await fireEvent.focus(container.querySelectorAll('rect.hit')[1]);
    expect(container.querySelector('.readout').textContent).toMatch(
      /1900–1904: 0\.11 per\s+million words/
    );
  });
});
