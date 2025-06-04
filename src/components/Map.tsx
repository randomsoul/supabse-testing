
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BookDonation } from '@/types/books';
import { MapPin } from 'lucide-react';

interface MapProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  donations?: BookDonation[];
}

const Map = ({ onLocationSelect, donations = [] }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const donationMarkers = useRef<L.Marker[]>([]);

  // Create custom marker icons
  const createCustomIcon = (color: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="${color}" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  const selectionIcon = createCustomIcon('#0ea5e9'); // Blue marker for selection
  const donationIcon = createCustomIcon('#ef4444');  // Red marker for donations

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([19.0760, 72.8777], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Add draggable marker with custom icon
    marker.current = L.marker([19.0760, 72.8777], { 
      draggable: true,
      icon: selectionIcon
    }).addTo(map.current);

    // Handle marker drag events
    marker.current.on('dragend', () => {
      if (marker.current && onLocationSelect) {
        const position = marker.current.getLatLng();
        onLocationSelect({
          lat: position.lat,
          lng: position.lng,
          address: 'Selected location' // In a real app, you could use reverse geocoding here
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect]);

  // Add/update donation markers whenever donations prop changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    donationMarkers.current.forEach(marker => marker.remove());
    donationMarkers.current = [];

    // Add new markers for each donation
    donations.forEach(donation => {
      const marker = L.marker([donation.location.lat, donation.location.lng], {
        icon: donationIcon
      })
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${donation.title}</h3>
            <p>${donation.subject || ''}</p>
            <p>${donation.location.address}</p>
          </div>
        `)
        .addTo(map.current!);
      
      donationMarkers.current.push(marker);
    });
  }, [donations]);

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      <p className="text-sm text-muted-foreground">
        Drag the blue pin to select your location. Red pins show available book donations.
      </p>
    </div>
  );
};

export default Map;
