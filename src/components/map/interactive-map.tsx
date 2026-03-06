'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Map, Marker } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

// Use standard assignment for CJS compatibility
const { LngLatBounds } = mapboxgl;

type InteractiveMapProps = {
  pins: any[];
  isMock?: boolean;
  onPinClick: (profile: any) => void;
  onMapClick?: () => void;
};

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

const obfuscateCoordinates = (id: string, coords: { lat: number; lng: number }) => {
  const hash = simpleHash(id + 'obfuscation_seed'); // Consistent seed
  const radius = 0.05; // ~5km radius in degrees
  const angle = (hash % 360) * (Math.PI / 180);
  const distance = Math.sqrt(Math.abs(hash) % 100 / 100) * radius;
  return {
    lat: coords.lat + distance * Math.sin(angle),
    lng: coords.lng + distance * Math.cos(angle),
  };
};

export default function InteractiveMap({ pins, isMock = false, onPinClick, onMapClick }: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const map = mapRef.current;
    if (!map || pins.length === 0) {
      try {
        // Correct way to access mapbox instance in v7
        const internalMap = map.getMap();
        if (internalMap) {
            internalMap.flyTo({ center: [0, 20], zoom: 1 });
        }
      } catch (e) {
        // Ignore
      }
      return;
    };

    const bounds = new LngLatBounds();
    pins.forEach(pin => {
      if (pin.coords && typeof pin.coords.lat === 'number' && typeof pin.coords.lng === 'number') {
        const finalCoords = (pin.type === 'user' && !isMock)
          ? obfuscateCoordinates(pin.id, pin.coords)
          : pin.coords;
        bounds.extend([finalCoords.lng, finalCoords.lat]);
      }
    });

    if (!bounds.isEmpty()) {
      try {
        const internalMap = map.getMap();
        if (internalMap) {
            internalMap.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 14 });
        }
      } catch (e) {
        // Ignore
      }
    }

  }, [pins, isMock, mounted]);

  if (!mounted) return <div className="w-full h-full bg-muted animate-pulse rounded-lg" />;

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Final check for component validity before rendering
  const ActualMap = (Map as any).default || Map;
  const ActualMarker = (Marker as any).default || Marker;

  if (typeof ActualMap !== 'function' && typeof ActualMap !== 'object') {
      return <div className="w-full h-full flex items-center justify-center bg-muted text-destructive">Map component failed to load properly.</div>;
  }

  return (
    <div className="w-full h-full z-0 rounded-lg overflow-hidden relative" style={{ minHeight: '400px' }}>
      {!token && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground z-10">
          Mapbox token missing
        </div>
      )}
      <ActualMap
        ref={mapRef}
        mapboxAccessToken={token}
        mapLib={mapboxgl as any}
        initialViewState={{
          longitude: -20,
          latitude: 20,
          zoom: 1,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={onMapClick}
        onIdle={() => setIsMapLoaded(true)}
        scrollZoom={true}
      >
        {isMapLoaded && pins.map(pin => {
          if (!pin.coords || typeof pin.coords.lat !== 'number' || typeof pin.coords.lng !== 'number') return null;

          const finalCoords = (pin.type === 'user' && !isMock)
            ? obfuscateCoordinates(pin.id, pin.coords)
            : pin.coords;

          return (
            <ActualMarker
              key={`${pin.type}-${pin.id}`}
              longitude={finalCoords.lng}
              latitude={finalCoords.lat}
              anchor="center"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                onPinClick(pin);
              }}
            >
              {pin.type === 'event' ? (
                <div className={cn(
                  'w-8 h-8 border-2 flex items-center justify-center shadow-lg bg-background cursor-pointer transform transition-transform hover:scale-110',
                  'border-primary bg-primary/20'
                )}>
                  {pin.imageUrl ? (
                    <img
                      src={pin.imageUrl}
                      alt={`Evento ${pin.name}`}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Calendar className="w-4 h-4 text-primary" />
                  )}
                </div>
              ) : (
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg bg-background cursor-pointer transform transition-transform hover:scale-110',
                  pin.isTraveler ? 'border-amber-500' : 'border-accent',
                )}>
                  <img
                    src={pin.avatarUrl || `https://avatar.vercel.sh/${pin.id}.png`}
                    alt={`Avatar ${pin.name}`}
                    width={32}
                    height={32}
                    className={cn(
                      'rounded-full object-cover',
                      pin.isTraveler ? 'p-0.5' : ''
                    )}
                  />
                </div>
              )}
            </ActualMarker>
          );
        })}
      </ActualMap>
    </div>
  );
}
