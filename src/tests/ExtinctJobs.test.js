import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Sparkline from '$lib/components/ExtinctJobs/Sparkline.svelte';
import CensusChart from '$lib/components/ExtinctJobs/CensusChart.svelte';
import TransitionBars from '$lib/components/ExtinctJobs/TransitionBars.svelte';
import SpellingList from '$lib/components/ExtinctJobs/SpellingList.svelte';
import JobLedger from '$lib/components/ExtinctJobs/JobLedger.svelte';
import Masthead from '$lib/components/ExtinctJobs/Masthead.svelte';
import Colophon from '$lib/components/ExtinctJobs/Colophon.svelte';
import { centuryLabel, formatShare, peak } from '$lib/jobs.js';

const series = [
  { year: 1850, people: 400, records: 4, reliable: false },
  { year: 1900, people: 35000, records: 900, reliable: true },
  { year: 1920, people: 67000, records: 1400, reliable: true },
];

const transitions = {
  from: 1910,
  to: 1920,
  basis: 'exact',
  category: 'Telegraph operators',
  linkedPeople: 24882,
  destinations: [
    { label: 'Telegraph operators', share: 0.34, same: true, other: false },
    { label: 'Telephone operators', share: 0.06, same: false, other: false },
    { label: 'Everything else', share: 0.6, same: false, other: true },
  ],
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
    expect(screen.getByText('records lost')).toBeTruthy();
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

  it('includes an accessible table of values', () => {
    render(CensusChart, { props: { series, name: 'telegraph operators' } });
    expect(screen.getByText('67,000')).toBeTruthy();
  });

  it('explains pale bars only when present', () => {
    const { container } = render(CensusChart, {
      props: { series: series.filter((s) => s.reliable) },
    });
    expect(container.querySelector('figcaption').textContent).not.toMatch(
      /Pale bars/
    );
  });
});

describe('TransitionBars', () => {
  it('lists destinations with shares', () => {
    render(TransitionBars, { props: { transitions } });
    expect(screen.getByText('Telephone operators')).toBeTruthy();
    expect(screen.getByText('34%')).toBeTruthy();
  });

  it('marks staying in the same job and the remainder', () => {
    const { container } = render(TransitionBars, { props: { transitions } });
    expect(screen.getByText('(same job)')).toBeTruthy();
    expect(container.querySelectorAll('li.other').length).toBe(1);
  });

  it('explains a broader census category', () => {
    render(TransitionBars, {
      props: {
        transitions: {
          ...transitions,
          basis: 'broader',
          category: 'Deliverymen',
        },
      },
    });
    expect(screen.getByText(/which includes this job/)).toBeTruthy();
  });
});

describe('SpellingList', () => {
  it('splits job and industry', () => {
    render(SpellingList, {
      props: {
        spellings: [
          {
            writtenAs: 'OPR (industry: TELEG)',
            records: 167,
            firstYear: 1910,
            lastYear: 1910,
          },
        ],
      },
    });
    expect(screen.getByText('OPR')).toBeTruthy();
    expect(screen.getByText('with industry “TELEG”')).toBeTruthy();
    expect(screen.getByText(/167 records,\s+1910/)).toBeTruthy();
  });
});

describe('JobLedger', () => {
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
    render(JobLedger, { props: { jobs } });
    expect(
      screen
        .getByRole('link', { name: 'Telegraph operator' })
        .getAttribute('href')
    ).toBe('/jobs/telegraph-operator');
  });

  it('shows the century each job ended', () => {
    render(JobLedger, { props: { jobs } });
    expect(screen.getAllByText('1900s').length).toBe(1);
    expect(screen.getByText('1800s')).toBeTruthy();
  });

  it('notes jobs without census records', () => {
    render(JobLedger, { props: { jobs } });
    expect(screen.getByText('Not in census records')).toBeTruthy();
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
