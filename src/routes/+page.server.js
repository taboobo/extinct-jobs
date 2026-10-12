// Loads the job list for the home page (at build time; the page gets only these fields).
// jobs.json is exported by the extinct-jobs-data pipeline (see its provenance file).
import data from '$lib/data/jobs.json';

export function load() {
  // Only the fields the list needs, so the home page stays light.
  return {
    jobs: data.jobs.map(({ id, name, summary }) => ({ id, name, summary })),
  };
}
