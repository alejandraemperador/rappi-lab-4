import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Lating } from '../../../types/orders.types';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onPositionSelected: (pos: Lating) => void;
    selectedPosition: Lating | null;
}


function MapEvents({ onSelect, selectedPosition }: { onSelect: (pos: Lating) => void, selectedPosition: Lating | null }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });

    useEffect(() => {
        if (selectedPosition?.latitude && selectedPosition?.longitude) {
            map.flyTo([selectedPosition.latitude, selectedPosition.longitude], map.getZoom());
        }
    }, [selectedPosition, map]);

    return null;
}

export const OrderMapPicker = ({ onPositionSelected, selectedPosition }: MapPickerProps) => {
    return (
        <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 relative z-0">
            <MapContainer
                center={[3.4516, -76.5320]} 
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MapEvents onSelect={onPositionSelected} selectedPosition={selectedPosition} />

                {selectedPosition?.latitude && selectedPosition?.longitude && (
                    <Marker position={[selectedPosition.latitude, selectedPosition.longitude]} />
                )}
            </MapContainer>

            {!selectedPosition && (
                <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center z-1000">
                    <span className="bg-white px-4 py-2 rounded-full text-xs font-black shadow-sm border border-orange-200 text-orange-600 animate-pulse">
                        📍 TOCA EL MAPA PARA TU ENTREGA
                    </span>
                </div>
            )}
        </div>
    );
};
