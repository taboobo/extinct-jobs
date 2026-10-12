// Loads the job list for the home page.
// jobs.json is exported by the extinct-jobs-data pipeline (see its provenance file).
import data from '$lib/data/jobs.json';
import { jobSummary } from '$lib/jobs.js';

export function load() {
  // Only the fields the list needs, so the home page stays light.
  return { jobs: data.jobs.map(jobSummary) };
}
