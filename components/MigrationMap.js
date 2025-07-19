import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { ArcLayer } from '@deck.gl/layers';
// No mapbox-gl import here – only via deck.gl/react-map-gl peer dep

export default function MigrationMap({ routes }) {
  const colorMap = [[255,85,79], [250,180,80], [44,123,229], [180,180,180]];
  return (
    <DeckGL
      initialViewState={{ longitude: 0, latitude: 30, zoom: 2.8, pitch: 25 }}
      controller={true}
      layers={[
        new ArcLayer({
          id: 'arcs',
          data: routes,
          getSourcePosition: d => [d.start_long, d.start_lat],
          getTargetPosition: d => [d.end_long, d.end_lat],
          getSourceColor: d => colorMap[Math.min(d.risk, 3)],
          getTargetColor: d => colorMap[Math.min(d.risk, 3)],
          getWidth: d => d.risk >= 3 ? 6 : 2,
          pickable: true,
          autoHighlight: true
        }),
      ]}
    >
      <StaticMap mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/light-v10" />
    </DeckGL>
  );
}
