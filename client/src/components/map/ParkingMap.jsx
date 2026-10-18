import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { VerificationBadge, CategoryBadge } from '../common/Badge.jsx';
import { Navigation, Bike, Car, ArrowRight } from 'lucide-react';

// Custom Map center updater component
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

// Create custom vector DivIcons
const createMarkerIcon = (isSelected, isVerified, isUserLocation = false) => {
  if (isUserLocation) {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  const bgColor = isSelected ? '#15803d' : isVerified ? '#16a34a' : '#d97706';
  const ring = isSelected ? 'ring-4 ring-emerald-300' : '';

  return L.divIcon({
    className: 'custom-parking-marker',
    html: `
      <div class="${ring}" style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 13px;
          font-family: sans-serif;
        ">P</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export const ParkingMap = ({
  parkings = [],
  selectedParking = null,
  onSelectParking = () => {},
  userCoords = null,
  center = [17.385044, 78.486671],
  zoom = 12,
  height = '500px'
}) => {
  // Determine effective center
  const effectiveCenter = selectedParking?.location?.coordinates
    ? [selectedParking.location.coordinates[1], selectedParking.location.coordinates[0]]
    : userCoords
    ? [userCoords.lat, userCoords.lng]
    : center;

  // Filter facilities that have valid coordinates
  const mappableFacilities = parkings.filter(
    (p) =>
      p.location &&
      p.location.coordinates &&
      Array.isArray(p.location.coordinates) &&
      p.location.coordinates.length === 2 &&
      !isNaN(p.location.coordinates[0]) &&
      !isNaN(p.location.coordinates[1])
  );

  return (
    <div style={{ height }} className="w-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={effectiveCenter} zoom={selectedParking ? 15 : zoom} />

        {/* User Current Location Marker */}
        {userCoords && (
          <Marker
            position={[userCoords.lat, userCoords.lng]}
            icon={createMarkerIcon(false, false, true)}
          >
            <Popup>
              <div className="text-xs font-semibold p-1">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Parking Markers */}
        {mappableFacilities.map((parking) => {
          const [lng, lat] = parking.location.coordinates;
          const isSelected = selectedParking?._id === parking._id;
          const isVerified = parking.verificationStatus === 'VERIFIED';

          return (
            <Marker
              key={parking._id}
              position={[lat, lng]}
              icon={createMarkerIcon(isSelected, isVerified)}
              eventHandlers={{
                click: () => onSelectParking(parking)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <CategoryBadge category={parking.category} />
                    <VerificationBadge status={parking.verificationStatus} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{parking.name}</h4>
                  <p className="text-xs text-slate-500 mb-2 truncate">{parking.locality}, Hyderabad</p>

                  <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-1 mb-2 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rate:</span>
                      <span className="font-semibold text-slate-800">
                        {parking.pricingModel === 'FREE'
                          ? 'Free'
                          : parking.pricing?.fourWheelerHourlyRate
                          ? `₹${parking.pricing.fourWheelerHourlyRate}/hr`
                          : 'Variable / Unknown'}
                      </span>
                    </div>
                    {parking.availableSlots?.total !== undefined && parking.availableSlots?.total !== null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available:</span>
                        <span className="font-bold text-emerald-600">
                          {parking.availableSlots.total} slots
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/parking/${parking._id}`}
                      className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      title="Directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
