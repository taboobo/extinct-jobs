// Loads the job list for the home page.
// jobs.json is exported by the extinct-jobs-data pipeline (see its provenance file).
import data from '$lib/data/jobs.json';

export function load() {
  return {
    // Only the fields the list needs, so the home page stays light.
    jobs: data.jobs.map((job) => ({
      id: job.id,
      name: job.name,
      summary: job.summary,
      startCentury: job.startCentury,
      endCentury: job.endCentury,
      reasonTypes: job.reasonTypes,
      series: job.census.series.map(({ year, people, reliable }) => ({
        year,
        people,
        reliable,
      })),
    })),
  };
}
