import { getCollection } from 'astro:content';

export async function getProjects(pageType) {
  const indexProperty = `${pageType}_index`;
  
  const projects = await getCollection('projects', ({ data }) => 
    data[indexProperty] !== undefined
  );
  
  projects.sort((a, b) => 
    (a.data[indexProperty] || 0) - (b.data[indexProperty] || 0)
  );
  
  return projects;
}
