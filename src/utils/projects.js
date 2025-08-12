import { getCollection } from 'astro:content';

export async function getProjects(limit = null) {
  const projects = await getCollection('projects');
  projects.sort((A, B) =>
    (A.data.priority ?? Infinity) - (B.data.priority ?? Infinity)
  );
  return limit ? projects.slice(0, limit) : projects;
}
