import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSupabase } from "./SupabaseProvider";
import { type Order, type Lating, OrderStatus } from "../types/orders.types";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const MOVE_DELTA = 0.0001;

interface PositionContextType {
    myPosition: Lating;
}

const PositionContext = createContext<PositionContextType | null>(null);

export const PositionProvider = ({ children, activeOrder: initialOrder }: { children: React.ReactNode; activeOrder: Order | null }) => {
    const supabase = useSupabase();

    const [activeOrder, setActiveOrder] = useState<Order | null>(initialOrder);

    const [myPosition, setMyPosition] = useState<Lating>(() => {
        if (initialOrder?.delivery_position) return initialOrder.delivery_position;
        if (initialOrder?.delivery_lat) return { latitude: initialOrder.delivery_lat, longitude: initialOrder.delivery_lng! };
        return { latitude: 3.4516, longitude: -76.5320 };
    });

    const channelRef = useRef<any>(null);

    useEffect(() => {
        setActiveOrder(initialOrder);
    }, [initialOrder]);

    useEffect(() => {
        if (!activeOrder) return;
        channelRef.current = supabase.channel(`order_tracking_${activeOrder.id}`);
        channelRef.current.subscribe();

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [activeOrder?.id, supabase]);

    const getDistance = (p1: Lating, p2: Lating) => {
        const R = 6371e3; // Metros
        const φ1 = (p1.latitude * Math.PI) / 180;
        const φ2 = (p2.latitude * Math.PI) / 180;
        const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
        const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const sendPositionUpdate = async (newPos: Lating) => {
        if (!activeOrder || activeOrder.status === OrderStatus.DELIVERED) return;

        try {
            const { data } = await axios.patch(
                `${API_URL}/orders/${activeOrder.id}/position`,
                newPos,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const destination = {
                latitude: activeOrder.destination?.latitude || (activeOrder as any).destination_lat,
                longitude: activeOrder.destination?.longitude || (activeOrder as any).destination_lng,
            };

            const distance = getDistance(newPos, destination);

            if (channelRef.current) {
                await channelRef.current.send({
                    type: "broadcast",
                    event: "position-update",
                    payload: {
                        latitude: newPos.latitude,
                        longitude: newPos.longitude,
                        status: data.status
                    },
                });

                if (distance <= 10) {
                    await axios.patch(
                        `${API_URL}/orders/${activeOrder.id}/status`,
                        { status: OrderStatus.DELIVERED },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                    );

                    await channelRef.current.send({
                        type: "broadcast",
                        event: "status-update",
                        payload: { status: OrderStatus.DELIVERED },
                    });

                    setActiveOrder(prev => prev ? { ...prev, status: OrderStatus.DELIVERED } : null);

                    alert("¡Has llegado! Pedido entregado. 🎉");

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            }
        } catch (error) {
            console.error("Error en la actualización:", error);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeOrder || activeOrder.status !== OrderStatus.IN_DELIVERY) return;

            let deltaLat = 0, deltaLng = 0;
            if (e.key === "ArrowUp") deltaLat = MOVE_DELTA;
            else if (e.key === "ArrowDown") deltaLat = -MOVE_DELTA;
            else if (e.key === "ArrowLeft") deltaLng = -MOVE_DELTA;
            else if (e.key === "ArrowRight") deltaLng = MOVE_DELTA;
            else return;

            e.preventDefault();
            setMyPosition(prev => {
                const next = { latitude: prev.latitude + deltaLat, longitude: prev.longitude + deltaLng };
                sendPositionUpdate(next);
                return next;
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeOrder]);

    return (
        <PositionContext.Provider value={{ myPosition }}>
            {children}
        </PositionContext.Provider>
    );
};

export const usePosition = () => {
    const context = useContext(PositionContext);
    if (!context) throw new Error("usePosition debe usarse dentro de PositionProvider");
    return context;
};
