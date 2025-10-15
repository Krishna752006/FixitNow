import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Crosshair, Plus, Minus, SkipForward } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Autocomplete, useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
  title?: string;
  description?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialAddress = '',
  initialCoordinates,
  title = 'Location',
  description = 'Search for an address and mark your location on the map',
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [showMap, setShowMap] = useState(!!initialCoordinates);
  const [address, setAddress] = useState(initialAddress);
  const [isLocating, setIsLocating] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [mapZoom, setMapZoom] = useState<number>(15);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const [useManualInput, setUseManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    street: initialAddress || '',
    area: '',
    city: '',
    state: '',
    pinCode: '',
  });

  const announce = (message: string) => {
    // Update a polite live region for screen readers
    setLiveMessage('');
    // Small timeout ensures SR announces repeated messages
    setTimeout(() => setLiveMessage(message), 50);
  };

  const handleManualSubmit = () => {
    if (!manualAddress.street || !manualAddress.city) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least house/building number and city',
        variant: 'destructive',
      });
      return;
    }

    // Combine street and area for full address
    const fullAddress = [manualAddress.street, manualAddress.area].filter(Boolean).join(', ');

    onLocationSelect({
      address: fullAddress,
      city: manualAddress.city,
      state: manualAddress.state,
      zipCode: manualAddress.pinCode,
      coordinates: { lat: 0, lng: 0 }, // Default coordinates when manually entered
    });

    toast({
      title: 'Address Saved',
      description: 'Your address has been saved successfully',
    });
  };

  const centerMap = (coords: { lat: number; lng: number }, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.panTo(coords);
      if (zoom) mapRef.current.setZoom(zoom);
    }
  };

  const reverseGeocodeAndEmit = (
    coords: { lat: number; lng: number },
    formattedAddress?: string
  ) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const addressComponents = results[0].address_components;
        const find = (type: string) =>
          addressComponents.find((c: any) => (c.types || []).includes(type))?.long_name || '';

        const streetNumber = find('street_number');
        const route = find('route');
        const city = find('locality') || find('administrative_area_level_2');
        const state = find('administrative_area_level_1');
        const postal = find('postal_code');

        const fullAddress =
          formattedAddress || [streetNumber, route].filter(Boolean).join(' ') ||
          results[0].formatted_address ||
          '';
        setAddress(fullAddress);

        onLocationSelect({
          address: fullAddress,
          city: city || '',
          state: state || '',
          zipCode: postal || '',
          coordinates: coords,
        });
      }
    });
  };

  const handleLocationUpdate = (lat: number, lng: number, formattedAddress?: string) => {
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    reverseGeocodeAndEmit(newLocation, formattedAddress);
    announce(`Location set to latitude ${lat.toFixed(5)}, longitude ${lng.toFixed(5)}`);
  };

  const geolocate = async (announceResult = true) => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support using your current location.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const coords = { lat: latitude, lng: longitude };
          setShowMap(true);
          setSelectedLocation(coords);
          centerMap(coords, 17);
          reverseGeocodeAndEmit(coords);
          if (announceResult) announce('Moved to your current location.');
        },
        (err) => {
          toast({
            title: 'Location Permission',
            description: err.message || 'Unable to access your location.',
            variant: 'destructive',
          });
          announce('Unable to access your location.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } finally {
      setIsLocating(false);
    }
  };

  // If permission is already granted, auto-center to current location on mount
  useEffect(() => {
    let cancelled = false;
    if ('permissions' in navigator && (navigator as any).permissions?.query) {
      (navigator as any).permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status: PermissionStatus) => {
          if (!cancelled && status.state === 'granted') geolocate(false);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live region for SR announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {/* Show error message if Google Maps fails to load */}
        {loadError && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Map Service Unavailable</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              The map service couldn't be loaded. This might be due to billing restrictions or network issues.
              You can still enter your address manually below.
            </p>
            <Button
              onClick={() => setUseManualInput(true)}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
              Enter Address Manually
            </Button>
          </div>
        )}

        {/* Toggle between map and manual input */}
        {!loadError && (
          <div className="flex gap-2">
            <Button
              onClick={() => setUseManualInput(false)}
              variant={!useManualInput ? "default" : "outline"}
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use Map
            </Button>
            <Button
              onClick={() => setUseManualInput(true)}
              variant={useManualInput ? "default" : "outline"}
              size="sm"
            >
              Enter Manually
            </Button>
          </div>
        )}

        {/* Manual Address Input - Indian Format */}
        {(useManualInput || loadError) && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-muted-foreground">Enter your address in Indian format</p>
            
            <div className="space-y-2">
              <Label htmlFor="manual-street">House/Building No., Street Name *</Label>
              <Input
                id="manual-street"
                placeholder="e.g., 123, MG Road"
                value={manualAddress.street}
                onChange={(e) => setManualAddress(prev => ({ ...prev, street: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-area">Area/Locality</Label>
              <Input
                id="manual-area"
                placeholder="e.g., Koramangala, Bandra West"
                value={manualAddress.area}
                onChange={(e) => setManualAddress(prev => ({ ...prev, area: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-city">City *</Label>
                <Input
                  id="manual-city"
                  placeholder="e.g., Mumbai, Bangalore"
                  value={manualAddress.city}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-state">State</Label>
                <Input
                  id="manual-state"
                  placeholder="e.g., Maharashtra, Karnataka"
                  value={manualAddress.state}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-pincode">PIN Code</Label>
              <Input
                id="manual-pincode"
                placeholder="e.g., 400001"
                maxLength={6}
                value={manualAddress.pinCode}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setManualAddress(prev => ({ ...prev, pinCode: value }));
                }}
              />
            </div>

            <Button onClick={handleManualSubmit} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Save Address
            </Button>
          </div>
        )}

        {/* Address Search - only show if not using manual input and no error */}
        {!useManualInput && !loadError && (
          <div className="space-y-2">
            <Label htmlFor="autocomplete-address">Search Address</Label>
            {isLoaded ? (
            <Autocomplete
              options={{ componentRestrictions: { country: 'in' }, types: ['address'] }}
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={() => {
                const ac = autocompleteRef.current;
                const place = ac?.getPlace();
                if (!place || !place.geometry) {
                  toast({
                    title: 'Address Error',
                    description: 'Please select a valid address from the suggestions',
                    variant: 'destructive',
                  });
                  return;
                }

                const comps = place.address_components || [];
                const find = (type: string) =>
                  comps.find((c: any) => (c.types || []).includes(type))?.long_name || '';

                const streetNumber = find('street_number');
                const route = find('route');
                const city = find('locality') || find('administrative_area_level_2');
                const state = find('administrative_area_level_1');
                const postal = find('postal_code');

                const fullAddress =
                  [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address || '';
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();

                setAddress(fullAddress);

                if (lat && lng) {
                  const coords = { lat, lng };
                  setSelectedLocation(coords);
                  setShowMap(true);
                  centerMap(coords, 17);

                  onLocationSelect({
                    address: fullAddress,
                    city: city || '',
                    state: state || '',
                    zipCode: postal || '',
                    coordinates: coords,
                  });

                  announce('Location found from search. You can fine-tune on the map.');
                  toast({
                    title: 'Location Found',
                    description: 'You can fine-tune the location by clicking on the map',
                  });
                }
              }}
            >
              <Input
                id="autocomplete-address"
                placeholder="Start typing your address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Autocomplete>
          ) : (
            <Input
              id="autocomplete-address"
              placeholder="Loading address search..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled
            />
          )}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => geolocate()}
              disabled={isLocating}
              aria-label="Use my current location"
            >
              <Crosshair className="h-4 w-4 mr-1" />
              {isLocating ? 'Locating…' : 'Use My Location'}
            </Button>
            {!showMap && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowMap(true)}>
                <MapPin className="h-4 w-4 mr-2" /> Show Map
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (address.trim()) {
                  onLocationSelect({
                    address,
                    city: '',
                    state: '',
                    zipCode: '',
                    coordinates: selectedLocation || { lat: 0, lng: 0 },
                  });
                  announce('Using typed address without map.');
                }
              }}
              aria-label="Skip map and use typed address"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Map
            </Button>
          </div>
          </div>
        )}

        {/* Map for Location Selection */}
        {!useManualInput && !loadError && showMap && isLoaded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="interactive-map">Fine-tune Your Location</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Zoom out"
                  onClick={() => {
                    const z = (mapRef.current?.getZoom?.() || mapZoom) - 1;
                    setMapZoom(z);
                    mapRef.current?.setZoom?.(z);
                    announce(`Zoom ${z}`);
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Zoom in"
                  onClick={() => {
                    const z = (mapRef.current?.getZoom?.() || mapZoom) + 1;
                    setMapZoom(z);
                    mapRef.current?.setZoom?.(z);
                    announce(`Zoom ${z}`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(false)}
                >
                  Hide Map
                </Button>
              </div>
            </div>

            <div
              id="interactive-map"
              className="h-64 rounded-lg border overflow-hidden"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!selectedLocation) return;
                const base = 0.0005; // ~55m at equator
                const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
                const step = base * factor;
                let { lat, lng } = selectedLocation;

                if (e.key === 'ArrowUp') lat += step;
                if (e.key === 'ArrowDown') lat -= step;
                if (e.key === 'ArrowLeft') lng -= step;
                if (e.key === 'ArrowRight') lng += step;
                if (e.key === 'PageUp' || e.key === '+') {
                  const z = (mapRef.current?.getZoom?.() || mapZoom) + 1;
                  setMapZoom(z);
                  mapRef.current?.setZoom?.(z);
                  announce(`Zoom ${z}`);
                }
                if (e.key === 'PageDown' || e.key === '-') {
                  const z = (mapRef.current?.getZoom?.() || mapZoom) - 1;
                  setMapZoom(z);
                  mapRef.current?.setZoom?.(z);
                  announce(`Zoom ${z}`);
                }

                if (lat !== selectedLocation.lat || lng !== selectedLocation.lng) {
                  handleLocationUpdate(lat, lng);
                  centerMap({ lat, lng });
                }
              }}
              aria-label="Map for selecting location. Use arrow keys to move the marker. Hold Shift for larger steps and Alt for finer steps. Use Page Up/Down or plus/minus to zoom."
              role="application"
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedLocation || { lat: 19.076, lng: 72.8777 }} // Default to Mumbai
                zoom={mapZoom}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onZoomChanged={() => {
                  const z = mapRef.current?.getZoom?.();
                  if (typeof z === 'number') setMapZoom(z);
                }}
                onClick={(e) => {
                  if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    handleLocationUpdate(lat, lng);
                  }
                }}
              >
                {selectedLocation && (
                  <Marker
                    position={selectedLocation}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        handleLocationUpdate(lat, lng);
                      }
                    }}
                    title="Current Location Marker"
                    // Screen readers get coordinates from the live region and label below
                  />
                )}
              </GoogleMap>
            </div>
            <span id="map-instructions" className="sr-only">
              Use arrow keys to move the marker. Hold Shift for larger steps and Alt for finer steps. Use Page Up/Down or plus/minus to zoom. Press the "Use My Location" button to jump to your current location.
            </span>

            {selectedLocation && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location Selected</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
                <p className="text-sm text-green-600">{address}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
