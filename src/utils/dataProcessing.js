// Example utility function to filter bird data by species
export function filterBySpecies(birds, species) {
  if (!species) return birds;
  return birds.filter((bird) => bird.Species.toLowerCase() === species.toLowerCase());
}

// Example utility to get unique species list
export function getUniqueSpecies(birds) {
  const speciesSet = new Set();
  birds.forEach((bird) => speciesSet.add(bird.Species));
  return Array.from(speciesSet);
}

