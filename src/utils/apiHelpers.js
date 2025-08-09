import axios from 'axios';

export async function fetchBirdData() {
  try {
    const response = await axios.get('/data/bird_migration.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching bird data:', error);
    throw error;
  }
}
