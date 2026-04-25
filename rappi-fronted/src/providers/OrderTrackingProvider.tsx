import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSupabase } from "./SupabaseProvider";
import { type Lating, OrderStatus } from "../types/orders.types";

interface OrderTrackingContextType {
    deliveryPos: Lating | null;
    currentStatus: OrderStatus | null;
    isTracking: boolean;
    startTracking: (orderid: string) => void;
    stopTracking: () => void;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | null>(null);

export const OrderTrackingProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = useSupabase();
    const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
    const [deliveryPos, setDeliveryPos] = useState<Lating | null>(null);
    const [currentStatus, setCurrentStatus] = useState<OrderStatus | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    const startTracking = useCallback((orderid: string) => {
        setTrackingOrderId(orderid);
        setIsTracking(true);
    }, []);

    const stopTracking = useCallback(() => {
        setTrackingOrderId(null);
        setIsTracking(false);
        setDeliveryPos(null);
        setCurrentStatus(null);
    }, []);

    useEffect(() => {
        if (!trackingOrderId) return;

        const channel = supabase.channel(`order_tracking_${trackingOrderId}`);

        channel
            .on("broadcast", { event: "position-update" }, ({ payload }) => {
                setDeliveryPos({ latitude: payload.latitude, longitude: payload.longitude });
                if (payload.status) setCurrentStatus(payload.status);
            })
            .on("broadcast", { event: "status-update" }, ({ payload }) => {
                setCurrentStatus(payload.status);
            })
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${trackingOrderId}` },
                (payload) => {
                    const row = payload.new as any;
                    setCurrentStatus(row.status as OrderStatus);
                    if (row.delivery_lat && row.delivery_lng) {
                        setDeliveryPos({ latitude: row.delivery_lat, longitude: row.delivery_lng });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [trackingOrderId, supabase]);

    useEffect(() => {
        if (currentStatus === OrderStatus.DELIVERED) {
            const timer = setTimeout(() => {
                stopTracking();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStatus, stopTracking]);

    return (
        <OrderTrackingContext.Provider value={{ deliveryPos, currentStatus, isTracking, startTracking, stopTracking }}>
            {children}
        </OrderTrackingContext.Provider>
    );
};

export const useOrderTracking = () => {
    const context = useContext(OrderTrackingContext);
    if (!context) throw new Error("useOrderTracking debe usarse dentro de OrderTrackingProvider");
    return context;
};
