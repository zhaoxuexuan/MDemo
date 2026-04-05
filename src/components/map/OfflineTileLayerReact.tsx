import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { OfflineTileLayer as OfflineTileLayerClass } from './OfflineTileLayer';

export function OfflineTileLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = new OfflineTileLayerClass();
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map]);

  return null;
}
