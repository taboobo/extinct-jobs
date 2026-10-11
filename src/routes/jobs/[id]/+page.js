// Loads one job for its detail page.
import { error } from '@sveltejs/kit';
import data from '$lib/data/jobs.json';

// Tell SvelteKit every job id, so it prerenders one static page per job.
export function entries() {
  return data.jobs.map((job) => ({ id: job.id }));
}

export function load({ params }) {
  const job = data.jobs.find((j) => j.id === params.id);
  if (!job) error(404, 'Job not found');
  return { job };
}
