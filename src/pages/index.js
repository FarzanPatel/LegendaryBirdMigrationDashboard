import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import BirdMigrationMap from '../components/BirdMigrationMap';
import BirdList from '../components/BirdList';
import LoadingSpinner from '../components/LoadingSpinner';
import Narration from '../components/Narration';

const narrationScript = `
Welcome to the Bird Migration Dashboard, an interactive visualization designed to track and analyze global bird migration patterns.

Our core challenge is this: How can we identify optimal zones for future infrastructure development, improve existing infrastructure, and refine air traffic regulations by analyzing bird migration patterns in relation to environmental factors? These factors include habitat preferences, flight altitudes, wind speeds, visibility conditions, and air pressure.

By understanding these variables and their influence on migration routes, we aim to minimize potential conflicts between bird migrations and human activities such as construction and aviation.

The map presents detailed migration routes, showing the paths birds take between their starting and ending locations. This visual helps us pinpoint critical corridors and zones frequently used by various species.

The accompanying bird list details each species’ migration reasons and the environmental conditions they encounter or prefer, giving insight into how habitat and weather directly affect their journeys.

From this analysis, we gain valuable insights into how specific environmental factors shape migration patterns, allowing planners and policymakers to make informed decisions.

Ultimately, this dashboard serves as a vital tool for researchers, conservationists, urban planners, and aviation authorities to work together in protecting migratory birds while balancing human development and safety.

Thank you for exploring the Bird Migration Dashboard. Together, we can promote coexistence between nature’s incredible migrations and our growing infrastructures.
`;

export default function Home() {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/bird_migration.json');
        const data = await res.json();
        setBirds(data);
      } catch (error) {
        console.error('Failed to fetch bird migration data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Bird Migration Dashboard</title>
        <meta name="description" content="Track bird migrations globally." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <BirdMigrationMap birdLocations={birds} />
            <BirdList birds={birds} />
            <Narration
              script={narrationScript}
              audioSrc="/audio/bird_migration_narration.mp3"
            />
          </>
        )}
      </Layout>
    </>
  );
}
