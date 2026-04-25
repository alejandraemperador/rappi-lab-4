import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Lating } from '../../types/orders.types';

const deliveryIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
});

const destinationIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

function RecenterMap({ position }: { position: { lat: number, lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (position?.lat && position?.lng) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);
    return null;
}

interface OrderMapProps {
    deliveryPos: Lating | null | any;
    destination: Lating | null | any;
    isInteractive?: boolean;
}

export default function OrderMap({ deliveryPos, destination, isInteractive }: OrderMapProps) {

    const normalize = (point: Lating | any) => {
        if (!point) return null;


        const lat = point.latitude ?? point.lat ?? point.destination_lat ?? point.delivery_lat;
        const lng = point.longitude ?? point.lng ?? point.destination_lng ?? point.delivery_lng;

        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        return { lat, lng };
    };

    const dPos = normalize(deliveryPos);
    const dest = normalize(destination);

    if (!dPos && !dest) {
        return (
            <div className="h-80 w-full bg-gray-50 flex items-center justify-center rounded-[30px] border-2 border-dashed border-gray-200">
                <p className="text-[10px] font-black uppercase italic text-gray-400">Cargando mapa...</p>
            </div>
        );
    }

    const initialCenter: [number, number] = dPos ? [dPos.lat, dPos.lng] : [dest!.lat, dest!.lng];

    return (
        <div className="h-80 w-full rounded-[30px] overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
            <MapContainer center={initialCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {dPos && (
                    <Marker position={[dPos.lat, dPos.lng]} icon={deliveryIcon}>
                        <Popup className="font-bold uppercase italic">Repartidor 🛵</Popup>
                    </Marker>
                )}

                {dest && (
                    <Marker position={[dest.lat, dest.lng]} icon={destinationIcon}>
                        <Popup className="font-bold text-red-600 uppercase italic">Tu Casa 🏠</Popup>
                    </Marker>
                )}

                <RecenterMap position={isInteractive ? dPos : (dPos || dest)} />
            </MapContainer>
        </div>
    );
}
