import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
});

export interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  radiusKm?: number;
  onChange: (coords: { lat: number; lng: number }, radiusKm: number) => void;
  height?: number;
}

const DraggableMarker: React.FC<{ 
  position: { lat: number; lng: number }; 
  onDragEnd: (lat: number, lng: number) => void; 
}> = ({ position, onDragEnd }) => {
  const markerRef = useRef<L.Marker | null>(null);
  
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);
  
  return (
    <Marker
      draggable
      position={position as LatLngExpression}
      icon={markerIcon}
      ref={(ref) => {
        if (ref) markerRef.current = ref;
      }}
      eventHandlers={{ 
        dragend: () => {
          const m = markerRef.current; 
          if (!m) return;
          const { lat, lng } = m.getLatLng(); 
          onDragEnd(lat, lng);
        }
      }}
    />
  );
};

const ClickToSet: React.FC<{ onSet: (lat: number, lng: number) => void }> = ({ onSet }) => {
  useMapEvents({
    click(e) { 
      onSet(e.latlng.lat, e.latlng.lng); 
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ value, radiusKm = 10, onChange, height = 280 }) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const center = useMemo(() => {
    if (value && typeof value.lat === 'number' && typeof value.lng === 'number') {
      return value;
    }
    return { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore
  }, [value]);
  
  const handleSet = (lat: number, lng: number) => {
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates:', { lat, lng });
      return;
    }
    onChange({ lat, lng }, radiusKm);
  };

  useEffect(() => {
    // Simulate loading delay to ensure Leaflet is ready
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-500 font-semibold mb-2">Map Failed to Load</p>
          <p className="text-sm text-muted-foreground mb-3">{mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative">
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          const step = 0.001;
          let newLat = center.lat;
          let newLng = center.lng;
          if (e.key === 'ArrowUp') newLat += step;
          if (e.key === 'ArrowDown') newLat -= step;
          if (e.key === 'ArrowLeft') newLng -= step;
          if (e.key === 'ArrowRight') newLng += step;

          if (newLat !== center.lat || newLng !== center.lng) {
            handleSet(newLat, newLng);
          }
        }}
        role="application"
        aria-label="Map for selecting location. Use arrow keys to move the marker."
      >
        <MapContainer 
          center={center as LatLngExpression} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
          aria-describedby="map-instructions"
          whenReady={() => console.log('Map loaded successfully')}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={center} onDragEnd={handleSet} />
          {radiusKm > 0 && (
            <Circle 
              center={center as LatLngExpression} 
              radius={radiusKm * 1000} 
              pathOptions={{ color: '#2563eb', opacity: 0.4 }} 
            />
          )}
          <ClickToSet onSet={handleSet} />
        </MapContainer>
      </div>
      <span id="map-instructions" className="sr-only">
        Use the arrow keys to move the map and fine-tune the location.
      </span>
    </div>
  );
};

export default MapPicker;

