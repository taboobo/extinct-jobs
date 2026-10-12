// Loads one job for its detail page, plus what its preview cards need.
import { error } from '@sveltejs/kit';
import data from '$lib/data/jobs.json';
import { jobSummary, relatedJobs } from '$lib/jobs.js';

// Tell SvelteKit every job id, so it prerenders one static page per job.
export function entries() {
  return data.jobs.map((job) => ({ id: job.id }));
}

export function load({ params }) {
  const job = data.jobs.find((j) => j.id === params.id);
  if (!job) error(404, 'Job not found');
  const summaries = data.jobs.map(jobSummary);
  // Only the census categories this job's flows mention, for hover cards.
  const codes = job.flows.flatMap((f) => [
    ...(f.transitions?.destinations ?? []),
    ...(f.arrivals?.origins ?? []),
  ]);
  return {
    job,
    related: relatedJobs(jobSummary(job), summaries),
    categories: Object.fromEntries(
      codes
        .filter((d) => d.code != null)
        .map((d) => [d.code, data.categories[d.code]])
    ),
  };
}
