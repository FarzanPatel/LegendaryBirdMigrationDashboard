import dynamic from 'next/dynamic';
import React from 'react';

const MapWithNoSSR = dynamic(() => import('./BirdMigrationMapInner'), {
  ssr: false,
});

export default function BirdMigrationMap(props) {
  return <MapWithNoSSR {...props} />;
}
