/**
 * jobs.js — helpers for turning the exported job data into readable text.
 *
 * The data comes from the private extinct-jobs-data pipeline, which exports
 * src/lib/data/jobs.json (see jobs.json.provenance.json next to it).
 */

/** Census years with data. 1890 is missing: its records burned in 1921. */
export const CENSUS_YEARS = [
  1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940,
];

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * A century number from the source table as readable text.
 * 17 -> "1600s", 1 -> "1st century", -7 -> "7th century BCE", -70 -> "7000 BCE",
 * -99 -> "prehistory" (the source uses -99 as a sort value for "very ancient").
 */
export function centuryLabel(century) {
  if (century === null || century === undefined) return 'unknown';
  if (century <= -99) return 'prehistory';
  if (century <= -10) return `${(-century * 100).toLocaleString('en-US')} BCE`;
  if (century < 0) return `${ordinal(-century)} century BCE`;
  if (century <= 10) return `${ordinal(century)} century`;
  return `${(century - 1) * 100}s`;
}

export function formatNumber(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function formatShare(share) {
  const pct = share * 100;
  return pct < 1 ? '<1%' : `${Math.round(pct)}%`;
}

/** The census year with the most people, or null when there is no census data. */
export function peak(series = []) {
  return series.reduce(
    (best, point) => (!best || point.people > best.people ? point : best),
    null
  );
}

/**
 * Jobs that ended the same way: share at least one reason, ranked by how many
 * reasons they share, then by how close their end centuries are.
 */
export function relatedJobs(job, all, limit = 5) {
  const reasons = new Set(job.reasonTypes);
  return all
    .filter((other) => other.id !== job.id)
    .map((other) => {
      const shared = other.reasonTypes.filter((r) => reasons.has(r)).length;
      const gap = Math.abs((other.endCentury ?? 0) - (job.endCentury ?? 0));
      return {
        other,
        score: shared * 2 + (gap === 0 ? 1.5 : gap === 1 ? 0.5 : 0),
      };
    })
    .filter(
      ({ other, score }) =>
        score >= 2 && other.reasonTypes.some((r) => reasons.has(r))
    )
    .sort(
      (a, b) => b.score - a.score || a.other.name.localeCompare(b.other.name)
    )
    .slice(0, limit)
    .map(({ other }) => other);
}

/** The fields a job preview card needs. */
export function jobSummary(job) {
  return {
    id: job.id,
    name: job.name,
    summary: job.summary,
    endCentury: job.endCentury,
    reasonTypes: job.reasonTypes,
    series: job.census.series.map(({ year, people, reliable }) => ({
      year,
      people,
      reliable,
    })),
  };
}
